"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upstreamLeasedSchema } from "@/modules/scope3/schemas";
import type { UpstreamLeasedFormData, AssetType, LeaseType } from "@/modules/scope3/types";

interface UpstreamLeasedFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function UpstreamLeasedForm({ factors, onSuccess }: UpstreamLeasedFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<UpstreamLeasedFormData>({
        resolver: zodResolver(upstreamLeasedSchema),
        defaultValues: { assetType: "equipment", leaseType: "operational" },
    });

    const onSubmit = async (data: UpstreamLeasedFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat8_upstream_leased",
                    activityType: "upstream_leased",
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
                        scope3UpstreamLeased: {
                            create: {
                                assetType: data.assetType,
                                leaseType: data.leaseType,
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
                    <Label>Asset Type</Label>
                    <Select value={form.watch("assetType")} onValueChange={(v) => form.setValue("assetType", v as AssetType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="vehicle">Vehicle</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="building">Building</SelectItem>
                            <SelectItem value="machinery">Machinery</SelectItem>
                        </SelectContent>
                    </Select>
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