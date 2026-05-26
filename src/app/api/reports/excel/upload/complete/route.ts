import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canGenerateReports } from "@/lib/permissions";
import {
    assembleAndCompressExcel,
    readStoredExcel,
} from "@/lib/excel-import/storage";
import {
    excelActivitiesToSummaryInput,
    parseGhgExcelWorkbook,
} from "@/modules/reports/excel/parser";
import { buildReportSummaryFromActivities } from "@/modules/reports/services/build-report-summary";

const completeSchema = z.object({
    uploadId: z.string().min(1),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canGenerateReports(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { uploadId } = completeSchema.parse(await request.json());

        const excelImport = await prisma.excelImport.findFirst({
            where: {
                id: uploadId,
                organizationId: session.user.organizationId,
                status: "uploading",
            },
        });

        if (!excelImport) {
            return NextResponse.json(
                { error: "Upload session not found" },
                { status: 404 },
            );
        }

        const organization = await prisma.organization.findUnique({
            where: { id: session.user.organizationId },
        });

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 },
            );
        }

        const { filePath, originalSize, compressedSize } =
            await assembleAndCompressExcel(
                uploadId,
                session.user.organizationId,
            );

        const buffer = await readStoredExcel(filePath);
        const parsed = parseGhgExcelWorkbook(buffer);

        if (parsed.errors.length > 0) {
            await prisma.excelImport.update({
                where: { id: uploadId },
                data: { status: "failed", filePath },
            });
            return NextResponse.json(
                { error: "Excel validation failed", details: parsed.errors },
                { status: 400 },
            );
        }

        const summaryInput = excelActivitiesToSummaryInput(parsed.activities);
        const summary = buildReportSummaryFromActivities(
            summaryInput,
            organization.country,
            organization.industryType,
        );

        const updated = await prisma.excelImport.update({
            where: { id: uploadId },
            data: {
                status: "completed",
                filePath,
                originalSize,
                compressedSize,
                rowCount: parsed.activities.length,
                reportingYear:
                    parsed.meta.reportingYear || excelImport.reportingYear,
                parsedSummary: {
                    meta: { ...parsed.meta },
                    totalEmissions: summary.totalEmissions,
                    scope1Emissions: summary.scope1Emissions,
                    scope2Emissions: summary.scope2Emissions,
                    scope3Emissions: summary.scope3Emissions,
                    activityCount: summary.activityCount,
                } satisfies Prisma.InputJsonObject,
            },
        });

        await prisma.auditLog.create({
            data: {
                organizationId: session.user.organizationId,
                userId: session.user.id,
                action: "import_excel",
                entityType: "ExcelImport",
                entityId: updated.id,
                newValue: {
                    fileName: updated.fileName,
                    rowCount: updated.rowCount,
                    compressedSize,
                },
            },
        });

        return NextResponse.json({
            import: {
                id: updated.id,
                fileName: updated.fileName,
                reportingYear: updated.reportingYear,
                rowCount: updated.rowCount,
                originalSize: updated.originalSize,
                compressedSize: updated.compressedSize,
                status: updated.status,
            },
            preview: {
                totalEmissions: summary.totalEmissions,
                scope1Emissions: summary.scope1Emissions,
                scope2Emissions: summary.scope2Emissions,
                scope3Emissions: summary.scope3Emissions,
                activityCount: summary.activityCount,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { error: "Failed to complete upload" },
            { status: 500 },
        );
    }
}
