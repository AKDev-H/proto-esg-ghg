import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { OrganizationView } from "@/components/organization/OrganizationView"
import type { OrganizationUser } from "@/modules/organizations/types"

export default async function OrganizationSettingsPage() {
    const session = await auth()
    const organizationId = session?.user?.organizationId

    if (!organizationId) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No organization found</p>
            </div>
        )
    }

    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            },
        },
    })

    if (!organization) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Organization not found</p>
            </div>
        )
    }

    const settings = organization.settings as Record<string, string> | null
    const users: OrganizationUser[] = organization.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
    }))

    return (
        <OrganizationView
            organization={{
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                country: organization.country,
                currency: organization.currency,
                industryType: organization.industryType ?? "other",
                settings: settings ?? undefined,
                users,
            }}
        />
    )
}