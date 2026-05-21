import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import { UsersManagement } from "@/modules/users/components/users-management";
import { redirect } from "next/navigation";
import type { User } from "@/modules/users/types";

export default async function UserManagementPage() {
    const session = await auth();

    if (!canManageUsers(session?.user?.role)) {
        redirect("/dashboard");
    }

    const organizationId = session?.user?.organizationId;

    const users = await prisma.user.findMany({
        where: organizationId ? { organizationId } : {},
        orderBy: { createdAt: "desc" },
    });

    const formattedUsers: User[] = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as User["role"],
        organizationId: u.organizationId,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
    }));

    return (
        <UsersManagement
            users={formattedUsers}
            currentUserId={session?.user?.id}
        />
    );
}
