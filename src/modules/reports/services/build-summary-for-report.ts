import { readStoredExcel } from "@/lib/excel-import/storage";
import {
    excelActivitiesToSummaryInput,
    parseGhgExcelWorkbook,
} from "@/modules/reports/excel/parser";
import { buildReportSummaryFromActivities } from "@/modules/reports/services/build-report-summary";
import type { ReportSummaryPayload } from "@/modules/reports/services/build-report-summary";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ReportWithOrg = Prisma.ReportGetPayload<{
    include: { organization: true };
}>;

export async function buildSummaryForReport(
    report: ReportWithOrg,
): Promise<ReportSummaryPayload> {
    if (report.dataSource === "excel" && report.excelImportId) {
        const excelImport = await prisma.excelImport.findUnique({
            where: { id: report.excelImportId },
        });

        if (excelImport?.filePath) {
            const buffer = await readStoredExcel(excelImport.filePath);
            const parsed = parseGhgExcelWorkbook(buffer);
            return buildReportSummaryFromActivities(
                excelActivitiesToSummaryInput(parsed.activities),
                report.organization.country,
                report.organization.industryType,
            );
        }
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
    });

    return buildReportSummaryFromActivities(
        activities,
        report.organization.country,
        report.organization.industryType,
    );
}
