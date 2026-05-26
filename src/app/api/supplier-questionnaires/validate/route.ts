import { NextRequest, NextResponse } from "next/server";
import {
    markInviteOpened,
    validateInviteToken,
} from "@/modules/suppliers/services/supplier-questionnaires";
import type {
    PublicQuestionnaireContext,
    QuestionnaireInviteStatus,
    QuestionnaireType,
    SupplierCategory,
} from "@/modules/suppliers/types";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 },
            );
        }

        const validation = await validateInviteToken(token);

        if (!validation) {
            return NextResponse.json(
                { error: "Invalid or expired questionnaire link" },
                { status: 404 },
            );
        }

        const { invite, status, alreadySubmitted } = validation;

        if (!alreadySubmitted && status !== "expired" && status !== "revoked") {
            await markInviteOpened(invite.id);
        }

        const context: PublicQuestionnaireContext = {
            organizationName: invite.organization.name,
            supplierName: invite.supplier.name,
            supplierCategories: invite.supplier.categories as SupplierCategory[],
            supplierOtherCategoryType: invite.supplier.otherCategoryType,
            questionnaireTypes: invite.questionnaireTypes as QuestionnaireType[],
            status: status as QuestionnaireInviteStatus,
            expiresAt: invite.expiresAt.toISOString(),
            alreadySubmitted,
        };

        return NextResponse.json(context);
    } catch {
        return NextResponse.json(
            { error: "Failed to validate questionnaire link" },
            { status: 500 },
        );
    }
}
