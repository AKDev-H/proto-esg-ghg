"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { wasteSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { WasteFormData, WasteType, DisposalMethod } from "@/modules/scope3/types";

interface WasteFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function WasteForm({ factors, onSuccess }: WasteFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<WasteFormData>({
        resolver: zodResolver(wasteSchema),
        defaultValues: { wasteType: "non_hazardous", disposalMethod: "landfill", unit: "kg" },
    });

    const onSubmit = async (data: WasteFormData) => {
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat5_waste",
                activityType: "waste",
                inputValue: data.quantity,
                inputUnit: data.unit,
            },
            {
                scope3Waste: {
                    create: {
                        wasteType: data.wasteType,
                        disposalMethod: data.disposalMethod,
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
                unit: form.watch("unit") || "kg",
            }}
        >
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
        </Scope3ActivityFormShell>
    );
}
