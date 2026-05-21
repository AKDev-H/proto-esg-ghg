import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildReportSummaryFromActivities } from "@/modules/reports/services/build-report-summary";

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

        const summary = buildReportSummaryFromActivities(
            activities,
            report.organization.country,
            report.organization.industryType,
        );

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
                totalEmissionsKg: summary.totalEmissions,
                totalEmissionsTon: (summary.totalEmissions / 1000).toFixed(2),
                activityCount: summary.activityCount,
                byScope: {
                    scope1: {
                        emissionsKg: summary.scope1Emissions,
                        emissionsTon: (summary.scope1Emissions / 1000).toFixed(2),
                        percentage: summary.totalEmissions > 0 ? ((summary.scope1Emissions / summary.totalEmissions) * 100).toFixed(1) : "0",
                    },
                    scope2: {
                        emissionsKg: summary.scope2Emissions,
                        emissionsTon: (summary.scope2Emissions / 1000).toFixed(2),
                        percentage: summary.totalEmissions > 0 ? ((summary.scope2Emissions / summary.totalEmissions) * 100).toFixed(1) : "0",
                    },
                    scope3: {
                        emissionsKg: summary.scope3Emissions,
                        emissionsTon: (summary.scope3Emissions / 1000).toFixed(2),
                        percentage: summary.totalEmissions > 0 ? ((summary.scope3Emissions / summary.totalEmissions) * 100).toFixed(1) : "0",
                    },
                },
                byCategory: Object.fromEntries(
                    summary.scope3Categories.map((c) => [
                        c.category,
                        { count: c.activityCount, emissions: c.emissions },
                    ]),
                ),
            },
            actionPlan: summary.actionPlan,
        };

        return NextResponse.json(reportData);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}