"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { AuditCard } from "./AuditCard"
import type { AuditLog } from "@/modules/audit/types"

interface AuditTableProps {
    initialLogs: AuditLog[]
}

const ACTION_STYLES: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    submit: "bg-purple-100 text-purple-800",
    approve: "bg-green-100 text-green-800",
    reject: "bg-red-100 text-red-800",
}

export function AuditTable({ initialLogs }: AuditTableProps) {
    const [logs] = useState(initialLogs)
    const [viewingLog, setViewingLog] = useState<AuditLog | null>(null)

    return (
        <div>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No audit logs found
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{log.user?.name || "System"}</p>
                                            <p className="text-xs text-muted-foreground">{log.user?.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ACTION_STYLES[log.action] || "bg-gray-100 text-gray-800"}`}>
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell>{log.entityType}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                        {log.newValue ? JSON.stringify(log.newValue).slice(0, 50) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => setViewingLog(log)}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <AuditCard logs={logs} onView={setViewingLog} />

            <Dialog open={!!viewingLog} onOpenChange={() => setViewingLog(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                        <DialogDescription>View full details of this audit entry</DialogDescription>
                    </DialogHeader>
                    {viewingLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Timestamp</p>
                                    <p className="font-medium">
                                        {new Date(viewingLog.createdAt).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Action</p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ACTION_STYLES[viewingLog.action] || "bg-gray-100 text-gray-800"}`}>
                                        {viewingLog.action}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">User</p>
                                    <p className="font-medium">{viewingLog.user?.name || "System"}</p>
                                    <p className="text-xs text-muted-foreground">{viewingLog.user?.email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Entity</p>
                                    <p className="font-medium">{viewingLog.entityType}</p>
                                    <p className="text-xs text-muted-foreground">ID: {viewingLog.entityId}</p>
                                </div>
                            </div>

                            {viewingLog.ipAddress && (
                                <div>
                                    <p className="text-sm text-muted-foreground">IP Address</p>
                                    <p className="font-medium">{viewingLog.ipAddress}</p>
                                </div>
                            )}

                            {viewingLog.oldValue && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Old Value</p>
                                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                                        {JSON.stringify(viewingLog.oldValue, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {viewingLog.newValue && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">New Value</p>
                                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                                        {JSON.stringify(viewingLog.newValue, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}