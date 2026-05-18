"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productProcessingSchema } from "@/modules/scope3/schemas";
import type { ProductProcessingFormData, ProcessingType } from "@/modules/scope3/types";

interface ProductProcessingFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function ProductProcessingForm({ factors, onSuccess }: ProductProcessingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<ProductProcessingFormData>({
        resolver: zodResolver(productProcessingSchema),
        defaultValues: { processingType: "assembly" },
    });

    const onSubmit = async (data: ProductProcessingFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat10_product_processing",
                    activityType: "product_processing",
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
                        scope3ProductProcessing: {
                            create: {
                                productType: data.productType,
                                processingType: data.processingType,
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
                    <Label>Product Type</Label>
                    <Input {...form.register("productType")} placeholder="e.g., Electronics" />
                </div>
                <div className="space-y-2">
                    <Label>Processing Type</Label>
                    <Select value={form.watch("processingType")} onValueChange={(v) => form.setValue("processingType", v as ProcessingType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assembly">Assembly</SelectItem>
                            <SelectItem value="fabrication">Fabrication</SelectItem>
                            <SelectItem value="refining">Refining</SelectItem>
                            <SelectItem value="packaging">Packaging</SelectItem>
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add"}
            </Button>
        </form>
    );
}