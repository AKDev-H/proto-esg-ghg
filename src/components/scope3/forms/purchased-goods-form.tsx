"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { purchasedGoodsSchema } from "@/modules/scope3/schemas";
import type { PurchasedGoodsFormData } from "@/modules/scope3/types";

interface PurchasedGoodsFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

function calculatePreview(value: number, unit: string, factor: { factorValue: number; activityUnit: string } | undefined): string {
    if (!factor || !value) return "—";
    const conversionMap: Record<string, number> = { kg: 1, lb: 0.453592, ton: 1000 };
    const converted = value * (conversionMap[unit] || 1);
    const emissions = converted * factor.factorValue;
    return `${(emissions / 1000).toFixed(3)} tCO2e (${factor.activityUnit})`;
}

export function PurchasedGoodsForm({ factors, onSuccess }: PurchasedGoodsFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<PurchasedGoodsFormData>({
        resolver: zodResolver(purchasedGoodsSchema),
        defaultValues: { unit: "kg" },
    });

    const onSubmit = async (data: PurchasedGoodsFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat1_purchased_goods",
                    activityType: "purchased_goods",
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
                        scope3PurchasedGoods: {
                            create: {
                                materialType: data.materialType,
                                quantity: data.quantity,
                                unit: data.unit,
                                supplier: data.supplier,
                                supplierCountry: data.supplierCountry,
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
                    <Label>Material Type</Label>
                    <Input {...form.register("materialType")} placeholder="e.g., Steel, Plastic" />
                </div>
                <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Input {...form.register("supplier")} placeholder="Supplier name" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" step="0.01" {...form.register("quantity", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={form.watch("unit")} onValueChange={(v) => form.setValue("unit", v as "kg" | "lb" | "ton")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
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
            <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Emissions:</span>
                    <span className="font-medium">
                        {calculatePreview(form.watch("quantity") || 0, form.watch("unit") || "kg", selectedFactorData)}
                    </span>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add"}
            </Button>
        </form>
    );
}