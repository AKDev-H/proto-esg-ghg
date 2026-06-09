import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canGenerateReports } from "@/lib/permissions";
import { buildSummaryForExcelImport } from "@/modules/reports/services/build-summary-for-report";
import { generateESGSummaryPDF } from "@/modules/reports/components/ESGSummaryReport";

const bodySchema = z.object({
    importId: z.string().min(1),
    reportingYear: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!canGenerateReports(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { importId, reportingYear } = bodySchema.parse(await request.json());

        const excelImport = await prisma.excelImport.findFirst({
            where: {
                id: importId,
                organizationId: session.user.organizationId,
                status: "completed",
            },
        });

        if (!excelImport) {
            return NextResponse.json({ error: "Excel import not found" }, { status: 404 });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: session.user.organizationId },
        });

        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const summary = await buildSummaryForExcelImport(
            excelImport,
            organization.country,
            organization.industryType,
        );

        const year = reportingYear ?? excelImport.reportingYear;

        const reportData = {
            organization: {
                name: organization.name,
                country: organization.country,
                industryType: organization.industryType,
            },
            reportingYear: year,
            generatedAt: new Date().toISOString(),
            ...summary,
            countryContext: {
                benchmark:
                    organization.country === "US"
                        ? "EPA Manufacturing Benchmark"
                        : "Malaysia Grid Average",
                unit:
                    organization.country === "US" ? "lb CO2e/unit" : "kg CO2e/kWh",
                threshold:
                    organization.country === "US"
                        ? { low: 25, medium: 50, high: 50 }
                        : { low: 20, medium: 40, high: 40 },
            },
        };

        const pdfBlob = await generateESGSummaryPDF(reportData);
        const pdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString("base64");

        const report = await prisma.report.create({
            data: {
                organizationId: session.user.organizationId,
                reportingYear: year,
                reportType: "esg_summary",
                status: "completed",
                dataSource: "excel",
                excelImportId: excelImport.id,
                filePath: excelImport.filePath,
                generatedById: session.user.id,
                generatedAt: new Date(),
            },
        });

        await prisma.auditLog.create({
            data: {
                organizationId: session.user.organizationId,
                userId: session.user.id,
                action: "generate_report",
                entityType: "Report",
                entityId: report.id,
                newValue: {
                    reportingYear: year,
                    reportType: "esg_summary",
                    dataSource: "excel",
                    excelImportId: excelImport.id,
                    totalEmissions: summary.totalEmissions,
                },
            },
        });

        return NextResponse.json(
            {
                id: report.id,
                pdfBase64,
                fileName: `ESG_Summary_Report_${year}_from_excel.pdf`,
                summary: {
                    totalEmissions: summary.totalEmissions,
                    activityCount: summary.activityCount,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }
        console.error("Failed to generate report from Excel", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
