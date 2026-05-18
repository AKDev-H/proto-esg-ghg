"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DATA_STATUS_LABELS } from "@/lib/constants"
import type { SessionUser, DataStatus } from "@/types"

interface Scope1Activity {
    id: string
    scope: "scope1"
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: DataStatus
    createdAt: string
    vehicle?: { vehicleType: string; fuelType: string; quantity: number; unit: string } | null
    stationary?: { equipmentType: string; fuelType: string; quantity: number; unit: string } | null
    refrigerant?: { refrigerantType: string; quantity: number; unit: string } | null
}

interface Scope1CardProps {
    activities: Scope1Activity[]
    user?: SessionUser | null
}

const statusColors: Record<DataStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
}

const activityLabels: Record<string, string> = {
    vehicle: "Company Vehicle",
    stationary: "Stationary Combustion",
    refrigerant: "Refrigerant",
}

function formatDetails(activity: Scope1Activity): string {
    if (activity.vehicle) {
        return `${activity.vehicle.vehicleType} • ${activity.vehicle.fuelType}`
    }
    if (activity.stationary) {
        return `${activity.stationary.equipmentType} • ${activity.stationary.fuelType}`
    }
    if (activity.refrigerant) {
        return `${activity.refrigerant.refrigerantType}`
    }
    return activity.activityType.replace(/_/g, " ")
}

export function Scope1Card({ activities }: Scope1CardProps) {
    if (activities.length === 0) {
        return (
            <Card className="md:hidden">
                <CardContent className="py-8 text-center text-muted-foreground">
                    No activities recorded yet.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3 md:hidden">
            {activities.map((activity) => (
                <Card key={activity.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base">
                                {activityLabels[activity.activityType] || activity.activityType.replace(/_/g, " ")}
                            </CardTitle>
                            <Badge className={`text-xs ${statusColors[activity.dataStatus]}`}>
                                {DATA_STATUS_LABELS[activity.dataStatus]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-muted-foreground">Details:</span>
                                <span className="font-medium">{formatDetails(activity)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">
                                    {activity.vehicle?.quantity || activity.stationary?.quantity || activity.refrigerant?.quantity || activity.inputValue} 
                                    {" "}
                                    {activity.vehicle?.unit || activity.stationary?.unit || activity.refrigerant?.unit || activity.inputUnit}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-muted-foreground">Emissions:</span>
                                <span className="font-medium">
                                    {activity.calculatedEmissions 
                                        ? `${(activity.calculatedEmissions / 1000).toFixed(3)} tCO2e` 
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}