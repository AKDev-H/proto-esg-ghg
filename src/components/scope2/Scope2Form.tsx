"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { electricitySchema } from "@/modules/scope2/schemas";
import { EmissionFactorSelect } from "@/modules/emission-factors/components/emission-factor-select";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { ElectricityFormData } from "@/modules/scope2/types";

interface Scope2FormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function Scope2Form({ factors, onSuccess }: Scope2FormProps) {
    const { isSubmitting, submit } = useCreateActivityForm({ onSuccess });

    const electricityFactors = factors.filter(
        (f) => f.activityType === "electricity",
    );

    const form = useForm<ElectricityFormData>({
        resolver: zodResolver(electricitySchema),
        defaultValues: {
            consumption: 0,
            unit: "kWh",
            gridRegion: "",
        },
    });

    useEffect(() => {
        if (electricityFactors.length === 1) {
            form.setValue("emissionFactorId", electricityFactors[0].id as any);
        }
    }, []);

    const onSubmit = async (data: ElectricityFormData) => {
        const ok = await submit(
            {
                scope: "scope2",
                activityType: "electricity",
                inputValue: data.consumption,
                inputUnit: data.unit,
                emissionFactorId: data.emissionFactorId,
            },
            {
                scope2Electricity: {
                    create: {
                        consumption: data.consumption,
                        unit: data.unit,
                        gridRegion: data.gridRegion,
                    },
                },
            },
        );
        if (ok) form.reset();
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label required error={!!form.formState.errors.consumption}>
                    Electricity Consumption
                </Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        step="0.01"
                        error={!!form.formState.errors.consumption}
                        {...form.register("consumption", { valueAsNumber: true })}
                        placeholder="Enter consumption"
                    />
                    <Select
                        value={form.watch("unit")}
                        onValueChange={(v) =>
                            form.setValue("unit", v as "kWh" | "MWh" | "MJ")
                        }
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kWh">kWh</SelectItem>
                            <SelectItem value="MWh">MWh</SelectItem>
                            <SelectItem value="MJ">MJ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Grid Region (optional)</Label>
                <Input
                    {...form.register("gridRegion")}
                    placeholder="e.g., PJM, California, Peninsula"
                />
            </div>

            <EmissionFactorSelect
                factors={electricityFactors}
                value={form.watch("emissionFactorId") || ""}
                onChange={(v) => form.setValue("emissionFactorId", v)}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Electricity Activity"}
            </Button>
        </form>
    );
}
