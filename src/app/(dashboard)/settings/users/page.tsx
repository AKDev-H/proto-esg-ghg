import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { UserForm } from "@/components/users/UserForm"
import { UsersTable } from "@/components/users/UsersTable"
import type { User } from "@/modules/users/types"

export default async function UserManagementPage() {
    const session = await auth()
    const organizationId = session?.user?.organizationId

    const users = await prisma.user.findMany({
        where: organizationId ? { organizationId } : {},
        orderBy: { createdAt: "desc" },
    })

    const formattedUsers: User[] = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as User["role"],
        organizationId: u.organizationId,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">User Management</h1>
                <UserForm />
            </div>

            <UsersTable initialUsers={formattedUsers} />
        </div>
    )
}