import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { activityFilterSchema } from "@/modules/activities/schemas";
import {
    calculateEmissions,
    resolveScope3FactorActivityType,
} from "@/modules/calculations/services/calculations";
import { mapActivityRecord } from "@/modules/activities/services/map-activity-record";
import { canCreateActivities } from "@/lib/permissions";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
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
                    organizationId:
                        params.organizationId || session.user.organizationId!,
                },
            });
            if (reportingYear) where.reportingYearId = reportingYear.id;
        }
        if (params.organizationId) where.organizationId = params.organizationId;
        else if (
            session.user.role !== "super_admin" &&
            session.user.organizationId
        )
            where.organizationId = session.user.organizationId;

        const [activities, total] = await Promise.all([
            prisma.activityData.findMany({
                where,
                include: {
                    facility: true,
                    emissionFactor: true,
                    submittedBy: {
                        select: { id: true, name: true, email: true },
                    },
                    approvedBy: {
                        select: { id: true, name: true, email: true },
                    },
                    scope1Vehicles: true,
                    scope1Stationary: true,
                    scope1Refrigerants: true,
                    scope2Electricity: true,
                    scope3PurchasedGoods: true,
                    scope3CapitalGoods: true,
                    scope3FuelEnergy: true,
                    scope3Transportation: true,
                    scope3Waste: true,
                    scope3BusinessTravel: true,
                    scope3EmployeeCommuting: true,
                    scope3UpstreamLeased: true,
                    scope3ProductProcessing: true,
                    scope3ProductUse: true,
                    scope3EndOfLife: true,
                    scope3DownstreamLeased: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.activityData.count({ where }),
        ]);

        return NextResponse.json({
            activities: activities.map((activity) =>
                mapActivityRecord(activity, activity.scope),
            ),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canCreateActivities(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (
            !session.user.organizationId &&
            session.user.role !== "super_admin"
        ) {
            return NextResponse.json(
                { error: "No organization associated" },
                { status: 400 },
            );
        }

        const body = await request.json();
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
            return NextResponse.json(
                {
                    error: "Missing required fields: scope, activityType, inputValue",
                },
                { status: 400 },
            );
        }

        if (!session.user.organizationId) {
            return NextResponse.json(
                {
                    error: "User must belong to an organization to create activities",
                },
                { status: 400 },
            );
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
                    data: {
                        organizationId: organizationId,
                        year: currentYear,
                        status: "draft",
                    },
                });
                reportingYearId = newYear.id;
            }
        }

        let convertedValue = inputValue;
        let convertedUnit = inputUnit;
        let calculatedEmissions: number | null = null;
        let matchedFactorId: string | undefined = emissionFactorId;

        if (!matchedFactorId) {
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { country: true },
            });

            const country = org?.country || "US";
            const factorActivityType =
                scope === "scope3" && scope3Category
                    ? resolveScope3FactorActivityType(
                          scope3Category,
                          activityType,
                          body.scope3Details,
                      )
                    : activityType;

            const factorWhere: Record<string, unknown> = {
                category: scope,
                country,
                activityType: factorActivityType,
                OR: [{ isCustom: false }, { organizationId: organizationId }],
            };

            if (scope3Category) {
                factorWhere.scope3Category = scope3Category;
            }

            let matchedFactor = await prisma.emissionFactor.findFirst({
                where: factorWhere,
                orderBy: { isCustom: "desc" },
            });

            if (!matchedFactor && scope3Category) {
                matchedFactor = await prisma.emissionFactor.findFirst({
                    where: {
                        category: scope,
                        country,
                        scope3Category,
                        OR: [
                            { isCustom: false },
                            { organizationId: organizationId },
                        ],
                    },
                    orderBy: { isCustom: "desc" },
                });
            }

            if (matchedFactor) {
                matchedFactorId = matchedFactor.id;
            }
        }

        if (matchedFactorId) {
            const factor = await prisma.emissionFactor.findUnique({
                where: { id: matchedFactorId },
            });

            if (factor) {
                try {
                    const result = calculateEmissions(
                        Number(inputValue),
                        String(inputUnit),
                        Number(factor.factorValue),
                        String(factor.activityUnit),
                    );
                    convertedValue = result.convertedValue;
                    convertedUnit = result.convertedUnit;
                    calculatedEmissions = result.calculatedEmissions;
                } catch {}
            }
        }

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

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
