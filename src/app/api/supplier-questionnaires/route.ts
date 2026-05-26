import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    listInvites,
    listQuestionnaireResponses,
} from "@/modules/suppliers/services/supplier-questionnaires";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const view = searchParams.get("view");

        if (view === "responses") {
            const responses = await listQuestionnaireResponses(
                session.user.organizationId,
            );
            return NextResponse.json({ responses });
        }

        const invites = await listInvites(session.user.organizationId);
        return NextResponse.json({ invites });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch questionnaire data" },
            { status: 500 },
        );
    }
}
