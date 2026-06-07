export interface AIReportSuggestionInput {
    totalEmissions: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    scope1Percentage: number;
    scope2Percentage: number;
    scope3Percentage: number;
    country: "US" | "MY";
    industryType?: string | null;
}

export type AIReportSuggestionProvider = "gemini" | "rule_based";

export type AIReportSuggestionSource = "ai" | "fallback";

export type AIReportSuggestionFallbackReason =
    | "missing_api_key"
    | "request_failed"
    | "empty_response"
    | "invalid_response";

export interface AIReportSuggestion {
    provider: AIReportSuggestionProvider;
    source: AIReportSuggestionSource;
    isFallback: boolean;
    fallbackReason?: AIReportSuggestionFallbackReason;
    priorityScope: "Scope 1" | "Scope 2" | "Scope 3" | "Balanced";
    priorityLevel: "Low" | "Medium" | "High";
    finalValues: {
        totalEmissionsTon: string;
        scope1EmissionsTon: string;
        scope2EmissionsTon: string;
        scope3EmissionsTon: string;
    };
    suggestion: string;
}

export type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
};
