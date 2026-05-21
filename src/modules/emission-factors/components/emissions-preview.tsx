"use client";

import { calculateEmissions } from "@/modules/calculations/services/calculations";
import { formatTonCO2e } from "@/lib/emissions-display";
import type { EmissionFactorOption } from "@/modules/activities/types";

interface EmissionsPreviewProps {
    value: number;
    unit: string;
    factor?: EmissionFactorOption;
}

export function EmissionsPreview({ value, unit, factor }: EmissionsPreviewProps) {
    let preview = "—";

    if (factor && value) {
        try {
            const result = calculateEmissions(
                value,
                unit,
                factor.factorValue,
                factor.activityUnit,
            );
            preview = formatTonCO2e(result.calculatedEmissions);
        } catch {
            preview = "—";
        }
    }

    return (
        <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Emissions:</span>
                <span className="font-medium">{preview}</span>
            </div>
        </div>
    );
}
