"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productProcessingSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { ProductProcessingFormData, ProcessingType } from "@/modules/scope3/types";

interface ProductProcessingFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function ProductProcessingForm({ factors, onSuccess }: ProductProcessingFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<ProductProcessingFormData>({
        resolver: zodResolver(productProcessingSchema),
        defaultValues: { processingType: "assembly" },
    });

    const onSubmit = async (data: ProductProcessingFormData) => {
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat10_product_processing",
                activityType: "product_processing",
                inputValue: data.quantity,
                inputUnit: data.unit,
            },
            {
                scope3ProductProcessing: {
                    create: {
                        productType: data.productType,
                        processingType: data.processingType,
                        quantity: data.quantity,
                        unit: data.unit,
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
        </Scope3ActivityFormShell>
    );
}
