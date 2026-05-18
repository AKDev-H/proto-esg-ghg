"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { factorSchema, SCOPE3_CATEGORIES_ZOD } from "@/modules/emission-factors/schemas"
import type { FactorInput } from "@/modules/emission-factors/schemas"
import type { EmissionFactor } from "@/modules/emission-factors/types"
import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants"

interface FactorsFormProps {
    onSuccess?: () => void
    editFactor?: EmissionFactor | null
    onCancelEdit?: () => void
}

const SCOPE3_CATEGORIES = SCOPE3_CATEGORIES_ZOD as unknown as string[]

function formatScope3CategoryLabel(cat: string): string {
    const label = SCOPE3_CATEGORY_LABELS[cat]
    if (label) {
        return label.replace(/^\d+\.\s*/, "")
    }
    return cat.replace(/_/g, " ").replace(/cat(\d+)/, "Category $1")
}

const ACTIVITY_UNITS = [
    "kgCO2e/liter",
    "kgCO2e/kg",
    "kgCO2e/kWh",
    "kgCO2e/m³",
    "kgCO2e/mile",
    "kgCO2e/km",
    "kgCO2e/gallon",
    "kgCO2e/lb",
    "tCO2e/MWh",
    "tCO2e/unit",
    "gCO2e/kWh",
    "kgCO2e/unit",
]

export function FactorsForm({ onSuccess, editFactor, onCancelEdit }: FactorsFormProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const isEditMode = !!editFactor

    const form = useForm<FactorInput>({
        resolver: zodResolver(factorSchema),
        defaultValues: { category: "scope1", country: "US" },
    })

    useEffect(() => {
        if (editFactor) {
            form.reset({
                category: editFactor.category as FactorInput["category"],
                activityType: editFactor.activityType,
                activityUnit: editFactor.activityUnit,
                factorValue: editFactor.factorValue,
                source: editFactor.source,
                country: editFactor.country,
                validFrom: editFactor.validFrom.split('T')[0],
                validTo: editFactor.validTo ? editFactor.validTo.split('T')[0] : undefined,
                scope3Category: editFactor.scope3Category as FactorInput["scope3Category"],
            })
        }
    }, [editFactor, form])

    const onSubmit = async (data: FactorInput) => {
        try {
            let res
            if (isEditMode && editFactor) {
                res = await fetch(`/api/factors/${editFactor.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
            } else {
                res = await fetch("/api/factors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
            }

            if (res.ok) {
                setIsOpen(false)
                form.reset({ category: "scope1", country: "US" })
                router.refresh()
                onSuccess?.()
                onCancelEdit?.()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const showDialog = isOpen || isEditMode

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add Factor</Button>

            {showDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md m-4">
                        <CardHeader>
                            <CardTitle>{isEditMode ? "Edit" : "Add"} Emission Factor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label required error={!!form.formState.errors.category}>
                                        Category
                                    </Label>
                                    <Select
                                        value={form.watch("category")}
                                        onValueChange={(v) => form.setValue("category", v as FactorInput["category"])}
                                    >
                                        <SelectTrigger error={!!form.formState.errors.category}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scope1">Scope 1</SelectItem>
                                            <SelectItem value="scope2">Scope 2</SelectItem>
                                            <SelectItem value="scope3">Scope 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {form.watch("category") === "scope3" && (
                                    <div className="space-y-2">
                                        <Label>Scope 3 Category</Label>
                                        <Select
                                            value={form.watch("scope3Category") || ""}
                                            onValueChange={(v) => form.setValue("scope3Category", v as FactorInput["scope3Category"])}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SCOPE3_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{formatScope3CategoryLabel(cat)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label required error={!!form.formState.errors.activityType}>
                                        Activity Type
                                    </Label>
                                    <Input
                                        error={!!form.formState.errors.activityType}
                                        {...form.register("activityType")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label required error={!!form.formState.errors.activityUnit}>
                                        Unit
                                    </Label>
                                    <Select
                                        value={form.watch("activityUnit") || ""}
                                        onValueChange={(v) => form.setValue("activityUnit", v)}
                                    >
                                        <SelectTrigger error={!!form.formState.errors.activityUnit}>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ACTIVITY_UNITS.map((unit) => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label required error={!!form.formState.errors.factorValue}>
                                        Factor Value
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        error={!!form.formState.errors.factorValue}
                                        {...form.register("factorValue", { valueAsNumber: true })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label required error={!!form.formState.errors.source}>
                                        Source
                                    </Label>
                                    <Input
                                        error={!!form.formState.errors.source}
                                        placeholder="e.g., EPA, DEFRA"
                                        {...form.register("source")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label required error={!!form.formState.errors.country}>
                                        Country
                                    </Label>
                                    <Select
                                        value={form.watch("country")}
                                        onValueChange={(v) => form.setValue("country", v as FactorInput["country"])}
                                    >
                                        <SelectTrigger error={!!form.formState.errors.country}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="MY">Malaysia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label required error={!!form.formState.errors.validFrom}>
                                        Valid From
                                    </Label>
                                    <Input
                                        type="date"
                                        error={!!form.formState.errors.validFrom}
                                        {...form.register("validFrom")}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsOpen(false); onCancelEdit?.() }}>Cancel</Button>
                                    <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                                        {isEditMode ? "Update Factor" : "Add Factor"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    )
}