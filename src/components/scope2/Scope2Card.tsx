"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DATA_STATUS_LABELS } from "@/lib/constants"
import type { SessionUser, DataStatus } from "@/types"

interface Scope2Activity {
    id: string
    scope: "scope2"
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: DataStatus
    createdAt: string
    electricity?: { gridRegion: string | null } | null
}

interface Scope2CardProps {
    activities: Scope2Activity[]
    user?: SessionUser | null
}

const statusColors: Record<DataStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
}

export function Scope2Card({ activities }: Scope2CardProps) {
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
                            <CardTitle className="text-base">Electricity</CardTitle>
                            <Badge className={`text-xs ${statusColors[activity.dataStatus]}`}>
                                {DATA_STATUS_LABELS[activity.dataStatus]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-muted-foreground">Grid Region:</span>
                                <span className="font-medium">{activity.electricity?.gridRegion || "Default"}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-muted-foreground">Consumption:</span>
                                <span className="font-medium">
                                    {activity.inputValue} {activity.inputUnit}
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