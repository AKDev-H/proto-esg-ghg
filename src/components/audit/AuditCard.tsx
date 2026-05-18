"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AuditLog } from "@/modules/audit/types"

const ACTION_BADGES: Record<string, "default" | "destructive" | "secondary"> = {
    create: "default",
    update: "secondary",
    delete: "destructive",
    submit: "default",
    approve: "default",
    reject: "destructive",
}

interface AuditCardProps {
    logs: AuditLog[]
    onView?: (log: AuditLog) => void
}

export function AuditCard({ logs, onView }: AuditCardProps) {
    if (logs.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No audit logs found
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4 md:hidden">
            {logs.map((log) => (
                <Card key={log.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base">{log.entityType}</CardTitle>
                                <Badge variant={ACTION_BADGES[log.action] || "secondary"}>{log.action}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-sm">
                            <p className="font-medium">{log.user?.name || "System"}</p>
                            <p className="text-muted-foreground text-xs">{log.user?.email}</p>
                        </div>
                        {log.newValue && (
                            <p className="mt-2 text-xs text-muted-foreground truncate">
                                {JSON.stringify(log.newValue).slice(0, 50)}
                            </p>
                        )}
                        <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => onView?.(log)}>
                            View Details
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}