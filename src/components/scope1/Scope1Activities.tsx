"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DATA_STATUS_LABELS } from "@/lib/constants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { ADMIN_ROLES } from "@/types"
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

interface Scope1ActivitiesProps {
    activities: Scope1Activity[]
    user?: SessionUser | null
    totalCount?: number
    currentPage?: number
    onPageChange?: (page: number) => void
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
        return `${activity.vehicle.vehicleType} • ${activity.vehicle.fuelType} • ${activity.vehicle.quantity} ${activity.vehicle.unit}`
    }
    if (activity.stationary) {
        return `${activity.stationary.equipmentType} • ${activity.stationary.fuelType} • ${activity.stationary.quantity} ${activity.stationary.unit}`
    }
    if (activity.refrigerant) {
        return `${activity.refrigerant.refrigerantType} • ${activity.refrigerant.quantity} ${activity.refrigerant.unit}`
    }
    return `${activity.inputValue} ${activity.inputUnit}`
}

function ActionButtons({ 
    activity, 
    onSubmit, 
    onApprove,
    canSubmit,
    canApprove 
}: { 
    activity: Scope1Activity
    onSubmit: (id: string) => void
    onApprove: (id: string, status: "approve" | "reject") => void
    canSubmit: boolean
    canApprove: boolean
}) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        await onSubmit(activity.id)
        setLoading(false)
    }

    const handleApprove = async (status: "approve" | "reject") => {
        setLoading(true)
        await onApprove(activity.id, status)
        setLoading(false)
    }

    if (activity.dataStatus === "draft" && canSubmit) {
        return (
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
                Submit
            </Button>
        )
    }

    if (activity.dataStatus === "submitted" && canApprove) {
        return (
            <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => handleApprove("reject")} disabled={loading}>
                    Reject
                </Button>
                <Button size="sm" onClick={() => handleApprove("approve")} disabled={loading}>
                    Approve
                </Button>
            </div>
        )
    }

    return null
}

function MobileCard({ activity, onSubmit, onApprove, canSubmit, canApprove }: { 
    activity: Scope1Activity
    onSubmit: (id: string) => void
    onApprove: (id: string, status: "approve" | "reject") => void
    canSubmit: boolean
    canApprove: boolean
}) {
    return (
        <Card className="mb-3">
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
                        <span className="text-muted-foreground">Emissions:</span>
                        <span className="font-medium">
                            {activity.calculatedEmissions ? `${(activity.calculatedEmissions / 1000).toFixed(3)} tCO2e` : "—"}
                        </span>
                    </div>
                </div>
                <div className="mt-3">
                    <ActionButtons 
                        activity={activity} 
                        onSubmit={onSubmit} 
                        onApprove={onApprove} 
                        canSubmit={canSubmit} 
                        canApprove={canApprove} 
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export function Scope1Activities({ activities, user, totalCount, currentPage = 1, onPageChange }: Scope1ActivitiesProps) {
    const router = useRouter()
    const canSubmit = user?.role !== "viewer"
    const canApprove = user ? ADMIN_ROLES.includes(user.role) : false
    const pageSize = 10
    const totalPages = Math.ceil((totalCount || activities.length) / pageSize)

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams()
        params.set("page", page.toString())
        router.push(`/activities/scope1?${params.toString()}`)
    }

    const handleSubmit = async (id: string) => {
        try {
            await fetch(`/api/activities/${id}/submit`, { method: "POST" })
            router.refresh()
        } catch (error) {
            console.error("Submit error:", error)
        }
    }

    const handleApprove = async (id: string, status: "approve" | "reject") => {
        try {
            await fetch(`/api/activities/${id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            router.refresh()
        } catch (error) {
            console.error("Approve error:", error)
        }
    }

    if (activities.length === 0) {
        return <p className="text-muted-foreground text-sm">No activities recorded yet.</p>
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Emissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">
                                    {activityLabels[activity.activityType] || activity.activityType.replace(/_/g, " ")}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDetails(activity)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {activity.calculatedEmissions 
                                        ? `${(activity.calculatedEmissions / 1000).toFixed(3)} tCO2e`
                                        : "—"}
                                </TableCell>
                                <TableCell>
                                    <Badge className={`text-xs ${statusColors[activity.dataStatus]}`}>
                                        {DATA_STATUS_LABELS[activity.dataStatus]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <ActionButtons 
                                        activity={activity} 
                                        onSubmit={handleSubmit} 
                                        onApprove={handleApprove} 
                                        canSubmit={canSubmit} 
                                        canApprove={canApprove} 
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-0">
                {activities.map((activity) => (
                    <MobileCard 
                        key={activity.id} 
                        activity={activity} 
                        onSubmit={handleSubmit} 
                        onApprove={handleApprove} 
                        canSubmit={canSubmit} 
                        canApprove={canApprove} 
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                />
            )}
        </div>
    )
}