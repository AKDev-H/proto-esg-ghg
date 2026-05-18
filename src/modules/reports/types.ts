// Reports Types

export type ReportType = 'esg_summary' | 'detailed'
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Report {
    id: string
    organizationId: string
    reportingYear: number
    reportType: ReportType
    filePath?: string
    status: ReportStatus
    generatedAt?: string
    generatedById?: string
    createdAt: string
    updatedAt?: string
}

export interface ReportFormData {
    reportingYear: number
    reportType: ReportType
}

export interface ReportFilters {
    reportType?: ReportType
    status?: ReportStatus
    year?: number
}

export interface ReportListItem {
    id: string
    reportingYear: number
    reportType: ReportType
    status: ReportStatus
    createdAt: string
}

export interface ReportDetail extends Report {
    organization?: {
        id: string
        name: string
        country: string
    }
    generatedBy?: {
        id: string
        name: string
        email: string
    }
    summary?: ReportSummary
}

export interface ReportSummary {
    totalEmissions: number
    scope1Emissions: number
    scope2Emissions: number
    scope3Emissions: number
    activityCount: number
}