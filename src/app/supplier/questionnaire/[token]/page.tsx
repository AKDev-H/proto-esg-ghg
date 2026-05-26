import { SupplierQuestionnaireForm } from "@/modules/suppliers/components/supplier-questionnaire-form";

export default async function SupplierQuestionnairePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    return <SupplierQuestionnaireForm token={token} />;
}
