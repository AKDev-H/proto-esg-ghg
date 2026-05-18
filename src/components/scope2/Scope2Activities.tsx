"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { DATA_STATUS_LABELS } from "@/lib/constants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ADMIN_ROLES } from "@/types"
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

interface Scope2ActivitiesProps {
    activities: Scope2Activity[]
    user?: SessionUser | null
    totalCount?: number
    currentPage?: number
}

const statusColors: Record<DataStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
}

function formatDetails(activity: Scope2Activity): string {
    if (activity.electricity) {
        const region = activity.electricity.gridRegion || "Default"
        return `${activity.inputValue} ${activity.inputUnit} • ${region}`
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
    activity: Scope2Activity
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
    activity: Scope2Activity
    onSubmit: (id: string) => void
    onApprove: (id: string, status: "approve" | "reject") => void
    canSubmit: boolean
    canApprove: boolean
}) {
    return (
        <Card className="mb-3">
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
                        <span className="font-medium">{activity.inputValue} {activity.inputUnit}</span>
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

export function Scope2Activities({ activities, user, totalCount, currentPage = 1 }: Scope2ActivitiesProps) {
    const router = useRouter()
    const canSubmit = user?.role !== "viewer"
    const canApprove = user ? ADMIN_ROLES.includes(user.role) : false
    const pageSize = 10
    const totalPages = Math.ceil((totalCount || activities.length) / pageSize)

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams()
        params.set("page", page.toString())
        router.push(`/activities/scope2?${params.toString()}`)
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
                            <TableHead>Grid Region</TableHead>
                            <TableHead>Consumption</TableHead>
                            <TableHead className="text-right">Emissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">Electricity</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {activity.electricity?.gridRegion || "Default"}
                                </TableCell>
                                <TableCell>
                                    {activity.inputValue} {activity.inputUnit}
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