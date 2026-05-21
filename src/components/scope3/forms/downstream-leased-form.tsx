"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downstreamLeasedSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { DownstreamLeasedFormData, LeaseType } from "@/modules/scope3/types";

interface DownstreamLeasedFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function DownstreamLeasedForm({ factors, onSuccess }: DownstreamLeasedFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<DownstreamLeasedFormData>({
        resolver: zodResolver(downstreamLeasedSchema),
        defaultValues: { leaseType: "operational" },
    });

    const onSubmit = async (data: DownstreamLeasedFormData) => {
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat13_downstream_leased",
                activityType: "downstream_leased",
                inputValue: data.quantity,
                inputUnit: data.unit,
            },
            {
                scope3DownstreamLeased: {
                    create: {
                        productType: data.productType,
                        leaseType: data.leaseType,
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
                    <Input {...form.register("productType")} placeholder="e.g., Equipment" />
                </div>
                <div className="space-y-2">
                    <Label>Lease Type</Label>
                    <Select value={form.watch("leaseType")} onValueChange={(v) => form.setValue("leaseType", v as LeaseType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="operational">Operational</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
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
