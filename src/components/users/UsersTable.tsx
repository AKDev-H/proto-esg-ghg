"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UsersCard } from "./UsersCard"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import type { User } from "@/modules/users/types"

interface UsersTableProps {
    users: User[]
    currentUserId?: string
    onUserDeleted?: (id: string) => void
}

export function UsersTable({ users, currentUserId, onUserDeleted }: UsersTableProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" })
        if (res.ok) {
            onUserDeleted?.(deleteId)
        }
        setIsDeleting(false)
        setDeleteId(null)
    }

    const userToDelete = users.find(u => u.id === deleteId)

    return (
        <div>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted">
                                        {user.role.replace("_", " ")}
                                    </span>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}</TableCell>
                                <TableCell>
                                    <button
                                        className={`p-2 rounded-md ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}
                                        onClick={() => user.id !== currentUserId && setDeleteId(user.id)}
                                        disabled={user.id === currentUserId}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        </svg>
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <UsersCard users={users} currentUserId={currentUserId} onDelete={(id) => id !== currentUserId && setDeleteId(id)} />
            
            <DeleteConfirmModal
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete User?"
                description={`Are you sure you want to delete ${userToDelete?.name || 'this user'}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={isDeleting}
                itemName={userToDelete?.name}
            />
        </div>
    )
}
