import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canGenerateReports } from "@/lib/permissions";
import { ensureStorageDirs } from "@/lib/excel-import/storage";

const initSchema = z.object({
    fileName: z.string().min(1),
    reportingYear: z.number().int().min(2000).max(2100),
    fileSize: z.number().int().positive(),
    totalChunks: z.number().int().positive(),
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

        const body = initSchema.parse(await request.json());

        if (!body.fileName.toLowerCase().endsWith(".xlsx")) {
            return NextResponse.json(
                { error: "Only .xlsx files are allowed" },
                { status: 400 },
            );
        }

        await ensureStorageDirs();

        const organization = await prisma.organization.findUnique({
            where: { id: session.user.organizationId },
            select: { id: true },
        });

        if (!organization) {
            return NextResponse.json(
                {
                    error: "Organization not found. Sign out and sign in again to refresh your session.",
                },
                { status: 400 },
            );
        }

        const excelImport = await prisma.excelImport.create({
            data: {
                organizationId: session.user.organizationId,
                uploadedById: session.user.id,
                fileName: body.fileName,
                originalSize: body.fileSize,
                filePath: "",
                reportingYear: body.reportingYear,
                status: "uploading",
            },
        });

        return NextResponse.json({
            uploadId: excelImport.id,
            totalChunks: body.totalChunks,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid upload metadata" },
                { status: 400 },
            );
        }
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
        ) {
            return NextResponse.json(
                {
                    error: "Organization not found. Sign out and sign in again to refresh your session.",
                },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { error: "Failed to init upload" },
            { status: 500 },
        );
    }
}
