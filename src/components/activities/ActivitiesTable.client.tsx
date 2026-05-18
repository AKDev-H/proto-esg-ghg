"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableEmptyState } from "@/components/ui/empty-state"
import { DATA_STATUS_LABELS } from "@/lib/constants"
import { ADMIN_ROLES } from "@/types"
import type { SessionUser, DataStatus } from "@/types"

interface Activity {
    id: string
    scope: "scope1" | "scope2" | "scope3"
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: DataStatus
    createdAt: string
    [key: string]: unknown
    scope3Category?: string | null
}

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface ActivitiesTableClientProps {
    initialActivities: Activity[] | unknown[]
    initialPagination: PaginationInfo
    user?: SessionUser | null
    scope: "scope1" | "scope2" | "scope3"
    activityLabels?: Record<string, string>
}

const statusColors: Record<DataStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
}

export function ActivitiesTableClient({
    initialActivities,
    initialPagination,
    user,
    scope,
    activityLabels = {},
}: ActivitiesTableClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const getActivityType = (act: Record<string, unknown>) => {
        if (scope === "scope3") {
            const cat = act.scope3Category as string | null
            if (cat) {
                const labels: Record<string, string> = {
                    cat1_purchased_goods: "Purchased Goods",
                    cat2_capital_goods: "Capital Goods",
                    cat3_fuel_energy: "Fuel & Energy",
                    cat4_upstream_transport: "Upstream Transport",
                    cat5_waste: "Waste",
                    cat6_business_travel: "Business Travel",
                    cat7_employee_commuting: "Employee Commuting",
                    cat8_upstream_leased: "Upstream Leased",
                    cat9_downstream_transport: "Downstream Transport",
                    cat10_product_processing: "Product Processing",
                    cat11_product_use: "Product Use",
                    cat12_end_of_life: "End of Life",
                    cat13_downstream_leased: "Downstream Leased",
                }
                return labels[cat] || cat.replace(/_/g, " ")
            }
            return "Scope 3"
        }
        return activityLabels[act.activityType as string] || (act.activityType as string)?.replace(/_/g, " ") || ""
    }

    const getDetails = (act: Record<string, unknown>) => {
        if (scope === "scope1") {
            const vehicle = act.vehicle as { vehicleType?: string; fuelType?: string; quantity?: number; unit?: string } | null
            const stationary = act.stationary as { equipmentType?: string; fuelType?: string; quantity?: number; unit?: string } | null
            const refrigerant = act.refrigerant as { refrigerantType?: string; quantity?: number; unit?: string } | null
            if (vehicle) return `${vehicle.vehicleType} • ${vehicle.fuelType} • ${vehicle.quantity} ${vehicle.unit}`
            if (stationary) return `${stationary.equipmentType} • ${stationary.fuelType} • ${stationary.quantity} ${stationary.unit}`
            if (refrigerant) return `${refrigerant.refrigerantType} • ${refrigerant.quantity} ${refrigerant.unit}`
        }
        if (scope === "scope2") {
            const electricity = act.electricity as { gridRegion?: string | null } | null
            const region = electricity?.gridRegion || "Default"
            return `${act.inputValue} ${act.inputUnit} • ${region}`
        }
        return `${act.inputValue} ${act.inputUnit}`
    }
    const [activities, setActivities] = useState<unknown[]>(initialActivities)
    const [pagination, setPagination] = useState<PaginationInfo>(initialPagination)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const page = parseInt(searchParams.get("page") || "1")
        if (page > 1 || !initialActivities.length) {
            fetchActivities(page)
        }
    }, [])

    const paginationInfo = pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }

    const fetchActivities = async (page: number) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set("page", page.toString())
            params.set("limit", "10")
            params.set("scope", scope)

            const res = await fetch(`/api/activities?${params.toString()}`, { credentials: "same-origin" })
            const data = await res.json()
            setActivities(data.activities || [])
            setPagination(data.pagination)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`${window.location.pathname}?${params.toString()}`)
    }

    const canSubmit = user?.role !== "viewer"
    const canApprove = user ? ADMIN_ROLES.includes(user.role) : false

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

    return (
        <div className="space-y-4">
            <div className="hidden md:block">
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : activities.length === 0 ? (
                            <TableEmptyState 
                                title="No activities recorded yet"
                                description="Add your first activity to start tracking emissions."
                            />
                        ) : (
                            activities.map((activity) => {
                                const act = activity as Record<string, unknown>
                                const emissions = act.calculatedEmissions as number | null
                                const status = act.dataStatus as DataStatus
                                const id = act.id as string
                                return (
                                <TableRow key={id}>
                                    <TableCell className="font-medium">
                                        {getActivityType(act)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {getDetails(act)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {emissions 
                                            ? `${(emissions / 1000).toFixed(3)} tCO2e`
                                            : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`text-xs ${statusColors[status]}`}>
                                            {DATA_STATUS_LABELS[status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {status === "draft" && canSubmit && (
                                            <Button size="sm" onClick={() => handleSubmit(id)}>
                                                Submit
                                            </Button>
                                        )}
                                        {status === "submitted" && canApprove && (
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" onClick={() => handleApprove(id, "reject")}>
                                                    Reject
                                                </Button>
                                                <Button size="sm" onClick={() => handleApprove(id, "approve")}>
                                                    Approve
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {paginationInfo.totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1} to {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of {paginationInfo.total} results
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(paginationInfo.page - 1)}
                            disabled={paginationInfo.page === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === paginationInfo.page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(paginationInfo.page + 1)}
                            disabled={paginationInfo.page === paginationInfo.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}