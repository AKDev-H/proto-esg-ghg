"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MATC_EQUIPMENT_TYPES } from "@/lib/constants";
import { capitalGoodsSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { CapitalGoodsFormData, EquipmentType } from "@/modules/scope3/types";

interface CapitalGoodsFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function CapitalGoodsForm({ factors, onSuccess }: CapitalGoodsFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<CapitalGoodsFormData>({
        resolver: zodResolver(capitalGoodsSchema),
        defaultValues: { equipmentType: "machinery", unit: "kg" },
    });

    const onSubmit = async (data: CapitalGoodsFormData) => {
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat2_capital_goods",
                activityType: data.equipmentType,
                inputValue: data.quantity,
                inputUnit: data.unit,
            },
            {
                scope3CapitalGoods: {
                    create: {
                        equipmentType: data.equipmentType,
                        quantity: data.quantity,
                        unit: data.unit,
                        purchaseYear: data.purchaseYear,
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
                    <Label>Equipment Type</Label>
                    <Select value={form.watch("equipmentType")} onValueChange={(v) => form.setValue("equipmentType", v as EquipmentType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {MATC_EQUIPMENT_TYPES.map((e) => (
                                <SelectItem key={e.value} value={e.value}>
                                    {e.label}
                                </SelectItem>
                            ))}
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
                    <Select value={form.watch("unit")} onValueChange={(v) => form.setValue("unit", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ton">ton</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </Scope3ActivityFormShell>
    );
}
