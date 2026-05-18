"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { businessTravelSchema } from "@/modules/scope3/schemas";
import type { BusinessTravelFormData, TravelType } from "@/modules/scope3/types";

interface BusinessTravelFormProps {
    factors: Array<{ id: string; activityType: string; factorValue: number; activityUnit: string }>;
    onSuccess?: () => void;
}

export function BusinessTravelForm({ factors, onSuccess }: BusinessTravelFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFactor, setSelectedFactor] = useState<string>("");

    const form = useForm<BusinessTravelFormData>({
        resolver: zodResolver(businessTravelSchema),
        defaultValues: { travelType: "flight" },
    });

    const onSubmit = async (data: BusinessTravelFormData) => {
        setIsSubmitting(true);
        try {
            const totalKm = data.distance * data.numberOfTrips;
            const res = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope: "scope3",
                    scope3Category: "cat6_business_travel",
                    activityType: "business_travel",
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
                        scope3BusinessTravel: {
                            create: {
                                travelType: data.travelType,
                                distance: data.distance,
                                numberOfTrips: data.numberOfTrips,
                                origin: data.origin,
                                destination: data.destination,
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
                    <Label>Travel Type</Label>
                    <Select value={form.watch("travelType")} onValueChange={(v) => form.setValue("travelType", v as TravelType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="flight">Flight</SelectItem>
                            <SelectItem value="train">Train</SelectItem>
                            <SelectItem value="taxi">Taxi</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Number of Trips</Label>
                    <Input type="number" {...form.register("numberOfTrips", { valueAsNumber: true })} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input type="number" step="0.01" {...form.register("distance", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                    <Label>Origin</Label>
                    <Input {...form.register("origin")} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Destination</Label>
                <Input {...form.register("destination")} />
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