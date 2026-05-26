import { NextRequest, NextResponse } from "next/server";
import { submitQuestionnaireSchema } from "@/modules/suppliers/schemas";
import { submitQuestionnaireResponse } from "@/modules/suppliers/services/supplier-questionnaires";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = submitQuestionnaireSchema.parse(body);

        const response = await submitQuestionnaireResponse(data.token, {
            respondentName: data.respondentName,
            respondentEmail: data.respondentEmail,
            respondentTitle: data.respondentTitle,
            carbonDisclosure: data.carbonDisclosure,
            pcf: data.pcf,
            energyUsage: data.energyUsage,
        });

        return NextResponse.json(
            {
                success: true,
                responseId: response.id,
                submittedAt: response.submittedAt.toISOString(),
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "ZodError") {
                return NextResponse.json(
                    { error: "Please complete all required fields" },
                    { status: 400 },
                );
            }
            if (
                error.message.includes("Invalid") ||
                error.message.includes("already been submitted") ||
                error.message.includes("no longer valid") ||
                error.message.includes("required")
            ) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        }
        return NextResponse.json(
            { error: "Failed to submit questionnaire" },
            { status: 500 },
        );
    }
}
