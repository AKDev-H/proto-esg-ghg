import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canGenerateReports } from "@/lib/permissions";
import { buildGhgExcelTemplateBuffer } from "@/modules/reports/excel/template";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!canGenerateReports(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const buffer = buildGhgExcelTemplateBuffer();

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition":
                    'attachment; filename="ghg-protocol-matc-template.xlsx"',
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to generate template" },
            { status: 500 },
        );
    }
}
