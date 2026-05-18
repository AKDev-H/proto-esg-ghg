"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transportSchema } from "@/modules/scope3/schemas";
import type { TransportFormData, TransportMode } from "@/modules/scope3/types";

interface TransportFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    category: "cat4_upstream_transport" | "cat9_downstream_transport";
    onSuccess?: () => void;
}

export function TransportForm({ factors, category, onSuccess }: TransportFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<TransportFormData>({
        resolver: zodResolver(transportSchema),
        defaultValues: { mode: "truck", transportCategory: "upstream" },
    });

    const onSubmit = async (data: TransportFormData) => {
        setIsSubmitting(true);
        try {
            const tonKm = data.weight * data.distance;
            const transportCategory = category === "cat4_upstream_transport" ? "upstream" : "downstream";
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: category,
                    activityType: "transport",
                    inputValue: tonKm,
                    inputUnit: "ton-km",
                    emissionFactorId: selectedFactor || undefined,
                }),
            });

            if (res.ok) {
                const activity = await res.json();
                await fetch(`/api/activities/${activity.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scope3Transportation: {
                            create: {
                                transportMode: data.mode,
                                weight: data.weight,
                                distance: data.distance,
                                distanceUnit: "km",
                                transportCategory,
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