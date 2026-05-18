import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FactorsTableClient } from "@/components/emission-factors/FactorsTable.client";
import type { EmissionFactor } from "@/modules/emission-factors/types";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function FactorsPage({ searchParams }: Props) {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = organizationId
        ? { OR: [{ organizationId }, { organizationId: null }] }
        : {};

    if (params.category && params.category !== "all") {
        Object.assign(where, { category: params.category });
    }

    const [factors, total] = await Promise.all([
        prisma.emissionFactor.findMany({
            where,
            orderBy: [{ category: "asc" }, { activityType: "asc" }],
            skip,
            take: limit,
        }),
        prisma.emissionFactor.count({ where }),
    ]);

    const formattedFactors: EmissionFactor[] = factors.map((f) => ({
        id: f.id,
        category: f.category as EmissionFactor["category"],
        scope3Category: f.scope3Category ?? undefined,
        activityType: f.activityType,
        activityUnit: f.activityUnit,
        factorValue: Number(f.factorValue),
        source: f.source,
        country: f.country as "US" | "MY",
        validFrom: f.validFrom.toISOString(),
        validTo: f.validTo?.toISOString() ?? null,
        isCustom: f.isCustom,
        organizationId: f.organizationId,
    }));

    const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Emission Factors</h1>
            <FactorsTableClient initialFactors={formattedFactors} initialPagination={pagination} />
        </div>
    );
}