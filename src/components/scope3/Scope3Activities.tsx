"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { SCOPE3_CATEGORY_LABELS, DATA_STATUS_LABELS } from "@/lib/constants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ADMIN_ROLES } from "@/types"
import type { SessionUser, DataStatus, Scope3Category } from "@/types"

interface Scope3Activity {
    id: string
    scope: "scope3"
    scope3Category: Scope3Category | null
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: DataStatus
    createdAt: string
    purchasedGoods?: { materialType: string; quantity: number; unit: string; supplier?: string } | null
    capitalGoods?: { equipmentType: string; quantity: number; unit: string; purchaseYear: number } | null
    fuelEnergy?: { fuelType: string; quantity: number; unit: string; activityDescription: string } | null
    transportation?: { transportMode: string; weight: number; distance: number; distanceUnit: string; transportCategory: string } | null
    waste?: { wasteType: string; disposalMethod: string; quantity: number; unit: string } | null
    businessTravel?: { travelType: string; distance: number; numberOfTrips: number; origin?: string; destination?: string } | null
    employeeCommuting?: { transportMode: string; averageDistancePerDay: number; daysPerYear: number; numberOfEmployees: number } | null
    upstreamLeased?: { assetType: string; leaseType: string; quantity: number; unit: string } | null
    productProcessing?: { productType: string; processingType: string; quantity: number; unit: string } | null
    productUse?: { productType: string; annualEnergyKwh: number; lifetimeYears: number | null; unitsSold: number | null } | null
    endOfLife?: { disposalType: string; wasteQuantity: number; unit: string } | null
    downstreamLeased?: { productType: string; leaseType: string; quantity: number; unit: string } | null
}

interface Scope3ActivitiesProps {
    activities: Scope3Activity[]
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

function formatDetails(activity: Scope3Activity): string {
    const { scope3Category } = activity
    
    switch (scope3Category) {
        case "cat1_purchased_goods":
            if (activity.purchasedGoods) {
                const sup = activity.purchasedGoods.supplier ? ` • ${activity.purchasedGoods.supplier}` : ""
                return `${activity.purchasedGoods.materialType} • ${activity.purchasedGoods.quantity} ${activity.purchasedGoods.unit}${sup}`
            }
            break
        case "cat2_capital_goods":
            if (activity.capitalGoods) {
                return `${activity.capitalGoods.equipmentType} • ${activity.capitalGoods.quantity} ${activity.capitalGoods.unit} • ${activity.capitalGoods.purchaseYear}`
            }
            break
        case "cat3_fuel_energy":
            if (activity.fuelEnergy) {
                return `${activity.fuelEnergy.fuelType} • ${activity.fuelEnergy.activityDescription} • ${activity.fuelEnergy.quantity} ${activity.fuelEnergy.unit}`
            }
            break
        case "cat4_upstream_transport":
        case "cat9_downstream_transport":
            if (activity.transportation) {
                return `${activity.transportation.transportMode} • ${activity.transportation.weight}t • ${activity.transportation.distance}${activity.transportation.distanceUnit}`
            }
            break
        case "cat5_waste":
            if (activity.waste) {
                return `${activity.waste.wasteType} • ${activity.waste.disposalMethod} • ${activity.waste.quantity} ${activity.waste.unit}`
            }
            break
        case "cat6_business_travel":
            if (activity.businessTravel) {
                const route = activity.businessTravel.origin && activity.businessTravel.destination 
                    ? ` ${activity.businessTravel.origin} → ${activity.businessTravel.destination}` 
                    : ""
                return `${activity.businessTravel.travelType} • ${activity.businessTravel.numberOfTrips} trips${route}`
            }
            break
        case "cat7_employee_commuting":
            if (activity.employeeCommuting) {
                return `${activity.employeeCommuting.transportMode} • ${activity.employeeCommuting.numberOfEmployees} employees • ${activity.employeeCommuting.averageDistancePerDay}km/day`
            }
            break
        case "cat8_upstream_leased":
            if (activity.upstreamLeased) {
                return `${activity.upstreamLeased.assetType} • ${activity.upstreamLeased.leaseType} • ${activity.upstreamLeased.quantity} ${activity.upstreamLeased.unit}`
            }
            break
        case "cat10_product_processing":
            if (activity.productProcessing) {
                return `${activity.productProcessing.productType} • ${activity.productProcessing.processingType} • ${activity.productProcessing.quantity} ${activity.productProcessing.unit}`
            }
            break
        case "cat11_product_use":
            if (activity.productUse) {
                return `${activity.productUse.productType} • ${activity.productUse.annualEnergyKwh}kWh/unit • ${activity.productUse.unitsSold || 0} units`
            }
            break
        case "cat12_end_of_life":
            if (activity.endOfLife) {
                return `${activity.endOfLife.disposalType} • ${activity.endOfLife.wasteQuantity} ${activity.endOfLife.unit}`
            }
            break
        case "cat13_downstream_leased":
            if (activity.downstreamLeased) {
                return `${activity.downstreamLeased.productType} • ${activity.downstreamLeased.leaseType} • ${activity.downstreamLeased.quantity} ${activity.downstreamLeased.unit}`
            }
            break
    }
    return `${activity.inputValue} ${activity.inputUnit}`
}

function getCategoryLabel(scope3Category: Scope3Category | null): string {
    if (scope3Category && SCOPE3_CATEGORY_LABELS[scope3Category]) {
        return SCOPE3_CATEGORY_LABELS[scope3Category]
    }
    return "Unknown"
}

function ActionButtons({ 
    activity, 
    onSubmit, 
    onApprove,
    canSubmit,
    canApprove 
}: { 
    activity: Scope3Activity
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
    activity: Scope3Activity
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
                        {getCategoryLabel(activity.scope3Category)}
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

export function Scope3Activities({ activities, user, totalCount, currentPage = 1 }: Scope3ActivitiesProps) {
    const router = useRouter()
    const canSubmit = user?.role !== "viewer"
    const canApprove = user ? ADMIN_ROLES.includes(user.role) : false
    const pageSize = 10
    const totalPages = Math.ceil((totalCount || activities.length) / pageSize)

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams()
        params.set("page", page.toString())
        router.push(`/activities/scope3?${params.toString()}`)
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
                            <TableHead>Category</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Emissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium whitespace-nowrap">
                                    {getCategoryLabel(activity.scope3Category)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
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