import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageSuppliers } from "@/lib/permissions";
import { createInviteSchema } from "@/modules/suppliers/schemas";
import { createSupplierInvite } from "@/modules/suppliers/services/supplier-questionnaires";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!canManageSuppliers(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id: supplierId } = await params;
        const body = await request.json();
        const data = createInviteSchema.parse(body);

        const result = await createSupplierInvite(
            session.user.organizationId,
            supplierId,
            session.user.id,
            data.questionnaireTypes,
            data.expiresInDays,
        );

        return NextResponse.json(
            {
                invite: {
                    id: result.invite.id,
                    expiresAt: result.invite.expiresAt.toISOString(),
                    questionnaireTypes: result.invite.questionnaireTypes,
                },
                url: result.url,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Supplier not found") {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            if (error.name === "ZodError") {
                return NextResponse.json(
                    { error: "Invalid invite data" },
                    { status: 400 },
                );
            }
        }
        return NextResponse.json(
            { error: "Failed to create questionnaire invite" },
            { status: 500 },
        );
    }
}
