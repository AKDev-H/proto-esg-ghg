"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { VEHICLE_TYPES, FUEL_TYPES, EQUIPMENT_TYPES, REFRIGERANT_TYPES } from "@/lib/constants";
import { vehicleSchema, stationarySchema, refrigerantSchema } from "@/modules/scope1/schemas";
import { EmissionFactorSelect } from "@/modules/emission-factors/components/emission-factor-select";
import { EmissionsPreview } from "@/modules/emission-factors/components/emissions-preview";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { VehicleFormData, StationaryFormData, RefrigerantFormData } from "@/modules/scope1/types";
import { useState } from "react";

type Subtype = "vehicles" | "stationary" | "refrigerants";

interface Scope1FormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

function getFactorsForSubtype(factors: EmissionFactorOption[], subtype: Subtype) {
    const activityTypeMap: Record<Subtype, string[]> = {
        vehicles: ["gasoline", "diesel"],
        stationary: ["natural_gas", "diesel", "gasoline"],
        refrigerants: [],
    };
    const validTypes = activityTypeMap[subtype];
    if (!validTypes.length) return factors;
    return factors.filter((f) =>
        validTypes.some((v) => f.activityType.toLowerCase().includes(v)),
    );
}

export function Scope1Form({ factors, onSuccess }: Scope1FormProps) {
    const [subtype, setSubtype] = useState<Subtype>("vehicles");
    const { isSubmitting, submit } = useCreateActivityForm({ onSuccess });

    const vehicleForm = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: { unit: "gallon" },
    });

    const stationaryForm = useForm<StationaryFormData>({
        resolver: zodResolver(stationarySchema),
        defaultValues: { unit: "gallon" },
    });

    const refrigerantForm = useForm<RefrigerantFormData>({
        resolver: zodResolver(refrigerantSchema),
    });

    const subtypeFactors = getFactorsForSubtype(factors, subtype);

    const handleVehicleSubmit = async (data: VehicleFormData) => {
        const ok = await submit(
            {
                scope: "scope1",
                activityType: "vehicles",
                inputValue: data.quantity,
                inputUnit: data.unit,
                emissionFactorId: data.emissionFactorId,
            },
            {
                scope1Vehicles: {
                    create: {
                        vehicleType: data.vehicleType,
                        fuelType: data.fuelType,
                        quantity: data.quantity,
                        unit: data.unit,
                    },
                },
            },
        );
        if (ok) vehicleForm.reset();
    };

    const handleStationarySubmit = async (data: StationaryFormData) => {
        const ok = await submit(
            {
                scope: "scope1",
                activityType: "stationary",
                inputValue: data.quantity,
                inputUnit: data.unit,
                emissionFactorId: data.emissionFactorId,
            },
            {
                scope1Stationary: {
                    create: {
                        equipmentType: data.equipmentType,
                        fuelType: data.fuelType,
                        quantity: data.quantity,
                        unit: data.unit,
                    },
                },
            },
        );
        if (ok) stationaryForm.reset();
    };

    const handleRefrigerantSubmit = async (data: RefrigerantFormData) => {
        const ok = await submit(
            {
                scope: "scope1",
                activityType: "refrigerants",
                inputValue: data.quantity,
                inputUnit: "kg",
                emissionFactorId: data.emissionFactorId,
            },
            {
                scope1Refrigerants: {
                    create: {
                        refrigerantType: data.refrigerantType,
                        quantity: data.quantity,
                        unit: "kg",
                    },
                },
            },
        );
        if (ok) refrigerantForm.reset();
    };

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Label required>Activity Type</Label>
                <Select value={subtype} onValueChange={(v) => setSubtype(v as Subtype)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vehicles">Company Vehicles</SelectItem>
                        <SelectItem value="stationary">Stationary Combustion</SelectItem>
                        <SelectItem value="refrigerants">Refrigerants</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {subtype === "vehicles" && (
                <form onSubmit={vehicleForm.handleSubmit(handleVehicleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label required>Vehicle Type</Label>
                            <Select onValueChange={(v) => vehicleForm.setValue("vehicleType", v)}>
                                <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                                <SelectContent>
                                    {VEHICLE_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label required>Fuel Type</Label>
                            <Select onValueChange={(v) => vehicleForm.setValue("fuelType", v)}>
                                <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                                <SelectContent>
                                    {FUEL_TYPES.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label required>Quantity</Label>
                            <Input type="number" step="0.01" {...vehicleForm.register("quantity", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label required>Unit</Label>
                            <Select defaultValue="gallon" onValueChange={(v) => vehicleForm.setValue("unit", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gallon">Gallon</SelectItem>
                                    <SelectItem value="liter">Liter</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <EmissionFactorSelect
                        factors={subtypeFactors}
                        value={vehicleForm.watch("emissionFactorId") || ""}
                        onChange={(v) => vehicleForm.setValue("emissionFactorId", v)}
                        required
                    />
                    <EmissionsPreview
                        value={vehicleForm.watch("quantity") || 0}
                        unit={vehicleForm.watch("unit") || "gallon"}
                        factor={subtypeFactors.find((f) => f.id === vehicleForm.watch("emissionFactorId"))}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Add Vehicle Activity"}
                    </Button>
                </form>
            )}

            {subtype === "stationary" && (
                <form onSubmit={stationaryForm.handleSubmit(handleStationarySubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label required>Equipment Type</Label>
                            <Select onValueChange={(v) => stationaryForm.setValue("equipmentType", v)}>
                                <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                                <SelectContent>
                                    {EQUIPMENT_TYPES.map((e) => (
                                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label required>Fuel Type</Label>
                            <Select onValueChange={(v) => stationaryForm.setValue("fuelType", v)}>
                                <SelectTrigger><SelectValue placeholder="Select fuel" /></SelectTrigger>
                                <SelectContent>
                                    {FUEL_TYPES.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label required>Quantity</Label>
                            <Input type="number" step="0.01" {...stationaryForm.register("quantity", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label required>Unit</Label>
                            <Select defaultValue="gallon" onValueChange={(v) => stationaryForm.setValue("unit", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gallon">Gallon</SelectItem>
                                    <SelectItem value="liter">Liter</SelectItem>
                                    <SelectItem value="scf">SCF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <EmissionFactorSelect
                        factors={subtypeFactors}
                        value={stationaryForm.watch("emissionFactorId") || ""}
                        onChange={(v) => stationaryForm.setValue("emissionFactorId", v)}
                        required
                    />
                    <EmissionsPreview
                        value={stationaryForm.watch("quantity") || 0}
                        unit={stationaryForm.watch("unit") || "gallon"}
                        factor={subtypeFactors.find((f) => f.id === stationaryForm.watch("emissionFactorId"))}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Add Stationary Activity"}
                    </Button>
                </form>
            )}

            {subtype === "refrigerants" && (
                <form onSubmit={refrigerantForm.handleSubmit(handleRefrigerantSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label required>Refrigerant Type</Label>
                        <Select onValueChange={(v) => refrigerantForm.setValue("refrigerantType", v)}>
                            <SelectTrigger><SelectValue placeholder="Select refrigerant" /></SelectTrigger>
                            <SelectContent>
                                {REFRIGERANT_TYPES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label required>Quantity (kg)</Label>
                        <Input type="number" step="0.01" {...refrigerantForm.register("quantity", { valueAsNumber: true })} />
                    </div>
                    <EmissionFactorSelect
                        factors={subtypeFactors}
                        value={refrigerantForm.watch("emissionFactorId") || ""}
                        onChange={(v) => refrigerantForm.setValue("emissionFactorId", v)}
                        required
                    />
                    <EmissionsPreview
                        value={refrigerantForm.watch("quantity") || 0}
                        unit="kg"
                        factor={subtypeFactors.find((f) => f.id === refrigerantForm.watch("emissionFactorId"))}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Add Refrigerant Activity"}
                    </Button>
                </form>
            )}
        </div>
    );
}
