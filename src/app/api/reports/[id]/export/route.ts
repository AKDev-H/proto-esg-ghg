import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateESGSummaryPDF } from "@/modules/reports/components/ESGSummaryReport";
import { buildReportSummaryFromActivities } from "@/modules/reports/services/build-report-summary";

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
            include: {
                organization: true,
            },
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

        const reportingYearRecord = await prisma.reportingYear.findFirst({
            where: {
                organizationId: report.organizationId,
                year: report.reportingYear,
            },
        });

        const activities = await prisma.activityData.findMany({
            where: {
                organizationId: report.organizationId,
                ...(reportingYearRecord
                    ? { reportingYearId: reportingYearRecord.id }
                    : {}),
            },
            include: {
                emissionFactor: true,
            },
        });

        const summary = buildReportSummaryFromActivities(
            activities,
            report.organization.country,
            report.organization.industryType,
        );

        const reportData = {
            organization: {
                name: report.organization.name,
                country: report.organization.country,
                industryType: report.organization.industryType,
            },
            reportingYear: report.reportingYear,
            generatedAt:
                report.generatedAt?.toISOString() || new Date().toISOString(),
            ...summary,
            countryContext: {
                benchmark:
                    report.organization.country === "US"
                        ? "EPA Manufacturing Benchmark"
                        : "Malaysia Grid Average",
                unit:
                    report.organization.country === "US"
                        ? "lb CO2e/unit"
                        : "kg CO2e/kWh",
                threshold:
                    report.organization.country === "US"
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
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
