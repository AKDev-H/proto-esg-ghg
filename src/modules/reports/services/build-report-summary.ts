import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants";
import {
    buildActionPlanInputFromSummary,
    generateGHGActionPlan,
    type GHGActionPlan,
} from "@/modules/reports/services/generate-ghg-action-plan";

type ActivityRecord = {
    scope: string;
    activityType: string;
    scope3Category: string | null;
    calculatedEmissions: number | null;
};

export interface ReportSummaryPayload {
    totalEmissions: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    activityCount: number;
    scope1Percentage: number;
    scope2Percentage: number;
    scope3Percentage: number;
    scope3Categories: Array<{
        categoryKey: string;
        category: string;
        emissions: number;
        percentage: number;
        activityCount: number;
    }>;
    topActivities: Array<{
        activityType: string;
        emissions: number;
        scope: string;
    }>;
    actionPlan: GHGActionPlan;
}

export function buildReportSummaryFromActivities(
    activities: ActivityRecord[],
    country: "US" | "MY",
    industryType?: string,
): ReportSummaryPayload {
    const totalEmissions = activities.reduce(
        (sum, a) => sum + (a.calculatedEmissions ?? 0),
        0,
    );

    const byScope = { scope1: 0, scope2: 0, scope3: 0 };
    const byCategory: Record<string, number> = {};
    const byActivityType: Record<string, number> = {};

    for (const activity of activities) {
        byScope[activity.scope as keyof typeof byScope] +=
            activity.calculatedEmissions ?? 0;

        const activityKey = `${activity.scope}:${activity.activityType}`;
        byActivityType[activityKey] =
            (byActivityType[activityKey] || 0) +
            (activity.calculatedEmissions ?? 0);

        if (activity.scope === "scope3" && activity.scope3Category) {
            byCategory[activity.scope3Category] =
                (byCategory[activity.scope3Category] || 0) +
                (activity.calculatedEmissions ?? 0);
        }
    }

    const scope3Categories = Object.entries(byCategory)
        .map(([categoryKey, emissions]) => ({
            categoryKey,
            category: SCOPE3_CATEGORY_LABELS[categoryKey] || categoryKey,
            emissions,
            percentage:
                totalEmissions > 0 ? (emissions / totalEmissions) * 100 : 0,
            activityCount: activities.filter(
                (a) =>
                    a.scope === "scope3" && a.scope3Category === categoryKey,
            ).length,
        }))
        .sort((a, b) => b.emissions - a.emissions);

    const topActivities = Object.entries(byActivityType)
        .map(([key, emissions]) => {
            const [scope, activityType] = key.split(":");
            return { activityType, emissions, scope };
        })
        .sort((a, b) => b.emissions - a.emissions)
        .slice(0, 5);

    const actionPlan = generateGHGActionPlan(
        buildActionPlanInputFromSummary({
            totalEmissions,
            scope1Emissions: byScope.scope1,
            scope2Emissions: byScope.scope2,
            scope3Emissions: byScope.scope3,
            scope3Categories: scope3Categories.map((c) => ({
                categoryKey: c.categoryKey,
                emissions: c.emissions,
                activityCount: c.activityCount,
            })),
            topActivities,
            activityCount: activities.length,
            country,
            industryType,
        }),
    );

    return {
        totalEmissions,
        scope1Emissions: byScope.scope1,
        scope2Emissions: byScope.scope2,
        scope3Emissions: byScope.scope3,
        activityCount: activities.length,
        scope1Percentage:
            totalEmissions > 0 ? (byScope.scope1 / totalEmissions) * 100 : 0,
        scope2Percentage:
            totalEmissions > 0 ? (byScope.scope2 / totalEmissions) * 100 : 0,
        scope3Percentage:
            totalEmissions > 0 ? (byScope.scope3 / totalEmissions) * 100 : 0,
        scope3Categories,
        topActivities,
        actionPlan,
    };
}
