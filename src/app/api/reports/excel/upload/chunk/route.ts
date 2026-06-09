import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canGenerateReports } from "@/lib/permissions";
import { saveUploadChunk } from "@/lib/excel-import/storage";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!canGenerateReports(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await request.formData();
        const uploadId = formData.get("uploadId") as string;
        const chunkIndex = parseInt(formData.get("chunkIndex") as string, 10);
        const chunk = formData.get("chunk") as File | null;

        if (!uploadId || Number.isNaN(chunkIndex) || !chunk) {
            return NextResponse.json({ error: "Invalid chunk payload" }, { status: 400 });
        }

        const excelImport = await prisma.excelImport.findFirst({
            where: {
                id: uploadId,
                organizationId: session.user.organizationId,
                status: "uploading",
            },
        });

        if (!excelImport) {
            return NextResponse.json({ error: "Upload session not found" }, { status: 404 });
        }

        const buffer = Buffer.from(await chunk.arrayBuffer());
        await saveUploadChunk(uploadId, chunkIndex, buffer);

        return NextResponse.json({ ok: true, chunkIndex });
    } catch (error) {
        console.error("Failed to save Excel upload chunk", error);
        return NextResponse.json({ error: "Failed to save chunk" }, { status: 500 });
    }
}
