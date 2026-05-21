import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scope1Form } from "@/components/scope1/Scope1Form"
import { Scope1Card } from "@/components/scope1/Scope1Card"
import { ActivitiesTableClient } from "@/components/activities/ActivitiesTable.client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface Scope1ActivityDetail {
    id: string
    scope: "scope1"
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: "draft" | "submitted" | "approved" | "rejected"
    createdAt: string
    vehicle?: { vehicleType: string; fuelType: string; quantity: number; unit: string } | null
    stationary?: { equipmentType: string; fuelType: string; quantity: number; unit: string } | null
    refrigerant?: { refrigerantType: string; quantity: number; unit: string } | null
}

const PAGE_SIZE = 10

interface Props {
    searchParams: Promise<{ page?: string }>
}

const activityLabels: Record<string, string> = {
    vehicle: "Company Vehicle",
    stationary: "Stationary Combustion",
    refrigerant: "Refrigerant",
    vehicles: "Company Vehicle",
    refrigerants: "Refrigerant",
}

export default async function Scope1Page({ searchParams }: Props) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const skip = (page - 1) * PAGE_SIZE

    const session = await auth()
    const organizationId = session?.user?.organizationId
    const isSuperAdmin = session?.user?.role === "super_admin"

    const [factors, activities, totalCount] = await Promise.all([
        prisma.emissionFactor.findMany({
            where: { 
                category: "scope1", 
                ...(organizationId && !isSuperAdmin ? { OR: [{ organizationId }, { organizationId: null }] } : {})
            },
            orderBy: { activityType: "asc" },
        }),
        prisma.activityData.findMany({
            where: { 
                scope: "scope1", 
                ...(organizationId && !isSuperAdmin ? { organizationId } : {})
            },
            include: { scope1Vehicles: true, scope1Stationary: true, scope1Refrigerants: true },
            orderBy: { createdAt: "desc" },
            take: PAGE_SIZE,
            skip,
        }),
        prisma.activityData.count({
            where: { 
                scope: "scope1", 
                ...(organizationId && !isSuperAdmin ? { organizationId } : {})
            },
        }),
    ])

    const formattedActivities: Scope1ActivityDetail[] = activities.map((a) => ({
        id: a.id,
        scope: "scope1" as const,
        activityType: a.activityType,
        inputValue: Number(a.inputValue),
        inputUnit: a.inputUnit,
        calculatedEmissions: a.calculatedEmissions ? Number(a.calculatedEmissions) : null,
        dataStatus: a.dataStatus as "draft" | "submitted" | "approved" | "rejected",
        createdAt: a.createdAt.toISOString(),
        vehicle: a.scope1Vehicles[0] ? {
            vehicleType: a.scope1Vehicles[0].vehicleType,
            fuelType: a.scope1Vehicles[0].fuelType,
            quantity: Number(a.scope1Vehicles[0].quantity),
            unit: a.scope1Vehicles[0].unit,
        } : null,
        stationary: a.scope1Stationary[0] ? {
            equipmentType: a.scope1Stationary[0].equipmentType,
            fuelType: a.scope1Stationary[0].fuelType,
            quantity: Number(a.scope1Stationary[0].quantity),
            unit: a.scope1Stationary[0].unit,
        } : null,
        refrigerant: a.scope1Refrigerants[0] ? {
            refrigerantType: a.scope1Refrigerants[0].refrigerantType,
            quantity: Number(a.scope1Refrigerants[0].quantity),
            unit: a.scope1Refrigerants[0].unit,
        } : null,
    }))

    const formattedFactors = factors.map((f) => ({
        id: f.id,
        activityType: f.activityType,
        factorValue: Number(f.factorValue),
        activityUnit: f.activityUnit,
    }))

    const pagination = {
        page,
        limit: PAGE_SIZE,
        total: totalCount,
        totalPages: Math.ceil(totalCount / PAGE_SIZE),
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Scope 1: Direct Emissions</h1>
            </div>

            {!isSuperAdmin && (
            <Card>
                <CardHeader>
                    <CardTitle>Add Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Scope1Form factors={formattedFactors} />
                </CardContent>
            </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="hidden md:block">
                        <ActivitiesTableClient
                            initialActivities={formattedActivities}
                            initialPagination={pagination}
                            user={session?.user}
                            scope="scope1"
                            activityLabels={activityLabels}
                        />
                    </div>
                    <Scope1Card activities={formattedActivities} user={session?.user} />
                </CardContent>
            </Card>
        </div>
    )
}