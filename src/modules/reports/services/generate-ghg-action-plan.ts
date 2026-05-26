import { SCOPE3_CATEGORY_LABELS } from "@/lib/constants";
import { MATC_SCOPE3_PRIORITY_CATEGORIES } from "@/lib/matc-emission-factors";
import type { Scope3Category } from "@/types";

export interface GHGActionPlanInput {
    totalEmissions: number;
    scope1Percentage: number;
    scope2Percentage: number;
    scope3Percentage: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    scope3Categories: Array<{
        categoryKey: Scope3Category;
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
    activityCount: number;
    country: "US" | "MY";
    industryType?: string;
}

export interface GHGActionPlanPhase {
    title: string;
    timeframe: string;
    protocolFocus: string;
    actions: string[];
}

export interface GHGActionPlan {
    prioritizationSummary: string;
    materialFocusAreas: string[];
    phases: GHGActionPlanPhase[];
    scopeActions: {
        scope1: string[];
        scope2: string[];
        scope3: string[];
    };
    inventoryQualityActions: string[];
    targetSettingGuidance: string;
}

const MANUFACTURING_PRIORITY_CATEGORIES: Scope3Category[] =
    MATC_SCOPE3_PRIORITY_CATEGORIES;

const SCOPE3_CATEGORY_ACTIONS: Record<Scope3Category, string[]> = {
    cat1_purchased_goods: [
        "Track stainless steel and aluminum procurement with supplier-specific factors (DEFRA/Ecoinvent/USEEIO)",
        "Quantify chemical surface treatment and passivation chemicals as purchased goods",
        "Engage tier-1 metal suppliers for primary emission data per Scope 3 Standard",
    ],
    cat2_capital_goods: [
        "Apply embodied carbon criteria to tooling and machinery procurement (USEEIO/EXIOBASE)",
        "Extend precision tooling life and refurbish CNC assets where feasible",
    ],
    cat3_fuel_energy: [
        "Quantify clean room electricity upstream impacts (WTT and T&D per DEFRA)",
        "Address transmission and distribution losses from purchased energy",
    ],
    cat4_upstream_transport: [
        "Optimize inbound logistics: load factor, route planning, and mode shift (road to rail/ship)",
        "Collaborate with logistics providers on tonne-km reduction targets",
    ],
    cat5_waste: [
        "Track scrap metal recycling and hazardous waste handling separately (DEFRA factors)",
        "Apply waste hierarchy: reduce, reuse, recycle before disposal",
    ],
    cat6_business_travel: [
        "Replace high-emission travel with virtual meetings where appropriate",
        "Prefer rail over short-haul flights; consolidate trips",
    ],
    cat7_employee_commuting: [
        "Promote low-carbon commuting (transit, carpooling, active transport)",
        "Measure commuting emissions using distance-based activity data",
    ],
    cat8_upstream_leased: [
        "Improve energy performance of upstream leased assets",
        "Include lease terms that require efficiency upgrades",
    ],
    cat9_downstream_transport: [
        "Optimize outbound distribution and warehouse placement",
        "Shift downstream freight to lower-emission transport modes",
    ],
    cat10_product_processing: [
        "Quantify chemical surface treatment and passivation process emissions",
        "Work with downstream processors on energy and process efficiency",
    ],
    cat11_product_use: [
        "Design products for lower use-phase energy consumption (often largest Scope 3 source for manufacturers)",
        "Provide customer guidance on efficient product operation",
    ],
    cat12_end_of_life: [
        "Design for recyclability and material recovery at end-of-life",
        "Establish take-back or recycling programs for sold products",
    ],
    cat13_downstream_leased: [
        "Improve energy efficiency of products/assets leased to customers",
    ],
};

const SCOPE1_ACTIONS = [
    "Improve combustion efficiency for stationary sources (boilers, furnaces, generators)",
    "Transition fleet to lower-carbon fuels or electrification where operational",
    "Implement refrigerant leak detection and recovery (F-gas management)",
    "Replace or retrofit high-emission equipment with efficient alternatives",
];

const SCOPE2_ACTIONS = [
    "Conduct facility energy audit and implement efficiency measures (lighting, HVAC, motors)",
    "Procure renewable electricity via PPAs, RECs, or onsite generation (market-based method)",
    "Monitor grid emission factors annually and track location-based Scope 2 inventory",
];

function getDominantScope(
    input: GHGActionPlanInput,
): "scope1" | "scope2" | "scope3" {
    const { scope1Percentage, scope2Percentage, scope3Percentage } = input;
    if (
        scope3Percentage >= scope1Percentage &&
        scope3Percentage >= scope2Percentage
    ) {
        return "scope3";
    }
    if (scope1Percentage >= scope2Percentage) return "scope1";
    return "scope2";
}

function getMissingPriorityCategories(
    categories: GHGActionPlanInput["scope3Categories"],
): Scope3Category[] {
    const tracked = new Set(categories.map((c) => c.categoryKey));
    return MANUFACTURING_PRIORITY_CATEGORIES.filter((cat) => !tracked.has(cat));
}

function getTopCategoryActions(
    categories: GHGActionPlanInput["scope3Categories"],
    limit = 2,
): string[] {
    return categories
        .filter((c) => c.emissions > 0)
        .sort((a, b) => b.emissions - a.emissions)
        .slice(0, limit)
        .flatMap((c) => SCOPE3_CATEGORY_ACTIONS[c.categoryKey].slice(0, 1));
}

function buildInventoryQualityActions(input: GHGActionPlanInput): string[] {
    const actions: string[] = [
        "Confirm organizational and operational boundaries per GHG Protocol Corporate Standard",
        "Document emission factor sources (EPA/DEFRA/EXIOBASE/USEEIO/Ecoinvent) and validity periods",
    ];

    if (input.activityCount < 20) {
        actions.unshift(
            "Complete Scope 1 and 2 inventory for all facilities under operational control",
            "Perform Scope 3 screening to identify material categories before setting reduction targets",
        );
    }

    const missing = getMissingPriorityCategories(input.scope3Categories);
    for (const cat of missing.slice(0, 3)) {
        actions.push(
            `Add inventory data for ${SCOPE3_CATEGORY_LABELS[cat]} (manufacturing priority category)`,
        );
    }

    const lowDataCategories = input.scope3Categories.filter(
        (c) => c.activityCount === 0 || c.emissions === 0,
    );
    if (lowDataCategories.length > 0 && input.scope3Percentage > 30) {
        actions.push(
            "Improve Scope 3 data quality: move from default factors to supplier-specific data where material",
        );
    }

    return actions.slice(0, 5);
}

function buildMaterialFocusAreas(input: GHGActionPlanInput): string[] {
    const areas: string[] = [];
    const dominant = getDominantScope(input);

    if (dominant === "scope1" && input.scope1Percentage >= 25) {
        areas.push(
            `Scope 1 direct emissions (${input.scope1Percentage.toFixed(1)}% of total)`,
        );
    }
    if (dominant === "scope2" || input.scope2Percentage >= 20) {
        areas.push(
            `Scope 2 purchased energy (${input.scope2Percentage.toFixed(1)}% of total)`,
        );
    }
    if (input.scope3Percentage >= 30) {
        areas.push(
            `Scope 3 value chain (${input.scope3Percentage.toFixed(1)}% of total)`,
        );
    }

    for (const cat of input.scope3Categories
        .filter((c) => c.percentage >= 5)
        .slice(0, 3)) {
        areas.push(`${cat.category} (${cat.percentage.toFixed(1)}%)`);
    }

    if (input.topActivities[0]) {
        const top = input.topActivities[0];
        areas.push(
            `Top activity: ${top.activityType.replace(/_/g, " ")} (${top.scope})`,
        );
    }

    return areas.slice(0, 5);
}

function buildPrioritizationSummary(input: GHGActionPlanInput): string {
    const dominant = getDominantScope(input);
    const dominantLabel =
        dominant === "scope1"
            ? "Scope 1 (direct emissions)"
            : dominant === "scope2"
              ? "Scope 2 (purchased energy)"
              : "Scope 3 (value chain)";

    const topCat = input.scope3Categories
        .filter((c) => c.emissions > 0)
        .sort((a, b) => b.emissions - a.emissions)[0];

    let summary = `Per GHG Protocol materiality principles, prioritize reductions where ${dominantLabel} represents the largest share of the corporate inventory. `;

    if (topCat && input.scope3Percentage >= 25) {
        summary += `Within Scope 3, focus first on ${topCat.category}, which accounts for ${topCat.percentage.toFixed(1)}% of total emissions. `;
    }

    summary +=
        "Actions below follow the GHG Protocol management cycle: complete inventory, set targets, implement reductions, and track progress against the base year.";

    return summary;
}

function buildScope3Actions(input: GHGActionPlanInput): string[] {
    const actions = getTopCategoryActions(input.scope3Categories, 3);

    if (input.scope3Percentage >= 50) {
        actions.unshift(
            "Establish supplier engagement program for material Scope 3 categories (Scope 3 Standard)",
        );
    }

    const missing = getMissingPriorityCategories(input.scope3Categories);
    if (missing.length > 0) {
        actions.push(
            `Complete Scope 3 screening for untracked priority categories: ${missing
                .slice(0, 2)
                .map((c) => SCOPE3_CATEGORY_LABELS[c].replace(/^\d+\.\s*/, ""))
                .join(", ")}`,
        );
    }

    return [...new Set(actions)].slice(0, 4);
}

export function generateGHGActionPlan(
    input: GHGActionPlanInput,
): GHGActionPlan {
    const dominant = getDominantScope(input);
    const topCategoryActions = getTopCategoryActions(input.scope3Categories, 2);
    const inventoryQualityActions = buildInventoryQualityActions(input);

    const immediateActions: string[] = [...inventoryQualityActions.slice(0, 2)];

    if (dominant === "scope1") {
        immediateActions.push(
            "Audit direct emission sources: fleet fuel, stationary combustion, and refrigerants",
        );
    } else if (dominant === "scope2") {
        immediateActions.push(
            "Review electricity consumption by facility and validate grid emission factors",
        );
    } else {
        immediateActions.push(
            "Identify top Scope 3 categories by contribution and assign category owners",
        );
    }

    immediateActions.push(
        "Establish internal GHG governance: roles, data collection procedures, and annual recalculation policy",
    );

    const shortTermActions: string[] = [
        "Set a GHG reduction target aligned with GHG Protocol target-setting principles (absolute or intensity-based)",
        "Define base year and recalculation policy for structural changes",
    ];

    if (dominant === "scope1" || input.scope1Percentage >= 20) {
        shortTermActions.push(SCOPE1_ACTIONS[0], SCOPE1_ACTIONS[1]);
    }
    if (dominant === "scope2" || input.scope2Percentage >= 15) {
        shortTermActions.push(SCOPE2_ACTIONS[0], SCOPE2_ACTIONS[1]);
    }
    if (input.scope3Percentage >= 25) {
        shortTermActions.push(...topCategoryActions);
    }

    const longTermActions: string[] = [];

    if (input.scope2Emissions > 0) {
        longTermActions.push(
            "Increase share of renewable electricity in the energy mix (market-based Scope 2 reporting)",
        );
    }
    if (input.scope3Percentage >= 30) {
        longTermActions.push(
            "Integrate low-carbon design across product lifecycle (use phase and end-of-life treatment)",
        );
        longTermActions.push(
            "Expand Scope 3 programs to tier-1 suppliers with contractual emission requirements",
        );
    }
    if (input.scope1Emissions > 0) {
        longTermActions.push(
            "Phase out high-GWP refrigerants and complete fleet decarbonization roadmap",
        );
    }
    longTermActions.push(
        "Verify inventory periodically and update emission factors per GHG Protocol guidance",
    );

    const scope1Actions =
        input.scope1Percentage >= 15
            ? SCOPE1_ACTIONS
            : SCOPE1_ACTIONS.slice(0, 2);

    const scope2Actions =
        input.scope2Percentage >= 10
            ? SCOPE2_ACTIONS
            : SCOPE2_ACTIONS.slice(0, 2);

    const scope3Actions = buildScope3Actions(input);

    return {
        prioritizationSummary: buildPrioritizationSummary(input),
        materialFocusAreas: buildMaterialFocusAreas(input),
        phases: [
            {
                title: "Immediate",
                timeframe: "0–3 months",
                protocolFocus: "Inventory completeness & governance",
                actions: [...new Set(immediateActions)].slice(0, 4),
            },
            {
                title: "Short-term",
                timeframe: "3–12 months",
                protocolFocus: "Target setting & operational reductions",
                actions: [...new Set(shortTermActions)].slice(0, 4),
            },
            {
                title: "Long-term",
                timeframe: "1–3 years",
                protocolFocus: "Strategic decarbonization & verification",
                actions: [...new Set(longTermActions)].slice(0, 4),
            },
        ],
        scopeActions: {
            scope1: scope1Actions,
            scope2: scope2Actions,
            scope3: scope3Actions,
        },
        inventoryQualityActions,
        targetSettingGuidance:
            "Set a base-year GHG target covering Scope 1 and 2 at minimum; include material Scope 3 categories per the Scope 3 Standard. Track progress annually and recalculate the base year inventory when structural changes occur.",
    };
}

export function buildActionPlanInputFromSummary(params: {
    totalEmissions: number;
    scope1Emissions: number;
    scope2Emissions: number;
    scope3Emissions: number;
    scope3Categories: Array<{
        categoryKey: string;
        emissions: number;
        activityCount: number;
    }>;
    topActivities: GHGActionPlanInput["topActivities"];
    activityCount: number;
    country: "US" | "MY";
    industryType?: string;
}): GHGActionPlanInput {
    const total = params.totalEmissions || 1;

    return {
        totalEmissions: params.totalEmissions,
        scope1Emissions: params.scope1Emissions,
        scope2Emissions: params.scope2Emissions,
        scope3Emissions: params.scope3Emissions,
        scope1Percentage: (params.scope1Emissions / total) * 100,
        scope2Percentage: (params.scope2Emissions / total) * 100,
        scope3Percentage: (params.scope3Emissions / total) * 100,
        scope3Categories: params.scope3Categories.map((c) => ({
            categoryKey: c.categoryKey as Scope3Category,
            category:
                SCOPE3_CATEGORY_LABELS[c.categoryKey as Scope3Category] ||
                c.categoryKey,
            emissions: c.emissions,
            percentage: (c.emissions / total) * 100,
            activityCount: c.activityCount,
        })),
        topActivities: params.topActivities,
        activityCount: params.activityCount,
        country: params.country,
        industryType: params.industryType,
    };
}
