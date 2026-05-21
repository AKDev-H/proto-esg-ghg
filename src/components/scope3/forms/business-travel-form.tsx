"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { businessTravelSchema } from "@/modules/scope3/schemas";
import { Scope3ActivityFormShell } from "@/modules/scope3/components/scope3-activity-form-shell";
import { useCreateActivityForm } from "@/modules/activities/hooks/use-create-activity-form";
import type { EmissionFactorOption } from "@/modules/activities/types";
import type { BusinessTravelFormData, TravelType } from "@/modules/scope3/types";

interface BusinessTravelFormProps {
    factors: EmissionFactorOption[];
    onSuccess?: () => void;
}

export function BusinessTravelForm({ factors, onSuccess }: BusinessTravelFormProps) {
    const { isSubmitting, selectedFactorId, setSelectedFactorId, submit, resetFactor } =
        useCreateActivityForm({ onSuccess });

    const form = useForm<BusinessTravelFormData>({
        resolver: zodResolver(businessTravelSchema),
        defaultValues: { travelType: "flight" },
    });

    const onSubmit = async (data: BusinessTravelFormData) => {
        const isHotel = data.travelType === "hotel";
        const inputValue = isHotel ? data.numberOfTrips : data.distance * data.numberOfTrips;
        const inputUnit = isHotel ? "night" : "km";

        const ok = await submit(
            {
                scope: "scope3",
                scope3Category: "cat6_business_travel",
                activityType: "business_travel",
                inputValue,
                inputUnit,
            },
            {
                scope3BusinessTravel: {
                    create: {
                        travelType: data.travelType,
                        distance: data.distance,
                        numberOfTrips: data.numberOfTrips,
                        origin: data.origin,
                        destination: data.destination,
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
        >
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
                    <Label>{form.watch("travelType") === "hotel" ? "Nights" : "Number of Trips"}</Label>
                    <Input type="number" {...form.register("numberOfTrips", { valueAsNumber: true })} />
                </div>
            </div>
            {form.watch("travelType") !== "hotel" && (
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
            )}
            {form.watch("travelType") !== "hotel" && (
                <div className="space-y-2">
                    <Label>Destination</Label>
                    <Input {...form.register("destination")} />
                </div>
            )}
        </Scope3ActivityFormShell>
    );
}
