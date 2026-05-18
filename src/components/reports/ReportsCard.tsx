"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Download, Eye, Trash2 } from "lucide-react"
import type { Report } from "@/modules/reports/types"

interface ReportsCardProps {
    reports: Report[]
    onView?: (id: string) => void
    onDownload?: (id: string) => void
    onDeleteClick?: (id: string) => void
    deletingId?: string | null
}

export function ReportsCard({ reports, onView, onDownload, onDeleteClick, deletingId }: ReportsCardProps) {
    if (reports.length === 0) {
        return (
            <Card className="md:hidden">
                <EmptyState 
                    title="No reports generated yet"
                    description="Generate your first ESG report to see it here."
                />
            </Card>
        )
    }

    return (
        <div className="space-y-4 md:hidden">
            {reports.map((report) => (
                <Card key={report.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{report.reportingYear}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {report.reportType === "esg_summary" ? "ESG Summary" : "Detailed"}
                                </p>
                            </div>
                            <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                                {report.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4">
                            Created: {new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => onView?.(report.id)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onDownload?.(report.id)}>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onDeleteClick?.(report.id)}
                                disabled={deletingId === report.id}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                {deletingId === report.id ? (
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}