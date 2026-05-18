import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AuditTable } from "@/components/audit/AuditTable"
import type { AuditLog } from "@/modules/audit/types"

export default async function AuditPage() {
    const session = await auth()
    const organizationId = session?.user?.organizationId

    const logs = await prisma.auditLog.findMany({
        where: organizationId ? { organizationId } : {},
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    })

    const formattedLogs: AuditLog[] = logs.map((l) => ({
        id: l.id,
        organizationId: l.organizationId,
        userId: l.userId ?? undefined,
        action: l.action as AuditLog["action"],
        entityType: l.entityType,
        entityId: l.entityId,
        oldValue: l.oldValue as Record<string, unknown> | null ?? undefined,
        newValue: l.newValue as Record<string, unknown> | null ?? undefined,
        ipAddress: l.ipAddress ?? undefined,
        userAgent: l.userAgent ?? undefined,
        createdAt: l.createdAt.toISOString(),
user: l.user ? {
            name: l.user.name,
            email: l.user.email,
        } : undefined,
    }))

    return <AuditTable initialLogs={formattedLogs} />
}