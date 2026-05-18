"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeCommutingSchema } from "@/modules/scope3/schemas";
import type { EmployeeCommutingFormData, CommuteTransportMode } from "@/modules/scope3/types";

interface EmployeeCommutingFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function EmployeeCommutingForm({ factors, onSuccess }: EmployeeCommutingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<EmployeeCommutingFormData>({
        resolver: zodResolver(employeeCommutingSchema),
        defaultValues: { transportMode: "car" },
    });

    const onSubmit = async (data: EmployeeCommutingFormData) => {
        setIsSubmitting(true);
        try {
            const totalKm = data.averageDistancePerDay * data.daysPerYear * data.numberOfEmployees;
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat7_employee_commuting",
                    activityType: "commuting",
                    inputValue: totalKm,
                    inputUnit: "km",
                    emissionFactorId: selectedFactor || undefined,
                }),
            });

            if (res.ok) {
                const activity = await res.json();
                await fetch(`/api/activities/${activity.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scope3EmployeeCommuting: {
                            create: {
                                transportMode: data.transportMode,
                                averageDistancePerDay: data.averageDistancePerDay,
                                daysPerYear: data.daysPerYear,
                                numberOfEmployees: data.numberOfEmployees,
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
                    <Label>Transport Mode</Label>
                    <Select value={form.watch("transportMode")} onValueChange={(v) => form.setValue("transportMode", v as CommuteTransportMode)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="bus">Bus</SelectItem>
                            <SelectItem value="train">Train</SelectItem>
                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Number of Employees</Label>
                    <Input type="number" {...form.register("numberOfEmployees", { valueAsNumber: true })} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Avg Distance/Day (km)</Label>
                    <Input type="number" step="0.01" {...form.register("averageDistancePerDay", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label>Days/Year</Label>
                    <Input type="number" {...form.register("daysPerYear", { valueAsNumber: true })} />
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