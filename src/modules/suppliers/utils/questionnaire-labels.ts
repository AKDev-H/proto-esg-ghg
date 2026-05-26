import { QUESTIONNAIRE_TYPES } from "@/lib/constants";
import type { QuestionnaireType } from "@/modules/suppliers/types";

const SHORT_LABELS: Record<QuestionnaireType, string> = {
    carbon_disclosure: "Carbon",
    pcf: "PCF",
    energy_usage: "Energy",
};

export function getQuestionnaireTypeLabel(
    type: QuestionnaireType,
    variant: "full" | "short" = "full",
) {
    if (variant === "short") {
        return SHORT_LABELS[type];
    }

    return (
        QUESTIONNAIRE_TYPES.find((item) => item.value === type)?.label ?? type
    );
}

export function formatSubmissionDate(value: string) {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
