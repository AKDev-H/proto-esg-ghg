import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ReportsList } from "@/components/reports/ReportsList"
import type { Report } from "@/modules/reports/types"

export const dynamic = "force-dynamic"

interface Props {
    searchParams: Promise<{ page?: string }>
}

const PAGE_SIZE = 10

export default async function ReportsPage({ searchParams }: Props) {
    const params = await searchParams
    const page = parseInt(params.page || "1")
    const skip = (page - 1) * PAGE_SIZE

    const session = await auth()
    const organizationId = session?.user?.organizationId
    const isSuperAdmin = session?.user?.role === "super_admin"

    const where = organizationId && !isSuperAdmin ? { organizationId } : {}

    const [reports, total] = await Promise.all([
        prisma.report.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: PAGE_SIZE,
            skip,
        }),
        prisma.report.count({ where }),
    ])

    const formattedReports: Report[] = reports.map((r) => ({
        id: r.id,
        organizationId: r.organizationId,
        reportingYear: r.reportingYear,
        reportType: r.reportType as Report["reportType"],
        filePath: r.filePath ?? undefined,
        status: r.status as Report["status"],
        generatedAt: r.generatedAt?.toISOString(),
        generatedById: r.generatedById ?? undefined,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt?.toISOString(),
    }))

    const pagination = {
        page,
        limit: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
    }

    return <ReportsList initialReports={formattedReports} initialPagination={pagination} />
}