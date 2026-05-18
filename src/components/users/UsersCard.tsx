"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import type { User } from "@/modules/users/types"

interface UsersCardProps {
    users: User[]
    onDelete?: (id: string) => void
}

export function UsersCard({ users, onDelete }: UsersCardProps) {
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
            if (res.ok) onDelete?.(id)
        } catch (error) {
            console.error(error)
        }
    }

    if (users.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No users found
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4 md:hidden">
            {users.map((user) => (
                <Card key={user.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{user.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <Badge variant="secondary">{user.role.replace("_", " ")}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                Joined: {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(user.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}