"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeCommutingSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { EmployeeCommutingFormData, CommuteTransportMode } from "@/modules/scope3/types";

interface EmployeeCommutingFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function EmployeeCommutingForm({ factors, onSuccess }: EmployeeCommutingFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<EmployeeCommutingFormData>({
        resolver: zodResolver(employeeCommutingSchema),
        defaultValues: { transportMode: "car" },
    });

    const onSubmit = async (data: EmployeeCommutingFormData) => {
        const totalKm = data.averageDistancePerDay * data.daysPerYear * data.numberOfEmployees;
        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat7_employee_commuting",
                activityType: "commuting",
                inputValue: totalKm,
                inputUnit: "km",
            },
            {
                scope3EmployeeCommuting: {
                    create: {
                        transportMode: data.transportMode,
                        averageDistancePerDay: data.averageDistancePerDay,
                        daysPerYear: data.daysPerYear,
                        numberOfEmployees: data.numberOfEmployees,
                    },
                },
            },
        );
        if (ok) {
            form.reset();
            resetFactor();
        }
    };

    const totalKmPreview =
        (form.watch("averageDistancePerDay") || 0) *
        (form.watch("daysPerYear") || 0) *
        (form.watch("numberOfEmployees") || 0);

    return (
        <Scope3ActivityFormShell
            factors={factors}
            isSubmitting={isSubmitting}
            selectedFactorId={selectedFactorId}
            onFactorChange={setSelectedFactorId}
            onSubmit={form.handleSubmit(onSubmit)}
            preview={{ value: totalKmPreview, unit: "km" }}
        >
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
        </Scope3ActivityFormShell>
    );
}
