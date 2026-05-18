"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SCOPE3_CATEGORY_LABELS, DATA_STATUS_LABELS } from "@/lib/constants"
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

interface Scope3CardProps {
    activities: Scope3Activity[]
    user?: SessionUser | null
}

const statusColors: Record<DataStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
}

function getCategoryLabel(scope3Category: Scope3Category | null): string {
    if (scope3Category && SCOPE3_CATEGORY_LABELS[scope3Category]) {
        return SCOPE3_CATEGORY_LABELS[scope3Category]
    }
    return "Unknown"
}

function formatDetails(activity: Scope3Activity): { label: string; value: string }[] {
    const { scope3Category } = activity
    const details: { label: string; value: string }[] = []

    switch (scope3Category) {
        case "cat1_purchased_goods":
            if (activity.purchasedGoods) {
                details.push({ label: "Material", value: activity.purchasedGoods.materialType })
                details.push({ label: "Qty", value: `${activity.purchasedGoods.quantity} ${activity.purchasedGoods.unit}` })
                if (activity.purchasedGoods.supplier) {
                    details.push({ label: "Supplier", value: activity.purchasedGoods.supplier })
                }
            }
            break
        case "cat2_capital_goods":
            if (activity.capitalGoods) {
                details.push({ label: "Equipment", value: activity.capitalGoods.equipmentType })
                details.push({ label: "Qty", value: `${activity.capitalGoods.quantity} ${activity.capitalGoods.unit}` })
                details.push({ label: "Year", value: String(activity.capitalGoods.purchaseYear) })
            }
            break
        case "cat3_fuel_energy":
            if (activity.fuelEnergy) {
                details.push({ label: "Fuel", value: activity.fuelEnergy.fuelType })
                details.push({ label: "Activity", value: activity.fuelEnergy.activityDescription })
                details.push({ label: "Qty", value: `${activity.fuelEnergy.quantity} ${activity.fuelEnergy.unit}` })
            }
            break
        case "cat4_upstream_transport":
        case "cat9_downstream_transport":
            if (activity.transportation) {
                details.push({ label: "Mode", value: activity.transportation.transportMode })
                details.push({ label: "Weight", value: `${activity.transportation.weight}t` })
                details.push({ label: "Distance", value: `${activity.transportation.distance}${activity.transportation.distanceUnit}` })
            }
            break
        case "cat5_waste":
            if (activity.waste) {
                details.push({ label: "Type", value: activity.waste.wasteType })
                details.push({ label: "Method", value: activity.waste.disposalMethod })
                details.push({ label: "Qty", value: `${activity.waste.quantity} ${activity.waste.unit}` })
            }
            break
        case "cat6_business_travel":
            if (activity.businessTravel) {
                details.push({ label: "Type", value: activity.businessTravel.travelType })
                details.push({ label: "Trips", value: String(activity.businessTravel.numberOfTrips) })
                if (activity.businessTravel.origin && activity.businessTravel.destination) {
                    details.push({ label: "Route", value: `${activity.businessTravel.origin} → ${activity.businessTravel.destination}` })
                }
            }
            break
        case "cat7_employee_commuting":
            if (activity.employeeCommuting) {
                details.push({ label: "Mode", value: activity.employeeCommuting.transportMode })
                details.push({ label: "Employees", value: String(activity.employeeCommuting.numberOfEmployees) })
                details.push({ label: "Distance", value: `${activity.employeeCommuting.averageDistancePerDay}km/day` })
            }
            break
        case "cat8_upstream_leased":
            if (activity.upstreamLeased) {
                details.push({ label: "Asset", value: activity.upstreamLeased.assetType })
                details.push({ label: "Lease", value: activity.upstreamLeased.leaseType })
                details.push({ label: "Qty", value: `${activity.upstreamLeased.quantity} ${activity.upstreamLeased.unit}` })
            }
            break
        case "cat10_product_processing":
            if (activity.productProcessing) {
                details.push({ label: "Product", value: activity.productProcessing.productType })
                details.push({ label: "Process", value: activity.productProcessing.processingType })
                details.push({ label: "Qty", value: `${activity.productProcessing.quantity} ${activity.productProcessing.unit}` })
            }
            break
        case "cat11_product_use":
            if (activity.productUse) {
                details.push({ label: "Product", value: activity.productUse.productType })
                details.push({ label: "Energy", value: `${activity.productUse.annualEnergyKwh}kWh/unit` })
                details.push({ label: "Units", value: String(activity.productUse.unitsSold || 0) })
            }
            break
        case "cat12_end_of_life":
            if (activity.endOfLife) {
                details.push({ label: "Disposal", value: activity.endOfLife.disposalType })
                details.push({ label: "Qty", value: `${activity.endOfLife.wasteQuantity} ${activity.endOfLife.unit}` })
            }
            break
        case "cat13_downstream_leased":
            if (activity.downstreamLeased) {
                details.push({ label: "Product", value: activity.downstreamLeased.productType })
                details.push({ label: "Lease", value: activity.downstreamLeased.leaseType })
                details.push({ label: "Qty", value: `${activity.downstreamLeased.quantity} ${activity.downstreamLeased.unit}` })
            }
            break
        default:
            details.push({ label: "Input", value: `${activity.inputValue} ${activity.inputUnit}` })
    }

    return details
}

export function Scope3Card({ activities }: Scope3CardProps) {
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
            {activities.map((activity) => {
                const details = formatDetails(activity)
                return (
                    <Card key={activity.id}>
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
                                {details.map((detail, idx) => (
                                    <div key={idx} className="grid grid-cols-2 gap-2">
                                        <span className="text-muted-foreground">{detail.label}:</span>
                                        <span className="font-medium">{detail.value}</span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
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
                )
            })}
        </div>
    )
}