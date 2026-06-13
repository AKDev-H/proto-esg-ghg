import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFactors } from "@/lib/permissions";
import { FactorsTableClient } from "@/components/emission-factors/FactorsTable.client";
import type { EmissionFactor } from "@/modules/emission-factors/types";
import { EmissionScope, Country, Scope3Category, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{
        page?: string;
        category?: string;
        source?: string;
        country?: string;
        scope3Category?: string;
        unit?: string;
    }>;
}

export default async function FactorsPage({ searchParams }: Props) {
    const session = await auth();
    const organizationId = session?.user?.organizationId;
    const isSuperAdmin = session?.user?.role === "super_admin";
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EmissionFactorWhereInput = organizationId && !isSuperAdmin
        ? { OR: [{ organizationId }, { organizationId: null }] }
        : {};

    if (params.category && params.category !== "all") {
        where.category = params.category as EmissionScope;
    }
    if (params.source && params.source !== "all") {
        where.source = params.source;
    }
    if (params.country && params.country !== "all") {
        where.country = params.country as Country;
    }
    if (params.scope3Category && params.scope3Category !== "all") {
        where.scope3Category = params.scope3Category as Scope3Category;
    }
    if (params.unit && params.unit !== "all") {
        where.activityUnit = params.unit;
    }

    const [factors, total, distinctSources, distinctUnits] = await Promise.all([
        prisma.emissionFactor.findMany({
            where,
            orderBy: [{ category: "asc" }, { activityType: "asc" }],
            skip,
            take: limit,
        }),
        prisma.emissionFactor.count({ where }),
        prisma.emissionFactor.findMany({
            where: organizationId && !isSuperAdmin
                ? { OR: [{ organizationId }, { organizationId: null }] }
                : {},
            select: { source: true },
            distinct: ['source'],
            orderBy: { source: 'asc' },
        }),
        prisma.emissionFactor.findMany({
            where: organizationId && !isSuperAdmin
                ? { OR: [{ organizationId }, { organizationId: null }] }
                : {},
            select: { activityUnit: true },
            distinct: ['activityUnit'],
            orderBy: { activityUnit: 'asc' },
        }),
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

    const canEditFactors = canManageFactors(session?.user?.role);

    const sourcesList = distinctSources.map((s) => s.source).filter(Boolean);
    const unitsList = distinctUnits.map((u) => u.activityUnit).filter(Boolean);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Emission Factors</h1>
            <FactorsTableClient
                key={`${page}-${params.category ?? "all"}-${params.source ?? "all"}-${params.country ?? "all"}-${params.scope3Category ?? "all"}-${params.unit ?? "all"}`}
                factors={formattedFactors}
                pagination={pagination}
                canManageFactors={canEditFactors}
                sources={sourcesList}
                units={unitsList}
            />
        </div>
    );
}