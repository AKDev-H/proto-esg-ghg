import { readStoredExcel } from "@/lib/excel-import/storage";
import {
    excelActivitiesToSummaryInput,
    parseGhgExcelWorkbook,
} from "@/modules/reports/excel/parser";
import { buildReportSummaryFromActivities } from "@/modules/reports/services/build-report-summary";
import type { ReportSummaryPayload } from "@/modules/reports/services/build-report-summary";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
    buildActionPlanInputFromSummary,
    generateGHGActionPlan,
} from "@/modules/reports/services/generate-ghg-action-plan";

export type ReportWithOrg = Prisma.ReportGetPayload<{
    include: { organization: true };
}>;

type ExcelImportForSummary = {
    filePath: string;
    parsedSummary: Prisma.JsonValue | null;
};

function asRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function asNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asScope3Categories(value: unknown): ReportSummaryPayload["scope3Categories"] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return null;
            const record = item as Record<string, unknown>;
            const categoryKey =
                typeof record.categoryKey === "string" ? record.categoryKey : "";
            const category =
                typeof record.category === "string" ? record.category : categoryKey;
            if (!categoryKey && !category) return null;
            return {
                categoryKey,
                category,
                emissions: asNumber(record.emissions),
                percentage: asNumber(record.percentage),
                activityCount: asNumber(record.activityCount),
            };
        })
        .filter((item): item is ReportSummaryPayload["scope3Categories"][number] =>
            Boolean(item),
        );
}

function asTopActivities(value: unknown): ReportSummaryPayload["topActivities"] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) return null;
            const record = item as Record<string, unknown>;
            return {
                activityType:
                    typeof record.activityType === "string"
                        ? record.activityType
                        : "Imported activity",
                emissions: asNumber(record.emissions),
                scope: typeof record.scope === "string" ? record.scope : "scope3",
            };
        })
        .filter((item): item is ReportSummaryPayload["topActivities"][number] =>
            Boolean(item),
        );
}

function buildSummaryFromParsedSummary(
    parsedSummary: Prisma.JsonValue | null,
    country: "US" | "MY",
    industryType?: string,
): ReportSummaryPayload | null {
    const summary = asRecord(parsedSummary);
    if (!summary) return null;

    const totalEmissions = asNumber(summary.totalEmissions);
    const scope1Emissions = asNumber(summary.scope1Emissions);
    const scope2Emissions = asNumber(summary.scope2Emissions);
    const scope3Emissions = asNumber(summary.scope3Emissions);
    const activityCount = asNumber(summary.activityCount);
    const total = totalEmissions || 1;
    const scope3Categories = asScope3Categories(summary.scope3Categories);
    const topActivities = asTopActivities(summary.topActivities);
    const actionPlan = generateGHGActionPlan(
        buildActionPlanInputFromSummary({
            totalEmissions,
            scope1Emissions,
            scope2Emissions,
            scope3Emissions,
            scope3Categories,
            topActivities,
            activityCount,
            country,
            industryType,
        }),
    );

    return {
        totalEmissions,
        scope1Emissions,
        scope2Emissions,
        scope3Emissions,
        activityCount,
        scope1Percentage: (scope1Emissions / total) * 100,
        scope2Percentage: (scope2Emissions / total) * 100,
        scope3Percentage: (scope3Emissions / total) * 100,
        scope3Categories,
        topActivities,
        actionPlan,
    };
}

export async function buildSummaryForExcelImport(
    excelImport: ExcelImportForSummary,
    country: "US" | "MY",
    industryType?: string,
): Promise<ReportSummaryPayload> {
    try {
        if (excelImport.filePath) {
            const buffer = await readStoredExcel(excelImport.filePath);
            const parsed = parseGhgExcelWorkbook(buffer);
            return buildReportSummaryFromActivities(
                excelActivitiesToSummaryInput(parsed.activities),
                country,
                industryType,
            );
        }
    } catch (error) {
        console.error("Failed to read stored Excel file; using parsed summary", error);
    }

    const fallback = buildSummaryFromParsedSummary(
        excelImport.parsedSummary,
        country,
        industryType,
    );
    if (fallback) return fallback;

    throw new Error("Stored Excel file is unavailable and no parsed summary exists");
}

export async function buildSummaryForReport(
    report: ReportWithOrg,
): Promise<ReportSummaryPayload> {
    if (report.dataSource === "excel" && report.excelImportId) {
        const excelImport = await prisma.excelImport.findUnique({
            where: { id: report.excelImportId },
        });

        if (excelImport) {
            return buildSummaryForExcelImport(
                excelImport,
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
