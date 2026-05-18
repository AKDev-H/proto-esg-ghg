"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { wasteSchema } from "@/modules/scope3/schemas";
import type { WasteFormData, WasteType, DisposalMethod } from "@/modules/scope3/types";

interface WasteFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function WasteForm({ factors, onSuccess }: WasteFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<WasteFormData>({
        resolver: zodResolver(wasteSchema),
        defaultValues: { wasteType: "non_hazardous", disposalMethod: "landfill", unit: "kg" },
    });

    const onSubmit = async (data: WasteFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat5_waste",
                    activityType: "waste",
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
                        scope3Waste: {
                            create: {
                                wasteType: data.wasteType,
                                disposalMethod: data.disposalMethod,
                                quantity: data.quantity,
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Waste Type</Label>
                    <Select value={form.watch("wasteType")} onValueChange={(v) => form.setValue("wasteType", v as WasteType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hazardous">Hazardous</SelectItem>
                            <SelectItem value="non_hazardous">Non-Hazardous</SelectItem>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="plastic">Plastic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Disposal Method</Label>
                    <Select value={form.watch("disposalMethod")} onValueChange={(v) => form.setValue("disposalMethod", v as DisposalMethod)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="landfill">Landfill</SelectItem>
                            <SelectItem value="incineration">Incineration</SelectItem>
                            <SelectItem value="recycling">Recycling</SelectItem>
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