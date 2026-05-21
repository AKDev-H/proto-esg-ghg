"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { endOfLifeSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { EndOfLifeFormData, DisposalType } from "@/modules/scope3/types";

interface EndOfLifeFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function EndOfLifeForm({ factors, onSuccess }: EndOfLifeFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<EndOfLifeFormData>({
        resolver: zodResolver(endOfLifeSchema),
        defaultValues: { disposalType: "landfill", unit: "kg" },
    });

    const onSubmit = async (data: EndOfLifeFormData) => {
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat12_end_of_life",
                activityType: "end_of_life",
                inputValue: data.wasteQuantity,
                inputUnit: data.unit,
            },
            {
                scope3EndOfLife: {
                    create: {
                        disposalType: data.disposalType,
                        wasteQuantity: data.wasteQuantity,
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
                value: form.watch("wasteQuantity") || 0,
                unit: form.watch("unit") || "kg",
            }}
        >
            <div className="space-y-2">
                <Label>Disposal Type</Label>
                <Select value={form.watch("disposalType")} onValueChange={(v) => form.setValue("disposalType", v as DisposalType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="landfill">Landfill</SelectItem>
                        <SelectItem value="incineration">Incineration</SelectItem>
                        <SelectItem value="recycling">Recycling</SelectItem>
                        <SelectItem value="composting">Composting</SelectItem>
                        <SelectItem value="energy_recovery">Energy Recovery</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Waste Quantity</Label>
                    <Input type="number" step="0.01" {...form.register("wasteQuantity", { valueAsNumber: true })} />
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
