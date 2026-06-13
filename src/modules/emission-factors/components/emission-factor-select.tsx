"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { EmissionFactorOption } from "@/modules/activities/types";

interface EmissionFactorSelectProps {
    factors: EmissionFactorOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
}

export function EmissionFactorSelect({
    factors,
    value,
    onChange,
    label = "Emission Factor",
    required = false,
}: EmissionFactorSelectProps) {
    return (
        <div className="space-y-2">
            <Label required={required}>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select emission factor" />
                </SelectTrigger>
                <SelectContent>
                    {factors.map((factor) => (
                        <SelectItem key={factor.id} value={factor.id}>
                            {factor.activityType} - {factor.factorValue}{" "}
                            kgCO2e/{factor.activityUnit} ({factor.source} -{" "}
                            {factor.country})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
