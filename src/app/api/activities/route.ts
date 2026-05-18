import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { activityFilterSchema } from "@/modules/activities/schemas";
import { CONVERSION_FACTORS, STANDARD_UNITS } from "@/lib/constants";
import { calculateEmissions } from "@/modules/calculations/services/calculations";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const params = activityFilterSchema.parse({
            scope: searchParams.get("scope"),
            year: searchParams.get("year"),
            organizationId: searchParams.get("organizationId"),
        });

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (params.scope) where.scope = params.scope;
        if (params.year) {
            const reportingYear = await prisma.reportingYear.findFirst({
                where: {
                    year: parseInt(params.year),
                    organizationId: params.organizationId || session.user.organizationId!,
                },
            });
            if (reportingYear) where.reportingYearId = reportingYear.id;
        }
        if (params.organizationId) where.organizationId = params.organizationId;
        else if (session.user.role !== "super_admin" && session.user.organizationId)
            where.organizationId = session.user.organizationId;

        const [activities, total] = await Promise.all([
            prisma.activityData.findMany({
                where,
                include: {
                    facility: true,
                    emissionFactor: true,
                    submittedBy: { select: { id: true, name: true, email: true } },
                    approvedBy: { select: { id: true, name: true, email: true } },
                    scope1Vehicles: true,
                    scope1Stationary: true,
                    scope1Refrigerants: true,
                    scope2Electricity: true,
                    scope3PurchasedGoods: true,
                    scope3Transportation: true,
                    scope3ProductUse: true,
                    scope3EndOfLife: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.activityData.count({ where }),
        ]);

        return NextResponse.json({
            activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Activities GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Session user:", session.user);

        if (!session.user.organizationId && session.user.role !== "super_admin") {
            return NextResponse.json({ error: "No organization associated", debug: session.user }, { status: 400 });
        }

        const body = await request.json();
        console.log("=== FULL REQUEST BODY ===");
        console.log(JSON.stringify(body, null, 2));
        console.log("=========================");
        const {
            scope,
            scope3Category,
            activityType,
            inputValue,
            inputUnit,
            emissionFactorId,
            comments,
            facilityId,
        } = body;

        if (!scope || !activityType || inputValue === undefined) {
            return NextResponse.json({ error: "Missing required fields: scope, activityType, inputValue" }, { status: 400 });
        }

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User must belong to an organization to create activities" }, { status: 400 });
        }

        const organizationId = session.user.organizationId;

        let reportingYearId: string;
        if (body.reportingYearId) {
            reportingYearId = body.reportingYearId;
        } else {
            const currentYear = new Date().getFullYear();
            const reportingYear = await prisma.reportingYear.findFirst({
                where: { organizationId: organizationId, year: currentYear },
            });
            if (reportingYear) {
                reportingYearId = reportingYear.id;
            } else {
                const newYear = await prisma.reportingYear.create({
                    data: { organizationId: organizationId, year: currentYear, status: "draft" },
                });
                reportingYearId = newYear.id;
            }
        }

        let convertedValue = inputValue;
        let convertedUnit = inputUnit;
        let calculatedEmissions: number | null = null;
        let matchedFactorId: string | undefined = emissionFactorId;

        // Auto-match emission factor if not provided
        if (!matchedFactorId) {
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { country: true },
            });
            
            const factorWhere: Record<string, unknown> = {
                category: scope,
                country: org?.country || "US",
                OR: [
                    { isCustom: false },
                    { organizationId: organizationId },
                ],
            };
            
            if (scope3Category) {
                factorWhere.scope3Category = scope3Category;
            }
            
            const matchedFactor = await prisma.emissionFactor.findFirst({
                where: factorWhere,
                orderBy: { isCustom: "desc" },
            });
            
            if (matchedFactor) {
                matchedFactorId = matchedFactor.id;
            }
        }

        console.log("matchedFactorId:", matchedFactorId);
        console.log("inputValue:", inputValue, "inputUnit:", inputUnit);
        
        if (matchedFactorId) {
            const factor = await prisma.emissionFactor.findUnique({
                where: { id: matchedFactorId },
            });
            console.log("Factor found:", factor);
            
            if (factor) {
                try {
                    const result = calculateEmissions(
                        Number(inputValue), 
                        String(inputUnit), 
                        Number(factor.factorValue), 
                        String(scope) as "scope1" | "scope2" | "scope3"
                    );
                    console.log("Calculation result:", result);
                    convertedValue = result.convertedValue;
                    convertedUnit = result.convertedUnit;
                    calculatedEmissions = result.calculatedEmissions;
                } catch (calcError) {
                    console.error("Calculation error:", calcError);
                }
            }
        }

        console.log("=== SAVING TO DB ===");
        console.log("calculatedEmissions:", calculatedEmissions, "type:", typeof calculatedEmissions);
        console.log("convertedValue:", convertedValue);
        console.log("convertedUnit:", convertedUnit);
        console.log("===================");
        
        const activity = await prisma.activityData.create({
            data: {
                organizationId,
                reportingYearId,
                facilityId: facilityId || undefined,
                scope,
                scope3Category: scope3Category || undefined,
                activityType,
                inputValue,
                inputUnit,
                convertedValue,
                convertedUnit,
                emissionFactorId: matchedFactorId || undefined,
                calculatedEmissions: calculatedEmissions as number | undefined,
                comments: comments || undefined,
            },
            include: {
                emissionFactor: true,
                facility: true,
                submittedBy: { select: { id: true, name: true, email: true } },
                approvedBy: { select: { id: true, name: true, email: true } },
            },
        });

        await prisma.auditLog.create({
            data: {
                organizationId: organizationId,
                userId: session.user.id,
                action: "create",
                entityType: "ActivityData",
                entityId: activity.id,
                newValue: { scope, activityType },
            },
        });

        console.log("=== BEFORE RETURN ===");
        console.log("Returning activity with emissions:", activity.calculatedEmissions);
        console.log("======================");
        
        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error("Activities POST error:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}