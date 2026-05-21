import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scope2Form } from "@/components/scope2/Scope2Form"
import { Scope2Card } from "@/components/scope2/Scope2Card"
import { ActivitiesTableClient } from "@/components/activities/ActivitiesTable.client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface Scope2ActivityDetail {
    id: string
    scope: "scope2"
    activityType: string
    inputValue: number
    inputUnit: string
    calculatedEmissions: number | null
    dataStatus: "draft" | "submitted" | "approved" | "rejected"
    createdAt: string
    electricity?: { gridRegion: string | null } | null
}

const PAGE_SIZE = 10

interface Props {
    searchParams: Promise<{ page?: string }>
}

function formatDetails(activity: Scope2ActivityDetail): string {
    if (activity.electricity) {
        const region = activity.electricity.gridRegion || "Default"
        return `${activity.inputValue} ${activity.inputUnit} • ${region}`
    }
    return `${activity.inputValue} ${activity.inputUnit}`
}

export default async function Scope2Page({ searchParams }: Props) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const skip = (page - 1) * PAGE_SIZE

    const session = await auth()
    const organizationId = session?.user?.organizationId
    const isSuperAdmin = session?.user?.role === "super_admin"

    const [factors, activities, totalCount] = await Promise.all([
        prisma.emissionFactor.findMany({
            where: { 
                category: "scope2", 
                ...(organizationId && !isSuperAdmin ? { OR: [{ organizationId }, { organizationId: null }] } : {})
            },
            orderBy: { activityType: "asc" },
        }),
        prisma.activityData.findMany({
            where: { 
                scope: "scope2", 
                ...(organizationId && !isSuperAdmin ? { organizationId } : {})
            },
            include: { scope2Electricity: true },
            orderBy: { createdAt: "desc" },
            take: PAGE_SIZE,
            skip,
        }),
        prisma.activityData.count({
            where: { 
                scope: "scope2", 
                ...(organizationId && !isSuperAdmin ? { organizationId } : {})
            },
        }),
    ])

    const formattedActivities: Scope2ActivityDetail[] = activities.map((a) => ({
        id: a.id,
        scope: "scope2" as const,
        activityType: a.activityType,
        inputValue: Number(a.inputValue),
        inputUnit: a.inputUnit,
        calculatedEmissions: a.calculatedEmissions ? Number(a.calculatedEmissions) : null,
        dataStatus: a.dataStatus as "draft" | "submitted" | "approved" | "rejected",
        createdAt: a.createdAt.toISOString(),
        electricity: a.scope2Electricity ? {
            gridRegion: a.scope2Electricity.gridRegion,
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
            <h1 className="text-3xl font-bold">Scope 2: Indirect Energy Emissions</h1>

            {!isSuperAdmin && (
            <Card>
                <CardHeader>
                    <CardTitle>Add Electricity Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                    <Scope2Form factors={formattedFactors} />
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
                            scope="scope2"
                            activityLabels={{ electricity: "Electricity" }}
                        />
                    </div>
                    <Scope2Card activities={formattedActivities} user={session?.user} />
                </CardContent>
            </Card>
        </div>
    )
}