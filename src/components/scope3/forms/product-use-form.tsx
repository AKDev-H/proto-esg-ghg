"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productUseSchema } from "@/modules/scope3/schemas";
import type { ProductUseFormData } from "@/modules/scope3/types";

interface ProductUseFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function ProductUseForm({ factors, onSuccess }: ProductUseFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<ProductUseFormData>({
        resolver: zodResolver(productUseSchema),
    });

    const onSubmit = async (data: ProductUseFormData) => {
        setIsSubmitting(true);
        try {
            const annualKwh = data.annualEnergyKwh * (data.unitsSold || 0);
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat11_product_use",
                    activityType: "product_use",
                    inputValue: annualKwh,
                    inputUnit: "kWh",
                    emissionFactorId: selectedFactor || undefined,
                }),
            });

            if (res.ok) {
                const activity = await res.json();
                await fetch(`/api/activities/${activity.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scope3ProductUse: {
                            create: {
                                productType: data.productType,
                                annualEnergyKwh: data.annualEnergyKwh,
                                lifetimeYears: data.lifetimeYears,
                                unitsSold: data.unitsSold,
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
                <Label>Product Type</Label>
                <Input {...form.register("productType")} placeholder="e.g., HVAC System" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Annual Energy (kWh/unit)</Label>
                    <Input type="number" step="0.01" {...form.register("annualEnergyKwh", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label>Lifetime (years)</Label>
                    <Input type="number" {...form.register("lifetimeYears", { valueAsNumber: true })} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Units Sold</Label>
                <Input type="number" {...form.register("unitsSold", { valueAsNumber: true })} />
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