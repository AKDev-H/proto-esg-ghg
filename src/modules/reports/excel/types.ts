export interface ExcelActivityRow {
    scope: string;
    scope3Category: string | null;
    activityType: string;
    description: string;
    inputValue: number;
    inputUnit: string;
    emissionsKgCo2e: number;
    facility: string;
    dataSource: string;
    ghgProtocolReference: string;
}

export interface ExcelOrganizationMeta {
    organizationName: string;
    reportingYear: number;
    country: string;
    methodology: string;
    profile: string;
}

export interface ExcelParseResult {
    meta: ExcelOrganizationMeta;
    activities: ExcelActivityRow[];
    errors: string[];
}

export interface ExcelImportRecord {
    id: string;
    fileName: string;
    reportingYear: number;
    status: string;
    rowCount: number;
    originalSize: number;
    compressedSize: number | null;
    createdAt: string;
}
