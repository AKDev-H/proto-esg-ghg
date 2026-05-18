import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                organization: true,
                generatedBy: {
                    select: { name: true, email: true },
                },
            },
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        if (report.organizationId !== session.user.organizationId && session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const reportingYearRecord = await prisma.reportingYear.findFirst({
            where: {
                organizationId: report.organizationId,
                year: report.reportingYear,
            },
        });

        const activities = await prisma.activityData.findMany({
            where: {
                organizationId: report.organizationId,
                ...(reportingYearRecord ? { reportingYearId: reportingYearRecord.id } : {}),
            },
            include: {
                emissionFactor: true,
                scope1Vehicles: true,
                scope1Stationary: true,
                scope1Refrigerants: true,
                scope2Electricity: true,
                scope3PurchasedGoods: true,
                scope3Transportation: true,
                scope3ProductUse: true,
                scope3EndOfLife: true,
            },
        });

        const totalEmissions = activities.reduce(
            (sum, a) => sum + (a.calculatedEmissions ?? 0),
            0,
        );

        const byScope = {
            scope1: 0,
            scope2: 0,
            scope3: 0,
        };
        const byCategory: Record<string, { count: number; emissions: number }> = {};

        for (const activity of activities) {
            byScope[activity.scope as keyof typeof byScope] += activity.calculatedEmissions ?? 0;
            if (activity.scope === "scope3" && activity.scope3Category) {
                if (!byCategory[activity.scope3Category]) {
                    byCategory[activity.scope3Category] = { count: 0, emissions: 0 };
                }
                byCategory[activity.scope3Category].count++;
                byCategory[activity.scope3Category].emissions += activity.calculatedEmissions ?? 0;
            }
        }

        const reportData = {
            id: report.id,
            organization: {
                id: report.organization.id,
                name: report.organization.name,
                country: report.organization.country,
                industryType: report.organization.industryType,
            },
            reportingYear: report.reportingYear,
            reportType: report.reportType,
            status: report.status,
            generatedAt: report.generatedAt?.toISOString(),
            generatedBy: report.generatedBy,
            createdAt: report.createdAt.toISOString(),
            summary: {
                totalEmissionsKg: totalEmissions,
                totalEmissionsTon: (totalEmissions / 1000).toFixed(2),
                activityCount: activities.length,
                byScope: {
                    scope1: {
                        emissionsKg: byScope.scope1,
                        emissionsTon: (byScope.scope1 / 1000).toFixed(2),
                        percentage: totalEmissions > 0 ? ((byScope.scope1 / totalEmissions) * 100).toFixed(1) : "0",
                    },
                    scope2: {
                        emissionsKg: byScope.scope2,
                        emissionsTon: (byScope.scope2 / 1000).toFixed(2),
                        percentage: totalEmissions > 0 ? ((byScope.scope2 / totalEmissions) * 100).toFixed(1) : "0",
                    },
                    scope3: {
                        emissionsKg: byScope.scope3,
                        emissionsTon: (byScope.scope3 / 1000).toFixed(2),
                        percentage: totalEmissions > 0 ? ((byScope.scope3 / totalEmissions) * 100).toFixed(1) : "0",
                    },
                },
                byCategory,
            },
        };

        return NextResponse.json(reportData);
    } catch (error) {
        console.error("Report view error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}