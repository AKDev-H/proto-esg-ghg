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

export interface AIReportSuggestion {
    provider: "gemini" | "rule_based";
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

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
};

function toTonnes(valueKg: number): string {
    return (valueKg / 1000).toFixed(2);
}

function getPriority(input: AIReportSuggestionInput): Pick<
    AIReportSuggestion,
    "priorityScope" | "priorityLevel" | "suggestion"
> {
    const scopes = [
        {
            scope: "Scope 1" as const,
            percentage: input.scope1Percentage,
            suggestion:
                "Prioritize direct fuel, equipment efficiency, fleet transition, and refrigerant management to reduce Scope 1 emissions.",
        },
        {
            scope: "Scope 2" as const,
            percentage: input.scope2Percentage,
            suggestion:
                "Prioritize electricity efficiency, facility energy audits, renewable energy procurement, and onsite solar opportunities to reduce Scope 2 emissions.",
        },
        {
            scope: "Scope 3" as const,
            percentage: input.scope3Percentage,
            suggestion:
                "Prioritize value-chain reduction through supplier engagement, lower-carbon procurement, logistics optimization, product-use efficiency, and end-of-life improvements.",
        },
    ].sort((a, b) => b.percentage - a.percentage);

    const top = scopes[0];
    const spread = top.percentage - scopes[1].percentage;
    const priorityScope = spread < 10 ? "Balanced" : top.scope;
    const priorityLevel =
        top.percentage >= 60 ? "High" : top.percentage >= 35 ? "Medium" : "Low";

    return {
        priorityScope,
        priorityLevel,
        suggestion:
            priorityScope === "Balanced"
                ? "Emissions are distributed across scopes. Improve the largest operational sources first while setting a cross-scope reduction target for Scope 1, Scope 2, and material Scope 3 emissions."
                : top.suggestion,
    };
}

function buildFallbackSuggestion(
    input: AIReportSuggestionInput,
): AIReportSuggestion {
    return {
        provider: "rule_based",
        ...getPriority(input),
        finalValues: {
            totalEmissionsTon: toTonnes(input.totalEmissions),
            scope1EmissionsTon: toTonnes(input.scope1Emissions),
            scope2EmissionsTon: toTonnes(input.scope2Emissions),
            scope3EmissionsTon: toTonnes(input.scope3Emissions),
        },
    };
}

function extractJson(text: string): unknown {
    const trimmed = text.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    return JSON.parse(fenced?.[1] ?? trimmed);
}

function normalizeGeminiSuggestion(
    value: unknown,
    input: AIReportSuggestionInput,
): AIReportSuggestion {
    const fallback = buildFallbackSuggestion(input);
    if (!value || typeof value !== "object") return fallback;

    const data = value as Partial<AIReportSuggestion>;
    const parsedScope = data.priorityScope;
    const parsedLevel = data.priorityLevel;
    const priorityScope: AIReportSuggestion["priorityScope"] =
        parsedScope === "Scope 1" ||
        parsedScope === "Scope 2" ||
        parsedScope === "Scope 3" ||
        parsedScope === "Balanced"
            ? parsedScope
            : fallback.priorityScope;
    const priorityLevel: AIReportSuggestion["priorityLevel"] =
        parsedLevel === "Low" || parsedLevel === "Medium" || parsedLevel === "High"
            ? parsedLevel
            : fallback.priorityLevel;
    const suggestion =
        typeof data.suggestion === "string" && data.suggestion.trim().length > 0
            ? data.suggestion.trim()
            : fallback.suggestion;

    return {
        ...fallback,
        provider: "gemini",
        priorityScope,
        priorityLevel,
        suggestion,
    };
}

export async function generateAIReportSuggestion(
    input: AIReportSuggestionInput,
): Promise<AIReportSuggestion> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

    if (!apiKey) return buildFallbackSuggestion(input);

    const payload = {
        totalEmissionsTon: toTonnes(input.totalEmissions),
        scope1EmissionsTon: toTonnes(input.scope1Emissions),
        scope2EmissionsTon: toTonnes(input.scope2Emissions),
        scope3EmissionsTon: toTonnes(input.scope3Emissions),
        scope1Percentage: Number(input.scope1Percentage.toFixed(1)),
        scope2Percentage: Number(input.scope2Percentage.toFixed(1)),
        scope3Percentage: Number(input.scope3Percentage.toFixed(1)),
        country: input.country,
        industryType: input.industryType ?? "manufacturing",
    };

    const prompt = `You are an ESG/GHG reporting assistant for a manufacturing carbon accounting platform.
Use only the final aggregate emissions values below. Do not infer, mention, or request detailed activity data, suppliers, facilities, category records, or raw measurements.
Return concise JSON only with this exact shape:
{
  "priorityScope": "Scope 1" | "Scope 2" | "Scope 3" | "Balanced",
  "priorityLevel": "Low" | "Medium" | "High",
  "suggestion": "one concise recommendation focused on the scope/factors that need improvement"
}

Final aggregate values:
${JSON.stringify(payload, null, 2)}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 220,
                        responseMimeType: "application/json",
                    },
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            },
        );

        if (!response.ok) return buildFallbackSuggestion(input);

        const geminiResponse = (await response.json()) as GeminiResponse;
        const text = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return buildFallbackSuggestion(input);

        return normalizeGeminiSuggestion(extractJson(text), input);
    } catch {
        return buildFallbackSuggestion(input);
    }
}
