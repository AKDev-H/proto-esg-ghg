import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canGenerateReports } from "@/lib/permissions";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!canGenerateReports(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const imports = await prisma.excelImport.findMany({
            where: {
                organizationId: session.user.organizationId,
                status: "completed",
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json({
            imports: imports.map((item) => ({
                id: item.id,
                fileName: item.fileName,
                reportingYear: item.reportingYear,
                status: item.status,
                rowCount: item.rowCount,
                originalSize: item.originalSize,
                compressedSize: item.compressedSize,
                createdAt: item.createdAt.toISOString(),
                parsedSummary: item.parsedSummary,
            })),
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch imports" }, { status: 500 });
    }
}
