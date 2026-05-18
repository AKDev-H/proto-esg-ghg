import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scope3Forms } from "@/components/scope3/Scope3Forms"
import { Scope3Card } from "@/components/scope3/Scope3Card"
import { ActivitiesTableClient } from "@/components/activities/ActivitiesTable.client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants"
import type { Scope3Category } from "@/types"

export const dynamic = "force-dynamic"

interface Scope3ActivityDetail {
    id: string
    scope: "scope3"
    scope3Category: Scope3Category | null
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: "draft" | "submitted" | "approved" | "rejected"
    createdAt: string
}

const PAGE_SIZE = 10

interface Props {
    searchParams: Promise<{ page?: string }>
}

function getCategoryLabel(category: Scope3Category | null): string {
    if (!category) return "Scope 3"
    const label = SCOPE3_CATEGORY_LABELS[category]
    return label ? label.replace(/^\d+\.\s*/, "") : category.replace(/_/g, " ")
}

function formatDetails(activity: Scope3ActivityDetail): string {
    return `${activity.inputValue} ${activity.inputUnit}`
}

export default async function Scope3Page({ searchParams }: Props) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const skip = (page - 1) * PAGE_SIZE

    const session = await auth()
    const organizationId = session?.user?.organizationId

    const [activities, totalCount, factors] = await Promise.all([
        prisma.activityData.findMany({
            where: { scope: "scope3", ...(organizationId ? { organizationId } : {}) },
            include: {
                scope3PurchasedGoods: true,
                scope3CapitalGoods: true,
                scope3FuelEnergy: true,
                scope3Transportation: true,
                scope3Waste: true,
                scope3BusinessTravel: true,
                scope3EmployeeCommuting: true,
                scope3UpstreamLeased: true,
                scope3ProductProcessing: true,
                scope3ProductUse: true,
                scope3EndOfLife: true,
                scope3DownstreamLeased: true,
            },
            orderBy: { createdAt: "desc" },
            take: PAGE_SIZE,
            skip,
        }),
        prisma.activityData.count({
            where: { scope: "scope3", ...(organizationId ? { organizationId } : {}) },
        }),
        prisma.emissionFactor.findMany({
            where: { category: "scope3", ...(organizationId ? { OR: [{ organizationId }, { organizationId: null }] } : {}) },
            orderBy: { activityType: "asc" },
        }),
    ])

    const formattedActivities: Scope3ActivityDetail[] = activities.map((a) => ({
        id: a.id,
        scope: "scope3" as const,
        scope3Category: a.scope3Category as Scope3Category,
        activityType: a.activityType,
        inputValue: Number(a.inputValue),
        inputUnit: a.inputUnit,
        calculatedEmissions: a.calculatedEmissions ? Number(a.calculatedEmissions) : null,
        dataStatus: a.dataStatus as "draft" | "submitted" | "approved" | "rejected",
        createdAt: a.createdAt.toISOString(),
    }))

    const formattedFactors = factors.map((f) => ({
        id: f.id,
        activityType: f.activityType,
        factorValue: Number(f.factorValue),
        activityUnit: f.activityUnit,
        scope3Category: f.scope3Category,
    }))

    const pagination = {
        page,
        limit: PAGE_SIZE,
        total: totalCount,
        totalPages: Math.ceil(totalCount / PAGE_SIZE),
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Scope 3: Value Chain Emissions</h1>

            <Scope3Forms factors={formattedFactors} />

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
                            scope="scope3"
                        />
                    </div>
                    <Scope3Card activities={formattedActivities} user={session?.user} />
                </CardContent>
            </Card>
        </div>
    )
}