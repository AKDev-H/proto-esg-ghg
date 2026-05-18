"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fuelEnergySchema } from "@/modules/scope3/schemas";
import type { FuelEnergyFormData, FuelType, ActivityDescription } from "@/modules/scope3/types";

interface FuelEnergyFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function FuelEnergyForm({ factors, onSuccess }: FuelEnergyFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<FuelEnergyFormData>({
        resolver: zodResolver(fuelEnergySchema),
        defaultValues: { fuelType: "natural_gas", activityDescription: "extraction" },
    });

    const onSubmit = async (data: FuelEnergyFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat3_fuel_energy",
                    activityType: "fuel_energy",
                    inputValue: data.quantity,
                    inputUnit: data.unit,
                    emissionFactorId: selectedFactor || undefined,
                }),
            });

            if (res.ok) {
                const activity = await res.json();
                await fetch(`/api/activities/${activity.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scope3FuelEnergy: {
                            create: {
                                fuelType: data.fuelType,
                                quantity: data.quantity,
                                unit: data.unit,
                                activityDescription: data.activityDescription,
                            },
                        },
                    }),
                });
                router.refresh();
                form.reset();
                setSelectedFactor("");
                onSuccess?.();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select value={form.watch("fuelType")} onValueChange={(v) => form.setValue("fuelType", v as FuelType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="natural_gas">Natural Gas</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="coal">Coal</SelectItem>
                            <SelectItem value="electricity">Electricity</SelectItem>
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
                    <Input {...form.register("unit")} placeholder="e.g., liter, kWh" />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Emission Factor</Label>
                <Select value={selectedFactor} onValueChange={setSelectedFactor}>
                    <SelectTrigger><SelectValue placeholder="Select emission factor" /></SelectTrigger>
                    <SelectContent>
                        {factors.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                                {f.activityType} - {f.factorValue} kgCO2e/{f.activityUnit}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add"}
            </Button>
        </form>
    );
}