"use client";

import { Button } from "@/components/ui/button";
import { EmissionFactorSelect } from "@/modules/emission-factors/components/emission-factor-select";
import { EmissionsPreview } from "@/modules/emission-factors/components/emissions-preview";
import type { EmissionFactorOption } from "@/modules/activities/types";

interface Scope3ActivityFormShellProps {
    factors: EmissionFactorOption[];
    isSubmitting: boolean;
    selectedFactorId: string;
    onFactorChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    children: React.ReactNode;
    submitLabel?: string;
    preview?: { value: number; unit: string };
}

export function Scope3ActivityFormShell({
    factors,
    isSubmitting,
    selectedFactorId,
    onFactorChange,
    onSubmit,
    children,
    submitLabel = "Add",
    preview,
}: Scope3ActivityFormShellProps) {
    const selectedFactor = factors.find((f) => f.id === selectedFactorId);

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {children}
            <EmissionFactorSelect
                factors={factors}
                value={selectedFactorId}
                onChange={onFactorChange}
            />
            {preview && (
                <EmissionsPreview
                    value={preview.value}
                    unit={preview.unit}
                    factor={selectedFactor}
                />
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : submitLabel}
            </Button>
        </form>
    );
}
