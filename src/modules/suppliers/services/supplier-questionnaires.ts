import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
    QuestionnaireInviteStatus,
    QuestionnaireType,
    SupplierCategory,
} from "@/modules/suppliers/types";
import {
    buildQuestionnaireUrl,
    generateInviteToken,
    hashInviteToken,
} from "@/modules/suppliers/services/token";

function isInviteExpired(expiresAt: Date): boolean {
    return expiresAt.getTime() < Date.now();
}

function resolveInviteStatus(
    status: QuestionnaireInviteStatus,
    expiresAt: Date,
): QuestionnaireInviteStatus {
    if (status === "submitted" || status === "revoked") return status;
    if (isInviteExpired(expiresAt)) return "expired";
    return status;
}

export async function createSupplierInvite(
    organizationId: string,
    supplierId: string,
    createdById: string,
    questionnaireTypes: QuestionnaireType[],
    expiresInDays: number,
) {
    const supplier = await prisma.supplier.findFirst({
        where: { id: supplierId, organizationId },
    });

    if (!supplier) {
        throw new Error("Supplier not found");
    }

    const token = generateInviteToken();
    const tokenHash = hashInviteToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invite = await prisma.supplierQuestionnaireInvite.create({
        data: {
            organizationId,
            supplierId,
            tokenHash,
            questionnaireTypes,
            expiresAt,
            createdById,
            sentAt: new Date(),
        },
        include: {
            supplier: true,
        },
    });

    return {
        invite,
        token,
        url: buildQuestionnaireUrl(token),
    };
}

export async function validateInviteToken(token: string) {
    const tokenHash = hashInviteToken(token);

    const invite = await prisma.supplierQuestionnaireInvite.findUnique({
        where: { tokenHash },
        include: {
            supplier: true,
            organization: true,
            response: true,
        },
    });

    if (!invite) {
        return null;
    }

    const status = resolveInviteStatus(
        invite.status as QuestionnaireInviteStatus,
        invite.expiresAt,
    );

    if (status === "expired" && invite.status !== "expired") {
        await prisma.supplierQuestionnaireInvite.update({
            where: { id: invite.id },
            data: { status: "expired" },
        });
    }

    return {
        invite,
        status,
        alreadySubmitted: !!invite.response || status === "submitted",
    };
}

export async function markInviteOpened(inviteId: string) {
    const invite = await prisma.supplierQuestionnaireInvite.findUnique({
        where: { id: inviteId },
    });

    if (!invite || invite.status === "submitted" || invite.status === "revoked") {
        return;
    }

    if (isInviteExpired(invite.expiresAt)) {
        await prisma.supplierQuestionnaireInvite.update({
            where: { id: inviteId },
            data: { status: "expired" },
        });
        return;
    }

    if (invite.status === "pending") {
        await prisma.supplierQuestionnaireInvite.update({
            where: { id: inviteId },
            data: { status: "opened", openedAt: new Date() },
        });
    }
}

export async function submitQuestionnaireResponse(
    token: string,
    data: {
        respondentName: string;
        respondentEmail: string;
        respondentTitle?: string;
        carbonDisclosure?: Record<string, unknown>;
        pcf?: Record<string, unknown>;
        energyUsage?: Record<string, unknown>;
    },
) {
    const validation = await validateInviteToken(token);

    if (!validation) {
        throw new Error("Invalid questionnaire link");
    }

    const { invite, status, alreadySubmitted } = validation;

    if (alreadySubmitted) {
        throw new Error("This questionnaire has already been submitted");
    }

    if (status === "expired" || status === "revoked") {
        throw new Error("This questionnaire link is no longer valid");
    }

    const requiredTypes = invite.questionnaireTypes as QuestionnaireType[];

    if (requiredTypes.includes("carbon_disclosure") && !data.carbonDisclosure) {
        throw new Error("Carbon disclosure section is required");
    }
    if (requiredTypes.includes("pcf") && !data.pcf) {
        throw new Error("PCF section is required");
    }
    if (requiredTypes.includes("energy_usage") && !data.energyUsage) {
        throw new Error("Energy usage section is required");
    }

    const response = await prisma.$transaction(async (tx) => {
        const created = await tx.supplierQuestionnaireResponse.create({
            data: {
                inviteId: invite.id,
                carbonDisclosure: data.carbonDisclosure as Prisma.InputJsonValue | undefined,
                pcf: data.pcf as Prisma.InputJsonValue | undefined,
                energyUsage: data.energyUsage as Prisma.InputJsonValue | undefined,
                respondentName: data.respondentName,
                respondentEmail: data.respondentEmail,
                respondentTitle: data.respondentTitle,
            },
        });

        await tx.supplierQuestionnaireInvite.update({
            where: { id: invite.id },
            data: { status: "submitted", submittedAt: new Date() },
        });

        await tx.auditLog.create({
            data: {
                organizationId: invite.organizationId,
                action: "submit",
                entityType: "SupplierQuestionnaireResponse",
                entityId: created.id,
                newValue: {
                    supplierId: invite.supplierId,
                    supplierName: invite.supplier.name,
                    respondentEmail: data.respondentEmail,
                },
            },
        });

        return created;
    });

    return response;
}

export async function listSuppliersWithInvites(organizationId: string) {
    const suppliers = await prisma.supplier.findMany({
        where: { organizationId },
        include: {
            invites: {
                orderBy: { createdAt: "desc" },
                take: 1,
                include: { response: true },
            },
            _count: { select: { invites: true } },
        },
        orderBy: { name: "asc" },
    });

    return suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        country: supplier.country,
        contactEmail: supplier.contactEmail,
        categories: supplier.categories as SupplierCategory[],
        otherCategoryType: supplier.otherCategoryType,
        createdAt: supplier.createdAt.toISOString(),
        inviteCount: supplier._count.invites,
        latestInviteStatus: supplier.invites[0]
            ? resolveInviteStatus(
                  supplier.invites[0].status as QuestionnaireInviteStatus,
                  supplier.invites[0].expiresAt,
              )
            : null,
    }));
}

export async function listQuestionnaireResponses(organizationId: string) {
    const responses = await prisma.supplierQuestionnaireResponse.findMany({
        where: {
            invite: { organizationId },
        },
        include: {
            invite: {
                include: { supplier: true },
            },
        },
        orderBy: { submittedAt: "desc" },
    });

    return responses.map((response) => ({
        id: response.id,
        inviteId: response.inviteId,
        supplierName: response.invite.supplier.name,
        supplierCategories: response.invite.supplier
            .categories as SupplierCategory[],
        supplierOtherCategoryType: response.invite.supplier.otherCategoryType,
        carbonDisclosure: response.carbonDisclosure as Record<string, unknown> | null,
        pcf: response.pcf as Record<string, unknown> | null,
        energyUsage: response.energyUsage as Record<string, unknown> | null,
        respondentName: response.respondentName,
        respondentEmail: response.respondentEmail,
        respondentTitle: response.respondentTitle,
        submittedAt: response.submittedAt.toISOString(),
    }));
}

export async function listInvites(organizationId: string) {
    const invites = await prisma.supplierQuestionnaireInvite.findMany({
        where: { organizationId },
        include: {
            supplier: true,
            response: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return invites.map((invite) => ({
        id: invite.id,
        supplierId: invite.supplierId,
        supplierName: invite.supplier.name,
        supplierCategories: invite.supplier.categories as SupplierCategory[],
        supplierOtherCategoryType: invite.supplier.otherCategoryType,
        questionnaireTypes: invite.questionnaireTypes as QuestionnaireType[],
        status: resolveInviteStatus(
            invite.status as QuestionnaireInviteStatus,
            invite.expiresAt,
        ),
        expiresAt: invite.expiresAt.toISOString(),
        openedAt: invite.openedAt?.toISOString() ?? null,
        submittedAt: invite.submittedAt?.toISOString() ?? null,
        createdAt: invite.createdAt.toISOString(),
        hasResponse: !!invite.response,
    }));
}
