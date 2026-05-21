import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateEmissions } from "@/modules/calculations/services/calculations";
import {
    canCreateActivities,
    canManageUsers,
} from "@/lib/permissions";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const activity = await prisma.activityData.findUnique({
            where: { id },
            include: {
                facility: true,
                emissionFactor: true,
                reportingYear: true,
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
                approvalRequests: {
                    include: {
                        requestedBy: { select: { id: true, name: true } },
                        reviewedBy: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!activity) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        return NextResponse.json(activity);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!canCreateActivities(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.activityData.findUnique({
            where: { id },
            include: { emissionFactor: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        let inputValue = body.inputValue ?? existing.inputValue;
        let inputUnit = body.inputUnit ?? existing.inputUnit;
        let convertedValue = existing.convertedValue;
        let convertedUnit = existing.convertedUnit;
        let calculatedEmissions: number | null = existing.calculatedEmissions;

        const factorId = body.emissionFactorId ?? existing.emissionFactorId;
        const needsRecalculation =
            body.inputValue !== undefined ||
            body.emissionFactorId !== undefined ||
            calculatedEmissions == null;

        if (factorId && needsRecalculation) {
            const factor = await prisma.emissionFactor.findUnique({ where: { id: factorId } });
            if (factor) {
                const result = calculateEmissions(
                    Number(inputValue),
                    String(inputUnit),
                    Number(factor.factorValue),
                    String(factor.activityUnit),
                );
                convertedValue = result.convertedValue;
                convertedUnit = result.convertedUnit;
                calculatedEmissions = result.calculatedEmissions;
            }
        }

        const updateData: Record<string, unknown> = {
            inputValue,
            inputUnit,
            convertedValue,
            convertedUnit,
            emissionFactorId: body.emissionFactorId ?? existing.emissionFactorId,
            calculatedEmissions,
            comments: body.comments ?? existing.comments,
            dataStatus: body.dataStatus,
            facilityId: body.facilityId,
        };

        if (body.scope1Vehicles) {
            updateData.scope1Vehicles = {
                deleteMany: {},
                create: body.scope1Vehicles.create,
            };
        }
        if (body.scope1Stationary) {
            updateData.scope1Stationary = {
                deleteMany: {},
                create: body.scope1Stationary.create,
            };
        }
        if (body.scope1Refrigerants) {
            updateData.scope1Refrigerants = {
                deleteMany: {},
                create: body.scope1Refrigerants.create,
            };
        }
        if (body.scope2Electricity) {
            updateData.scope2Electricity = {
                upsert: {
                    create: body.scope2Electricity.create,
                    update: body.scope2Electricity.update || body.scope2Electricity,
                },
            };
        }
        if (body.scope3PurchasedGoods) {
            const purchasedGoodsData = body.scope3PurchasedGoods.create || body.scope3PurchasedGoods;
            updateData.scope3PurchasedGoods = {
                deleteMany: {},
                create: {
                    ...purchasedGoodsData,
                    supplierId: purchasedGoodsData.supplier || purchasedGoodsData.supplierId || null,
                    supplierCountry: purchasedGoodsData.supplierCountry || null,
                },
            };
        }
        if (body.scope3Transportation) {
            updateData.scope3Transportation = {
                deleteMany: {},
                create: body.scope3Transportation.create,
            };
        }
        if (body.scope3ProductUse) {
            updateData.scope3ProductUse = {
                upsert: {
                    create: body.scope3ProductUse.create,
                    update: body.scope3ProductUse,
                },
            };
        }
        if (body.scope3EndOfLife) {
            updateData.scope3EndOfLife = {
                deleteMany: {},
                create: body.scope3EndOfLife.create,
            };
        }

        const updated = await prisma.activityData.update({
            where: { id },
            data: updateData,
            include: {
                emissionFactor: true,
                scope1Vehicles: true,
                scope1Stationary: true,
                scope1Refrigerants: true,
                scope2Electricity: true,
            },
        });

        await prisma.auditLog.create({
            data: {
                organizationId: existing.organizationId,
                userId: session.user.id,
                action: "update",
                entityType: "ActivityData",
                entityId: id,
                oldValue: existing,
                newValue: updated,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!canManageUsers(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;

        const activity = await prisma.activityData.findUnique({ where: { id } });
        if (!activity) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        await prisma.activityData.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                organizationId: activity.organizationId,
                userId: session.user.id,
                action: "delete",
                entityType: "ActivityData",
                entityId: id,
                oldValue: activity,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}