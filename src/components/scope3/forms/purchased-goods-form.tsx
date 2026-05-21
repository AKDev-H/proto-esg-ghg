"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { purchasedGoodsSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { PurchasedGoodsFormData } from "@/modules/scope3/types";

interface PurchasedGoodsFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function PurchasedGoodsForm({ factors, onSuccess }: PurchasedGoodsFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<PurchasedGoodsFormData>({
        resolver: zodResolver(purchasedGoodsSchema),
        defaultValues: { unit: "kg" },
    });

    const onSubmit = async (data: PurchasedGoodsFormData) => {
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat1_purchased_goods",
                activityType: "purchased_goods",
                inputValue: data.quantity,
                inputUnit: data.unit,
            },
            {
                scope3PurchasedGoods: {
                    create: {
                        materialType: data.materialType,
                        quantity: data.quantity,
                        unit: data.unit,
                        supplier: data.supplier,
                        supplierCountry: data.supplierCountry,
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
                unit: form.watch("unit") || "kg",
            }}
        >
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
        </Scope3ActivityFormShell>
    );
}
