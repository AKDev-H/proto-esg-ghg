"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import type { ElectricityFormData } from "@/modules/scope2/types";

interface Scope2FormProps {
    factors: Array<{
        id: string;
        activityType: string;
        factorValue: number;
        activityUnit: string;
    }>;
    onSuccess?: () => void;
}

export function Scope2Form({ factors, onSuccess }: Scope2FormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<ElectricityFormData>({
        resolver: zodResolver(electricitySchema),
        defaultValues: {
            consumption: 0,
            unit: "kWh",
            gridRegion: "",
        },
    });

    const onSubmit = async (data: ElectricityFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope2",
                    activityType: "electricity",
                    inputValue: data.consumption,
                    inputUnit: data.unit,
                    emissionFactorId: data.emissionFactorId,
                }),
            });

            if (response.ok) {
                const activity = await response.json();
                await fetch(`/api/activities/${activity.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scope2Electricity: {
                            create: {
                                gridRegion: data.gridRegion,
                            },
                        },
                    }),
                });
                router.refresh();
                form.reset();
                onSuccess?.();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
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
                        {...form.register("consumption", {
                            valueAsNumber: true,
                        })}
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

            <div className="space-y-2">
                <Label>Emission Factor</Label>
                <Select
                    value={form.watch("emissionFactorId") || ""}
                    onValueChange={(v) => form.setValue("emissionFactorId", v)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select emission factor" />
                    </SelectTrigger>
                    <SelectContent>
                        {factors.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                                {f.activityType} - {f.factorValue} kgCO2e/
                                {f.activityUnit}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {form.formState.isSubmitting
                    ? "Saving..."
                    : "Add Electricity Activity"}
            </Button>
        </form>
    );
}
