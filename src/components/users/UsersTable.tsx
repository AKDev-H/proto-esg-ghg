"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UsersCard } from "./UsersCard"
import type { User } from "@/modules/users/types"

interface UsersTableProps {
    initialUsers: User[]
    onRefresh?: () => void
}

export function UsersTable({ initialUsers, onRefresh }: UsersTableProps) {
    const [users, setUsers] = useState(initialUsers)

    const handleDelete = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id))
        onRefresh?.()
    }

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
                                        className="p-2 hover:bg-muted rounded-md"
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this user?")) {
                                                fetch(`/api/users/${user.id}`, { method: "DELETE" })
                                                    .then((res) => res.ok && handleDelete(user.id))
                                            }
                                        }}
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
            <UsersCard users={users} onDelete={handleDelete} />
        </div>
    )
}