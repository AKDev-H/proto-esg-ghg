import { prisma } from "@/lib/prisma";
import { buildPagination } from "@/types/pagination";
import type { EmissionScope } from "@/types";
import {
    mapActivityRecord,
    mapEmissionFactor,
} from "@/modules/activities/services/map-activity-record";
import type {
    ActivityListItem,
    EmissionFactorOption,
} from "@/modules/activities/types";
import type { PaginationInfo } from "@/types/pagination";

const PAGE_SIZE = 10;

const SCOPE3_INCLUDES = {
    scope3PurchasedGoods: true,
    scope3CapitalGoods: true,
    scope3FuelEnergy: true,
    scope3Transportation: true,
    scope3Waste: true,
    scope3BusinessTravel: true,
    scope3EmployeeCommuting: true,
    scope3UpstreamLeased: true,
    scope3ProductProcessing: true,
    scope3ProductUse: true,
    scope3EndOfLife: true,
    scope3DownstreamLeased: true,
} as const;

const SCOPE_INCLUDES: Record<
    EmissionScope,
    Record<string, boolean> | undefined
> = {
    scope1: {
        scope1Vehicles: true,
        scope1Stationary: true,
        scope1Refrigerants: true,
    },
    scope2: { scope2Electricity: true },
    scope3: SCOPE3_INCLUDES,
};

function orgFilter(organizationId: string | null | undefined, isSuperAdmin: boolean) {
    if (organizationId && !isSuperAdmin) {
        return { organizationId };
    }
    return {};
}

function factorOrgFilter(organizationId: string | null | undefined, isSuperAdmin: boolean) {
    if (organizationId && !isSuperAdmin) {
        return { OR: [{ organizationId }, { organizationId: null }] };
    }
    return {};
}

export interface ScopeActivitiesPageData {
    activities: ActivityListItem[];
    factors: EmissionFactorOption[];
    pagination: PaginationInfo;
    isSuperAdmin: boolean;
}

export async function fetchScopeActivitiesPageData(
    scope: EmissionScope,
    organizationId: string | null | undefined,
    isSuperAdmin: boolean,
    page: number,
): Promise<ScopeActivitiesPageData> {
    const skip = (page - 1) * PAGE_SIZE;

    const [factors, activities, totalCount] = await Promise.all([
        prisma.emissionFactor.findMany({
            where: {
                category: scope,
                ...factorOrgFilter(organizationId, isSuperAdmin),
            },
            orderBy: { activityType: "asc" },
        }),
        prisma.activityData.findMany({
            where: {
                scope,
                ...orgFilter(organizationId, isSuperAdmin),
            },
            include: {
                ...SCOPE_INCLUDES[scope],
                emissionFactor: true,
            },
            orderBy: { createdAt: "desc" },
            take: PAGE_SIZE,
            skip,
        }),
        prisma.activityData.count({
            where: {
                scope,
                ...orgFilter(organizationId, isSuperAdmin),
            },
        }),
    ]);

    return {
        activities: activities.map((a) => mapActivityRecord(a, scope)),
        factors: factors.map(mapEmissionFactor),
        pagination: buildPagination(page, totalCount, PAGE_SIZE),
        isSuperAdmin,
    };
}
