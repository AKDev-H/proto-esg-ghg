import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSummaryForReport } from "@/modules/reports/services/build-summary-for-report";
import { generateAIReportSuggestion } from "@/modules/reports/services/ai-suggestion";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const report = await prisma.report.findUnique({
            where: { id },
            include: { organization: true },
        });

        if (!report) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 },
            );
        }

        if (
            report.organizationId !== session.user.organizationId &&
            session.user.role !== "super_admin"
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const summary = await buildSummaryForReport(report);
        const suggestion = await generateAIReportSuggestion({
            totalEmissions: summary.totalEmissions,
            scope1Emissions: summary.scope1Emissions,
            scope2Emissions: summary.scope2Emissions,
            scope3Emissions: summary.scope3Emissions,
            scope1Percentage: summary.scope1Percentage,
            scope2Percentage: summary.scope2Percentage,
            scope3Percentage: summary.scope3Percentage,
            country: report.organization.country,
            industryType: report.organization.industryType,
        });

        return NextResponse.json({ suggestion });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
