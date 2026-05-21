"use client";

import { useRouter } from "next/navigation";
import { UserForm } from "@/components/users/UserForm";
import { UsersTable } from "@/components/users/UsersTable";
import type { User } from "@/modules/users/types";

interface UsersManagementProps {
    users: User[];
    currentUserId?: string;
}

export function UsersManagement({ users, currentUserId }: UsersManagementProps) {
    const router = useRouter();

    const handleMutation = () => {
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">User Management</h1>
                <UserForm onSuccess={handleMutation} />
            </div>

            <UsersTable
                users={users}
                currentUserId={currentUserId}
                onUserDeleted={handleMutation}
            />
        </div>
    );
}
