"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transportSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { TransportFormData, TransportMode } from "@/modules/scope3/types";

interface TransportFormProps {
    factors: EmissionFactorOption[];
    category?: "cat4_upstream_transport" | "cat9_downstream_transport";
    onSuccess?: () => void;
}

export function TransportForm({ factors, category = "cat4_upstream_transport", onSuccess }: TransportFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<TransportFormData>({
        resolver: zodResolver(transportSchema),
        defaultValues: { mode: "truck", transportCategory: "upstream" },
    });

    const onSubmit = async (data: TransportFormData) => {
        const tonKm = data.weight * data.distance;
        const transportCategory = category === "cat4_upstream_transport" ? "upstream" : "downstream";

        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: category,
                activityType: data.mode,
                inputValue: tonKm,
                inputUnit: "ton-km",
            },
            {
                scope3Transportation: {
                    create: {
                        transportMode: data.mode,
                        weight: data.weight,
                        distance: data.distance,
                        distanceUnit: "km",
                        transportCategory,
                    },
                },
            },
        );

        if (ok) {
            form.reset();
            resetFactor();
        }
    };

    return (
        <Scope3ActivityFormShell
            factors={factors}
            isSubmitting={isSubmitting}
            selectedFactorId={selectedFactorId}
            onFactorChange={setSelectedFactorId}
            onSubmit={form.handleSubmit(onSubmit)}
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Transport Mode</Label>
                    <Select value={form.watch("mode")} onValueChange={(v) => form.setValue("mode", v as TransportMode)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="rail">Rail</SelectItem>
                            <SelectItem value="ship">Ship</SelectItem>
                            <SelectItem value="aircraft">Aircraft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Weight (ton)</Label>
                    <Input type="number" step="0.01" {...form.register("weight", { valueAsNumber: true })} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input type="number" step="0.01" {...form.register("distance", { valueAsNumber: true })} />
            </div>
        </Scope3ActivityFormShell>
    );
}
