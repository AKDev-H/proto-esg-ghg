"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { VEHICLE_TYPES, FUEL_TYPES, EQUIPMENT_TYPES, REFRIGERANT_TYPES } from "@/lib/constants"
import { vehicleSchema, stationarySchema, refrigerantSchema } from "@/modules/scope1/schemas"
import type { VehicleFormData, StationaryFormData, RefrigerantFormData } from "@/modules/scope1/types"

type Subtype = "vehicles" | "stationary" | "refrigerants"

interface Scope1FormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>
    onSuccess?: () => void
}

function getFactorsForSubtype(factors: Scope1FormProps['factors'], subtype: Subtype): Scope1FormProps['factors'] {
    const activityTypeMap: Record<Subtype, string[]> = {
        vehicles: ['gasoline', 'diesel'],
        stationary: ['natural_gas', 'diesel', 'gasoline'],
        refrigerants: [],
    }
    const validTypes = activityTypeMap[subtype]
    if (!validTypes || validTypes.length === 0) return factors
    return factors.filter(f => validTypes.some(v => f.activityType.toLowerCase().includes(v)))
}

function calculatePreview(
    value: number,
    inputUnit: string,
    factor: { factorValue: number; activityUnit: string } | undefined
): string {
    if (!factor || !value) return "—"
    const conversionMap: Record<string, number> = {
        gallon: 3.78541,
        liter: 1,
        kg: 1,
        lb: 0.453592,
        kWh: 1,
        m3: 1,
    }
    const converted = value * (conversionMap[inputUnit] || 1)
    const emissions = converted * factor.factorValue
    return `${(emissions / 1000).toFixed(3)} tCO2e (${factor.activityUnit})`
}

export function Scope1Form({ factors, onSuccess }: Scope1FormProps) {
    const router = useRouter()
    const [subtype, setSubtype] = useState<Subtype>("vehicles")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const vehicleForm = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: { unit: "gallon" },
    })

    const stationaryForm = useForm<StationaryFormData>({
        resolver: zodResolver(stationarySchema),
        defaultValues: { unit: "gallon" },
    })

    const refrigerantForm = useForm<RefrigerantFormData>({
        resolver: zodResolver(refrigerantSchema),
    })

    const handleVehicleSubmit = async (data: VehicleFormData) => {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope1",
                    activityType: "vehicles",
                    inputValue: data.quantity,
                    inputUnit: data.unit,
                    emissionFactorId: data.emissionFactorId,
                }),
            })

            const result = await response.json()
            console.log("API Response:", result)

            if (!response.ok) {
                alert("Error: " + JSON.stringify(result))
                return
            }

            await fetch(`/api/activities/${result.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope1Vehicles: {
                        create: {
                            vehicleType: data.vehicleType,
                            fuelType: data.fuelType,
                            quantity: data.quantity,
                            unit: data.unit,
                        },
                    },
                }),
            })
            router.refresh()
            vehicleForm.reset()
            onSuccess?.()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStationarySubmit = async (data: StationaryFormData) => {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope1",
                    activityType: "stationary",
                    inputValue: data.quantity,
                    inputUnit: data.unit,
                    emissionFactorId: data.emissionFactorId,
                }),
            })

            const result = await response.json()
            if (!response.ok) {
                alert("Error: " + JSON.stringify(result))
                return
            }

            await fetch(`/api/activities/${result.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope1Stationary: {
                        create: {
                            equipmentType: data.equipmentType,
                            fuelType: data.fuelType,
                            quantity: data.quantity,
                            unit: data.unit,
                        },
                    },
                }),
            })
            router.refresh()
            stationaryForm.reset()
            onSuccess?.()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRefrigerantSubmit = async (data: RefrigerantFormData) => {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope1",
                    activityType: "refrigerants",
                    inputValue: data.quantity,
                    inputUnit: "kg",
                    emissionFactorId: data.emissionFactorId,
                }),
            })

            const result = await response.json()
            if (!response.ok) {
                alert("Error: " + JSON.stringify(result))
                return
            }

            await fetch(`/api/activities/${result.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope1Refrigerants: {
                        create: {
                            refrigerantType: data.refrigerantType,
                            quantity: data.quantity,
                            unit: "kg",
                        },
                    },
                }),
            })
            router.refresh()
            refrigerantForm.reset()
            onSuccess?.()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

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
                            <Label required error={!!vehicleForm.formState.errors.vehicleType}>
                                Vehicle Type
                            </Label>
                            <Select onValueChange={(v) => vehicleForm.setValue("vehicleType", v)}>
                                <SelectTrigger error={!!vehicleForm.formState.errors.vehicleType}>
                                    <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {VEHICLE_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label required error={!!vehicleForm.formState.errors.fuelType}>
                                Fuel Type
                            </Label>
                            <Select onValueChange={(v) => vehicleForm.setValue("fuelType", v)}>
                                <SelectTrigger error={!!vehicleForm.formState.errors.fuelType}>
                                    <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
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
                            <Label required error={!!vehicleForm.formState.errors.quantity}>
                                Quantity
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                error={!!vehicleForm.formState.errors.quantity}
                                {...vehicleForm.register("quantity", { valueAsNumber: true })}
                            />
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

                    <div className="space-y-2">
                        <Label required>Emission Factor</Label>
                        <Select 
                            value={vehicleForm.watch("emissionFactorId") || ""} 
                            onValueChange={(v) => vehicleForm.setValue("emissionFactorId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select emission factor" />
                            </SelectTrigger>
                            <SelectContent>
                                {getFactorsForSubtype(factors, "vehicles").map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.activityType} - {f.factorValue} kgCO2e/{f.activityUnit}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Emissions:</span>
                            <span className="font-medium">
                                {(() => {
                                    const selectedFactor = getFactorsForSubtype(factors, "vehicles").find(f => f.id === vehicleForm.watch("emissionFactorId"))
                                    return calculatePreview(
                                        vehicleForm.watch("quantity") || 0,
                                        vehicleForm.watch("unit") || "gallon",
                                        selectedFactor
                                    )
                                })()}
                            </span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting || vehicleForm.formState.isSubmitting}>
                        {isSubmitting ? "Saving..." : "Add Vehicle Activity"}
                    </Button>
                </form>
            )}

            {subtype === "stationary" && (
                <form onSubmit={stationaryForm.handleSubmit(handleStationarySubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label required error={!!stationaryForm.formState.errors.equipmentType}>
                                Equipment Type
                            </Label>
                            <Select onValueChange={(v) => stationaryForm.setValue("equipmentType", v)}>
                                <SelectTrigger error={!!stationaryForm.formState.errors.equipmentType}>
                                    <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EQUIPMENT_TYPES.map((e) => (
                                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label required error={!!stationaryForm.formState.errors.fuelType}>
                                Fuel Type
                            </Label>
                            <Select onValueChange={(v) => stationaryForm.setValue("fuelType", v)}>
                                <SelectTrigger error={!!stationaryForm.formState.errors.fuelType}>
                                    <SelectValue placeholder="Select fuel" />
                                </SelectTrigger>
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
                            <Label required error={!!stationaryForm.formState.errors.quantity}>
                                Quantity
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                error={!!stationaryForm.formState.errors.quantity}
                                {...stationaryForm.register("quantity", { valueAsNumber: true })}
                            />
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

                    <div className="space-y-2">
                        <Label required>Emission Factor</Label>
                        <Select 
                            value={stationaryForm.watch("emissionFactorId") || ""} 
                            onValueChange={(v) => stationaryForm.setValue("emissionFactorId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select emission factor" />
                            </SelectTrigger>
                            <SelectContent>
                                {getFactorsForSubtype(factors, "stationary").map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.activityType} - {f.factorValue} kgCO2e/{f.activityUnit}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Emissions:</span>
                            <span className="font-medium">
                                {(() => {
                                    const selectedFactor = getFactorsForSubtype(factors, "stationary").find(f => f.id === stationaryForm.watch("emissionFactorId"))
                                    return calculatePreview(
                                        stationaryForm.watch("quantity") || 0,
                                        stationaryForm.watch("unit") || "gallon",
                                        selectedFactor
                                    )
                                })()}
                            </span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting || stationaryForm.formState.isSubmitting}>
                        {isSubmitting ? "Saving..." : "Add Stationary Activity"}
                    </Button>
                </form>
            )}

            {subtype === "refrigerants" && (
                <form onSubmit={refrigerantForm.handleSubmit(handleRefrigerantSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label required error={!!refrigerantForm.formState.errors.refrigerantType}>
                            Refrigerant Type
                        </Label>
                        <Select onValueChange={(v) => refrigerantForm.setValue("refrigerantType", v)}>
                            <SelectTrigger error={!!refrigerantForm.formState.errors.refrigerantType}>
                                <SelectValue placeholder="Select refrigerant" />
                            </SelectTrigger>
                            <SelectContent>
                                {REFRIGERANT_TYPES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label required error={!!refrigerantForm.formState.errors.quantity}>
                            Quantity (kg)
                        </Label>
                        <Input
                            type="number"
                            step="0.01"
                            error={!!refrigerantForm.formState.errors.quantity}
                            {...refrigerantForm.register("quantity", { valueAsNumber: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label required>Emission Factor</Label>
                        <Select 
                            value={refrigerantForm.watch("emissionFactorId") || ""} 
                            onValueChange={(v) => refrigerantForm.setValue("emissionFactorId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select emission factor" />
                            </SelectTrigger>
                            <SelectContent>
                                {getFactorsForSubtype(factors, "refrigerants").map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.activityType} - {f.factorValue} kgCO2e/{f.activityUnit}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Emissions:</span>
                            <span className="font-medium">
                                {(() => {
                                    const selectedFactor = getFactorsForSubtype(factors, "refrigerants").find(f => f.id === refrigerantForm.watch("emissionFactorId"))
                                    return calculatePreview(
                                        refrigerantForm.watch("quantity") || 0,
                                        "kg",
                                        selectedFactor
                                    )
                                })()}
                            </span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting || refrigerantForm.formState.isSubmitting}>
                        {isSubmitting ? "Saving..." : "Add Refrigerant Activity"}
                    </Button>
                </form>
            )}
        </div>
    )
}