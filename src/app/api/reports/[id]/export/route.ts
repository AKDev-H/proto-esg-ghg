import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateESGSummaryPDF } from "@/modules/reports/components/ESGSummaryReport";
import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants";

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
        const byCategory: Record<string, number> = {};

        for (const activity of activities) {
            byScope[activity.scope as keyof typeof byScope] += activity.calculatedEmissions ?? 0;
            
            if (activity.scope === "scope3" && activity.scope3Category) {
                byCategory[activity.scope3Category] =
                    (byCategory[activity.scope3Category] || 0) + (activity.calculatedEmissions ?? 0);
            }
        }

        const scope3Categories = Object.entries(byCategory)
            .map(([category, emissions]) => ({
                category: SCOPE3_CATEGORY_LABELS[category] || category,
                emissions,
                percentage: totalEmissions > 0 ? (emissions / totalEmissions) * 100 : 0,
                activityCount: activities.filter(a => a.scope === "scope3" && a.scope3Category === category).length,
            }))
            .sort((a, b) => b.emissions - a.emissions);

        const reportData = {
            organization: {
                name: report.organization.name,
                country: report.organization.country,
                industryType: report.organization.industryType,
            },
            reportingYear: report.reportingYear,
            generatedAt: report.generatedAt?.toISOString() || new Date().toISOString(),
            totalEmissions,
            scope1Emissions: byScope.scope1,
            scope2Emissions: byScope.scope2,
            scope3Emissions: byScope.scope3,
            activityCount: activities.length,
            scope1Percentage: totalEmissions > 0 ? (byScope.scope1 / totalEmissions) * 100 : 0,
            scope2Percentage: totalEmissions > 0 ? (byScope.scope2 / totalEmissions) * 100 : 0,
            scope3Percentage: totalEmissions > 0 ? (byScope.scope3 / totalEmissions) * 100 : 0,
            scope3Categories,
            topActivities: [],
            countryContext: {
                benchmark: report.organization.country === "US" ? "EPA Manufacturing Benchmark" : "Malaysia Grid Average",
                unit: report.organization.country === "US" ? "lb CO2e/unit" : "kg CO2e/kWh",
                threshold: report.organization.country === "US"
                    ? { low: 25, medium: 50, high: 50 }
                    : { low: 20, medium: 40, high: 40 },
            },
        };

        const pdfBlob = await generateESGSummaryPDF(reportData);
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");

        return NextResponse.json({
            pdfBase64,
            fileName: `ESG_Report_${report.organization.name.replace(/\s+/g, "_")}_${report.reportingYear}.pdf`,
        });
    } catch (error) {
        console.error("Report export error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}