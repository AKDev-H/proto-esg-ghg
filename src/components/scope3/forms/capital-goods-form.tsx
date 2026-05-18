"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { capitalGoodsSchema } from "@/modules/scope3/schemas";
import type { CapitalGoodsFormData, EquipmentType } from "@/modules/scope3/types";

interface CapitalGoodsFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

function calculatePreview(value: number, unit: string, factor: { factorValue: number; activityUnit: string } | undefined): string {
    if (!factor || !value) return "—";
    return `${(value * factor.factorValue / 1000).toFixed(3)} tCO2e (${factor.activityUnit})`;
}

export function CapitalGoodsForm({ factors, onSuccess }: CapitalGoodsFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<CapitalGoodsFormData>({
        resolver: zodResolver(capitalGoodsSchema),
        defaultValues: { equipmentType: "machinery" },
    });

    const onSubmit = async (data: CapitalGoodsFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat2_capital_goods",
                    activityType: "capital_goods",
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
                        scope3CapitalGoods: {
                            create: {
                                equipmentType: data.equipmentType,
                                quantity: data.quantity,
                                unit: data.unit,
                                purchaseYear: data.purchaseYear,
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

    const selectedFactorData = factors.find(f => f.id === selectedFactor);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Equipment Type</Label>
                    <Select value={form.watch("equipmentType")} onValueChange={(v) => form.setValue("equipmentType", v as EquipmentType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="machinery">Machinery</SelectItem>
                            <SelectItem value="vehicle">Vehicle</SelectItem>
                            <SelectItem value="building">Building</SelectItem>
                            <SelectItem value="computer">Computer</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Purchase Year</Label>
                    <Input type="number" {...form.register("purchaseYear", { valueAsNumber: true })} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" step="0.01" {...form.register("quantity", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input {...form.register("unit")} placeholder="e.g., units" />
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
            <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Emissions:</span>
                    <span className="font-medium">
                        {calculatePreview(form.watch("quantity") || 0, form.watch("unit") || "units", selectedFactorData)}
                    </span>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add"}
            </Button>
        </form>
    );
}