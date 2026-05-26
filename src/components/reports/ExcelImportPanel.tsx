"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { generateYearOptions } from "@/lib/utils";
import type { ExcelImportRecord } from "@/modules/reports/excel/types";

const CHUNK_SIZE = 256 * 1024;

interface UploadPreview {
    totalEmissions: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    activityCount: number;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadPdfFromBase64(base64: string, fileName: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function ExcelImportPanel({
    onReportGenerated,
}: {
    onReportGenerated?: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const years = generateYearOptions();
    const [reportingYear, setReportingYear] = useState(String(new Date().getFullYear()));
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [imports, setImports] = useState<ExcelImportRecord[]>([]);
    const [preview, setPreview] = useState<UploadPreview | null>(null);
    const [lastImportId, setLastImportId] = useState<string | null>(null);

    const fetchImports = useCallback(async () => {
        const res = await fetch("/api/reports/excel/imports");
        if (res.ok) {
            const data = await res.json();
            setImports(data.imports);
        }
    }, []);

    useEffect(() => {
        fetchImports();
    }, [fetchImports]);

    const handleDownloadTemplate = () => {
        window.open("/api/reports/excel/template", "_blank");
    };

    const uploadFileInChunks = async (file: File) => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        const initRes = await fetch("/api/reports/excel/upload/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fileName: file.name,
                reportingYear: parseInt(reportingYear, 10),
                fileSize: file.size,
                totalChunks,
            }),
        });

        if (!initRes.ok) {
            const err = await initRes.json().catch(() => null);
            throw new Error(err?.error ?? "Failed to start upload");
        }

        const { uploadId } = await initRes.json();

        for (let index = 0; index < totalChunks; index++) {
            const start = index * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append("uploadId", uploadId);
            formData.append("chunkIndex", String(index));
            formData.append("chunk", chunk);

            const chunkRes = await fetch("/api/reports/excel/upload/chunk", {
                method: "POST",
                body: formData,
            });

            if (!chunkRes.ok) {
                throw new Error(`Failed to upload chunk ${index + 1}`);
            }

            setUploadProgress(Math.round(((index + 1) / totalChunks) * 100));
        }

        const completeRes = await fetch("/api/reports/excel/upload/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uploadId }),
        });

        if (!completeRes.ok) {
            const err = await completeRes.json().catch(() => null);
            throw new Error(
                err?.details?.join(", ") ?? err?.error ?? "Failed to process Excel file",
            );
        }

        return completeRes.json();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            toast({
                variant: "destructive",
                title: "Invalid file",
                description: "Only .xlsx Excel files are allowed.",
            });
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setPreview(null);
        setLastImportId(null);

        try {
            const result = await uploadFileInChunks(file);
            setPreview(result.preview);
            setLastImportId(result.import.id);
            await fetchImports();
            toast({
                title: "Excel imported",
                description: `${result.import.rowCount} activities loaded and compressed.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upload failed",
                description:
                    error instanceof Error ? error.message : "Could not import Excel file.",
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleGenerateFromExcel = async (importId: string) => {
        setGeneratingId(importId);
        try {
            const res = await fetch("/api/reports/generate-from-excel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    importId,
                    reportingYear: parseInt(reportingYear, 10),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.error ?? "Failed to generate report");
            }

            const data = await res.json();
            if (data.pdfBase64) {
                downloadPdfFromBase64(
                    data.pdfBase64,
                    data.fileName ?? `ESG_Report_${reportingYear}.pdf`,
                );
            }

            toast({
                title: "Report generated",
                description: "ESG summary created from imported Excel data.",
            });
            onReportGenerated?.();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Generation failed",
                description:
                    error instanceof Error ? error.message : "Could not generate report.",
            });
        } finally {
            setGeneratingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5" />
                        GHG Protocol / MATC Excel Import
                    </CardTitle>
                    <CardDescription>
                        Download the MATC-compliant template, fill in your inventory, then
                        upload. Files are uploaded in chunks, gzip-compressed, and stored
                        under <code className="text-xs">storage/excel-imports/</code>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Reporting Year</label>
                            <select
                                value={reportingYear}
                                onChange={(e) => setReportingYear(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                disabled={uploading}
                            >
                                {years.map((y) => (
                                    <option key={y.value} value={String(y.value)}>
                                        {y.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 items-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDownloadTemplate}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Template
                            </Button>
                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Excel
                                    </>
                                )}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {uploading && (
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    {preview && (
                        <div className="rounded-lg border bg-muted/30 p-4 grid gap-2 sm:grid-cols-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Activities</p>
                                <p className="font-semibold">{preview.activityCount}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Scope 1</p>
                                <p className="font-semibold">
                                    {(preview.scope1Emissions / 1000).toFixed(1)} tCO2e
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Scope 2</p>
                                <p className="font-semibold">
                                    {(preview.scope2Emissions / 1000).toFixed(1)} tCO2e
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Scope 3</p>
                                <p className="font-semibold">
                                    {(preview.scope3Emissions / 1000).toFixed(1)} tCO2e
                                </p>
                            </div>
                            {lastImportId && (
                                <div className="sm:col-span-4 pt-2">
                                    <Button
                                        onClick={() => handleGenerateFromExcel(lastImportId)}
                                        disabled={generatingId === lastImportId}
                                    >
                                        {generatingId === lastImportId
                                            ? "Generating..."
                                            : "Generate Report from This Import"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Imported Excel Files</CardTitle>
                </CardHeader>
                <CardContent>
                    {imports.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No Excel imports yet. Download the template to get started.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {imports.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
                                >
                                    <div>
                                        <p className="font-medium">{item.fileName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.rowCount} rows · {item.reportingYear} ·{" "}
                                            {formatBytes(item.originalSize)}
                                            {item.compressedSize
                                                ? ` → ${formatBytes(item.compressedSize)} compressed`
                                                : ""}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{item.status}</Badge>
                                        <Button
                                            size="sm"
                                            onClick={() => handleGenerateFromExcel(item.id)}
                                            disabled={generatingId === item.id}
                                        >
                                            {generatingId === item.id
                                                ? "Generating..."
                                                : "Generate Report"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
