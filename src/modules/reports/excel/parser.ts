import * as XLSX from "xlsx";
import type { ExcelActivityRow, ExcelOrganizationMeta, ExcelParseResult } from "./types";

function cellString(value: unknown): string {
    if (value == null) return "";
    return String(value).trim();
}

function cellNumber(value: unknown): number {
    if (typeof value === "number") return value;
    const parsed = parseFloat(String(value ?? "").replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
}

function parseMetaSheet(sheet: XLSX.WorkSheet): ExcelOrganizationMeta {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
    });

    const map: Record<string, string> = {};
    for (const row of rows) {
        const field = cellString(row.Field ?? row.field).toLowerCase();
        const value = cellString(row.Value ?? row.value);
        if (field) map[field] = value;
    }

    return {
        organizationName: map["organization name"] || map.organization || "Organization",
        reportingYear: parseInt(map["reporting year"] || map.year || "2024", 10) || 2024,
        country: map.country || "US",
        methodology: map.methodology || "GHG Protocol Corporate Standard",
        profile: map.profile || "MATC",
    };
}

function parseActivitiesSheet(sheet: XLSX.WorkSheet): {
    activities: ExcelActivityRow[];
    errors: string[];
} {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
    });
    const activities: ExcelActivityRow[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
        const scope = cellString(row.scope ?? row.Scope).toLowerCase();
        if (!scope || scope.startsWith("scope") === false) {
            if (Object.values(row).some((v) => cellString(v))) {
                errors.push(`Row ${index + 2}: missing or invalid scope`);
            }
            return;
        }

        const emissions = cellNumber(row.emissions_kgco2e ?? row["Emissions (kgCO2e)"]);
        if (emissions <= 0) {
            errors.push(`Row ${index + 2}: emissions must be greater than zero`);
            return;
        }

        activities.push({
            scope,
            scope3Category:
                cellString(row.scope3_category ?? row["Scope 3 Category"]) || null,
            activityType: cellString(row.activity_type ?? row["Activity Type"]) || "unknown",
            description: cellString(row.description ?? row.Description),
            inputValue: cellNumber(row.input_value ?? row["Input Value"]),
            inputUnit: cellString(row.input_unit ?? row["Input Unit"]) || "unit",
            emissionsKgCo2e: emissions,
            facility: cellString(row.facility ?? row.Facility) || "Main Facility",
            dataSource: cellString(row.data_source ?? row["Data Source"]) || "Excel Import",
            ghgProtocolReference:
                cellString(row.ghg_protocol_reference ?? row["GHG Protocol Reference"]) ||
                "Scope inventory",
        });
    });

    return { activities, errors };
}

export function parseGhgExcelWorkbook(buffer: Buffer): ExcelParseResult {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const metaSheet =
        workbook.Sheets["Organization"] ||
        workbook.Sheets["organization"] ||
        workbook.Sheets[workbook.SheetNames[0]];
    const activitiesSheet =
        workbook.Sheets["Activities"] ||
        workbook.Sheets["activities"] ||
        workbook.Sheets[workbook.SheetNames[1]] ||
        metaSheet;

    const meta = parseMetaSheet(metaSheet);
    const { activities, errors } = parseActivitiesSheet(activitiesSheet);

    if (activities.length === 0) {
        errors.push("No valid activity rows found in the Activities sheet");
    }

    return { meta, activities, errors };
}

export function excelActivitiesToSummaryInput(
    activities: ExcelActivityRow[],
): Array<{
    scope: string;
    activityType: string;
    scope3Category: string | null;
    calculatedEmissions: number | null;
}> {
    return activities.map((row) => ({
        scope: row.scope,
        activityType: row.activityType,
        scope3Category: row.scope3Category,
        calculatedEmissions: row.emissionsKgCo2e,
    }));
}
