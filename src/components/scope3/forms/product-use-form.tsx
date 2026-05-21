"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productUseSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { ProductUseFormData } from "@/modules/scope3/types";

interface ProductUseFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function ProductUseForm({ factors, onSuccess }: ProductUseFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<ProductUseFormData>({
        resolver: zodResolver(productUseSchema),
    });

    const onSubmit = async (data: ProductUseFormData) => {
        const totalKwh = data.annualEnergyKwh * data.lifetimeYears * data.unitsSold;

        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat11_product_use",
                activityType: "product_use",
                inputValue: totalKwh,
                inputUnit: "kWh",
            },
            {
                scope3ProductUse: {
                    create: {
                        productType: data.productType,
                        annualEnergyKwh: data.annualEnergyKwh,
                        lifetimeYears: data.lifetimeYears,
                        unitsSold: data.unitsSold,
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
        </Scope3ActivityFormShell>
    );
}
