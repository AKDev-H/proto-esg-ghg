"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MATC_FUEL_ENERGY_TYPES } from "@/lib/constants";
import { fuelEnergySchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { FuelEnergyFormData, FuelType, ActivityDescription } from "@/modules/scope3/types";

interface FuelEnergyFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function FuelEnergyForm({ factors, onSuccess }: FuelEnergyFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<FuelEnergyFormData>({
        resolver: zodResolver(fuelEnergySchema),
        defaultValues: {
            fuelType: "electricity",
            activityDescription: "transmission",
            unit: "kWh",
        },
    });

    const onSubmit = async (data: FuelEnergyFormData) => {
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat3_fuel_energy",
                activityType: "clean_room_electricity_upstream",
                inputValue: data.quantity,
                inputUnit: data.unit,
            },
            {
                scope3FuelEnergy: {
                    create: {
                        fuelType: data.fuelType,
                        quantity: data.quantity,
                        unit: data.unit,
                        activityDescription: data.activityDescription,
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
            preview={{
                value: form.watch("quantity") || 0,
                unit: form.watch("unit") || "units",
            }}
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select value={form.watch("fuelType")} onValueChange={(v) => form.setValue("fuelType", v as FuelType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {MATC_FUEL_ENERGY_TYPES.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Activity</Label>
                    <Select value={form.watch("activityDescription")} onValueChange={(v) => form.setValue("activityDescription", v as ActivityDescription)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="extraction">Extraction</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="transmission">Transmission</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" step="0.01" {...form.register("quantity", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={form.watch("unit")} onValueChange={(v) => form.setValue("unit", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kWh">kWh</SelectItem>
                            <SelectItem value="MWh">MWh</SelectItem>
                            <SelectItem value="liter">liter</SelectItem>
                            <SelectItem value="m3">m3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </Scope3ActivityFormShell>
    );
}
