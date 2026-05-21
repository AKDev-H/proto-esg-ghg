"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { TableEmptyState } from "@/components/ui/empty-state";
import { FileText, Download, Eye, Trash2 } from "lucide-react";
import { generateYearOptions } from "@/lib/utils";
import { ReportsCard } from "./ReportsCard";
import { ReportDetailModal } from "./ReportDetailModal";
import type { Report } from "@/modules/reports/types";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ReportsListProps {
    reports: Report[];
    pagination: PaginationInfo;
    canGenerateReports?: boolean;
    canDeleteReports?: boolean;
}

export function ReportsList({
    reports,
    pagination,
    canGenerateReports = false,
    canDeleteReports = false,
}: ReportsListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedYear, setSelectedYear] = useState(
        String(new Date().getFullYear()),
    );
    const [viewingReport, setViewingReport] = useState<{
        id: string;
        data: Record<string, unknown> | null;
        loading: boolean;
    } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const years = generateYearOptions();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/reports?${params.toString()}`);
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/reports/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportingYear: parseInt(selectedYear),
                    reportType: "esg_summary",
                }),
            });

            if (res.ok) {
                const data = await res.json();

                if (data.pdfBase64) {
                    const binaryString = atob(data.pdfBase64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: "application/pdf" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `ESG_Summary_Report_${selectedYear}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                startTransition(() => {
                    router.refresh();
                });
            }
        } catch (error) {
        } finally {
            setIsGenerating(false);
        }
    };

    const handleViewReport = async (reportId: string) => {
        setViewingReport({ id: reportId, data: null, loading: true });
        try {
            const res = await fetch(`/api/reports/${reportId}`);
            if (res.ok) {
                const data = await res.json();
                setViewingReport({ id: reportId, data, loading: false });
            }
        } catch (error) {
            setViewingReport(null);
        }
    };

    const handleDownloadReport = async (reportId: string) => {
        try {
            const res = await fetch(`/api/reports/${reportId}/export`);
            if (res.ok) {
                const data = await res.json();
                if (data.pdfBase64) {
                    const binaryString = atob(data.pdfBase64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: "application/pdf" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = data.fileName || `ESG_Report_${reportId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }
        } catch (error) {
        }
    };

    const handleDeleteReport = async () => {
        if (!deleteConfirmId) return;

        const reportId = deleteConfirmId;
        setDeletingId(reportId);
        setDeleteConfirmId(null);
        try {
            const res = await fetch(`/api/reports/${reportId}/delete`, {
                method: "DELETE",
            });
            if (res.ok) {
                startTransition(() => {
                    router.refresh();
                });
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Reports</h1>
            </div>

            {canGenerateReports && (
            <Card>
                <CardHeader>
                    <CardTitle>Generate New Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">
                                Reporting Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                                className="flex h10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {years.map((y) => (
                                    <option
                                        key={y.value}
                                        value={String(y.value)}
                                    >
                                        {y.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            {isGenerating
                                ? "Generating..."
                                : "Generate ESG Summary"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Report History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.length === 0 ? (
                                    <TableEmptyState 
                                        title="No reports generated yet" 
                                        description="Generate your first ESG report to see it here."
                                    />
                                ) : (
                                    reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">
                                                {report.reportingYear}
                                            </TableCell>
                                            <TableCell>
                                                {report.reportType ===
                                                "esg_summary"
                                                    ? "ESG Summary"
                                                    : "Detailed"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        report.status ===
                                                        "completed"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {report.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    report.createdAt,
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleViewReport(
                                                                report.id,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleDownloadReport(
                                                                report.id,
                                                            )
                                                        }
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    {canDeleteReports && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setDeleteConfirmId(
                                                                report.id,
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            report.id
                                                        }
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        {deletingId ===
                                                        report.id ? (
                                                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing{" "}
                                {(pagination.page - 1) * pagination.limit + 1}{" "}
                                to{" "}
                                {Math.min(
                                    pagination.page * pagination.limit,
                                    pagination.total,
                                )}{" "}
                                of {pagination.total} results
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(pagination.page - 1)
                                    }
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from(
                                    { length: pagination.totalPages },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === pagination.page
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(pagination.page + 1)
                                    }
                                    disabled={
                                        pagination.page ===
                                        pagination.totalPages
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    <ReportsCard
                        reports={reports}
                        onView={handleViewReport}
                        onDownload={handleDownloadReport}
                        onDeleteClick={canDeleteReports ? (id) => setDeleteConfirmId(id) : undefined}
                        deletingId={deletingId}
                    />
                </CardContent>
            </Card>

            {viewingReport && (
                <ReportDetailModal
                    reportId={viewingReport.id}
                    onClose={() => setViewingReport(null)}
                    onDownload={() => handleDownloadReport(viewingReport.id)}
                />
            )}

            <DeleteConfirmModal
                open={!!deleteConfirmId}
                onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                onConfirm={handleDeleteReport}
                loading={!!deletingId}
                itemName="Report"
            />
        </div>
    );
}
