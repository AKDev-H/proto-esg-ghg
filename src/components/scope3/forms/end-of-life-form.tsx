"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { endOfLifeSchema } from "@/modules/scope3/schemas";
import type { EndOfLifeFormData, DisposalType } from "@/modules/scope3/types";

interface EndOfLifeFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function EndOfLifeForm({ factors, onSuccess }: EndOfLifeFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<EndOfLifeFormData>({
        resolver: zodResolver(endOfLifeSchema),
        defaultValues: { disposalType: "landfill", unit: "kg" },
    });

    const onSubmit = async (data: EndOfLifeFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat12_end_of_life",
                    activityType: "end_of_life",
                    inputValue: data.wasteQuantity,
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
                        scope3EndOfLife: {
                            create: {
                                disposalType: data.disposalType,
                                wasteQuantity: data.wasteQuantity,
                                unit: data.unit,
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
            <div className="space-y-2">
                <Label>Disposal Type</Label>
                <Select value={form.watch("disposalType")} onValueChange={(v) => form.setValue("disposalType", v as DisposalType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="landfill">Landfill</SelectItem>
                        <SelectItem value="incineration">Incineration</SelectItem>
                        <SelectItem value="recycling">Recycling</SelectItem>
                        <SelectItem value="composting">Composting</SelectItem>
                        <SelectItem value="energy_recovery">Energy Recovery</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Waste Quantity</Label>
                    <Input type="number" step="0.01" {...form.register("wasteQuantity", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={form.watch("unit")} onValueChange={(v) => form.setValue("unit", v as "kg" | "ton")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ton">ton</SelectItem>
                        </SelectContent>
                    </Select>
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