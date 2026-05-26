import type { EmissionScope, Scope3Category, Country } from "@prisma/client";

export type MatcFactorSource =
    | "EPA"
    | "DEFRA"
    | "Malaysia Grid"
    | "EXIOBASE"
    | "USEEIO"
    | "Ecoinvent";

export interface MatcEmissionFactorSeed {
    category: EmissionScope;
    scope3Category?: Scope3Category;
    activityType: string;
    activityUnit: string;
    factorValue: number;
    source: MatcFactorSource;
    country: Country;
    validFrom: Date;
    matcPriority?: boolean;
}

const VALID_FROM = new Date("2024-01-01");

function scope3(
    scope3Category: Scope3Category,
    activityType: string,
    activityUnit: string,
    factorValue: number,
    source: MatcFactorSource,
    country: Country,
    matcPriority = true,
): MatcEmissionFactorSeed {
    return {
        category: "scope3",
        scope3Category,
        activityType,
        activityUnit,
        factorValue,
        source,
        country,
        validFrom: VALID_FROM,
        matcPriority,
    };
}

export const MATC_HIGH_IMPACT_ACTIVITIES = [
    "stainless_steel",
    "aluminum",
    "chemicals_passivation",
    "surface_treatment_passivation",
    "clean_room_electricity_upstream",
    "road_freight",
    "rail_freight",
    "sea_freight",
    "air_freight",
    "scrap_metal_recycling",
    "scrap_metal_landfill",
    "hazardous_waste",
    "tooling_machinery",
    "precision_tooling",
] as const;

export const MATC_SCOPE3_PRIORITY_CATEGORIES: Scope3Category[] = [
    "cat1_purchased_goods",
    "cat2_capital_goods",
    "cat3_fuel_energy",
    "cat4_upstream_transport",
    "cat5_waste",
    "cat9_downstream_transport",
    "cat10_product_processing",
];

export const MATC_ORG_FACTOR_SOURCES = [
    "EPA",
    "DEFRA",
    "EXIOBASE",
    "USEEIO",
    "Ecoinvent",
] as const satisfies readonly MatcFactorSource[];

export const TRANSPORT_MODE_TO_FACTOR: Record<string, string> = {
    truck: "road_freight",
    van: "road_freight",
    rail: "road_freight",
    ship: "road_freight",
    aircraft: "road_freight",
    pipeline: "road_freight",
};

export const WASTE_TYPE_DISPOSAL_TO_FACTOR: Record<string, string> = {
    "metal:recycling": "scrap_metal_recycling",
    "metal:landfill": "scrap_metal_recycling",
    "metal:incineration": "scrap_metal_recycling",
    "hazardous:incineration": "hazardous_waste",
    "hazardous:landfill": "hazardous_waste",
    "hazardous:recycling": "hazardous_waste",
    "non_hazardous:landfill": "scrap_metal_recycling",
    "electronic:recycling": "scrap_metal_recycling",
};

export const EQUIPMENT_TYPE_TO_FACTOR: Record<string, string> = {
    machinery: "tooling_machinery",
    precision_tooling: "tooling_machinery",
    other: "tooling_machinery",
    vehicle: "tooling_machinery",
    building: "tooling_machinery",
    computer: "tooling_machinery",
    furniture: "tooling_machinery",
};

export const FUEL_ENERGY_TO_FACTOR: Record<string, string> = {
    "electricity:transmission": "clean_room_electricity_upstream",
    "electricity:distribution": "clean_room_electricity_upstream",
    "electricity:production": "clean_room_electricity_upstream",
    "electricity:extraction": "clean_room_electricity_upstream",
};

export function buildMatcEmissionFactors(): MatcEmissionFactorSeed[] {
    const factors: MatcEmissionFactorSeed[] = [];

    for (const country of ["US", "MY"] as Country[]) {
        factors.push(
            {
                category: "scope1",
                activityType: "gasoline",
                activityUnit: "liter",
                factorValue: 2.31,
                source: "EPA",
                country,
                validFrom: VALID_FROM,
            },
            {
                category: "scope1",
                activityType: "diesel",
                activityUnit: "liter",
                factorValue: 2.68,
                source: "EPA",
                country,
                validFrom: VALID_FROM,
            },
            {
                category: "scope1",
                activityType: "natural_gas",
                activityUnit: "m3",
                factorValue: 2.03,
                source: "EPA",
                country,
                validFrom: VALID_FROM,
            },
            {
                category: "scope2",
                activityType: "electricity",
                activityUnit: "kWh",
                factorValue: country === "US" ? 0.385 : 0.58,
                source: country === "US" ? "EPA" : "DEFRA",
                country,
                validFrom: VALID_FROM,
            },
            scope3(
                "cat1_purchased_goods",
                "stainless_steel",
                "kg",
                6.15,
                "Ecoinvent",
                country,
            ),
            scope3(
                "cat1_purchased_goods",
                "aluminum",
                "kg",
                country === "US" ? 8.5 : 8.24,
                country === "US" ? "DEFRA" : "Ecoinvent",
                country,
            ),
            scope3(
                "cat1_purchased_goods",
                "chemicals_passivation",
                "kg",
                3.2,
                "Ecoinvent",
                country,
            ),
            scope3(
                "cat2_capital_goods",
                "tooling_machinery",
                "kg",
                2.85,
                country === "US" ? "USEEIO" : "EXIOBASE",
                country,
            ),
            scope3(
                "cat3_fuel_energy",
                "clean_room_electricity_upstream",
                "kWh",
                0.0496,
                "DEFRA",
                country,
            ),
            scope3(
                "cat4_upstream_transport",
                "road_freight",
                "ton-km",
                0.11191,
                "DEFRA",
                country,
            ),
            scope3(
                "cat5_waste",
                "scrap_metal_recycling",
                "kg",
                0.021,
                "DEFRA",
                country,
            ),
            scope3(
                "cat5_waste",
                "hazardous_waste",
                "kg",
                0.907,
                "DEFRA",
                country,
            ),
            scope3(
                "cat9_downstream_transport",
                "road_freight",
                "ton-km",
                0.11191,
                "DEFRA",
                country,
            ),
        );
    }

    return factors;
}

export const MATC_FACTOR_SOURCES: Array<{
    name: MatcFactorSource;
    abbreviation: string;
    description: string;
    url?: string;
}> = [
    {
        name: "EPA",
        abbreviation: "EPA",
        description: "US EPA Emission Factors Hub",
        url: "https://www.epa.gov/climateleadership/ghg-emission-factors-hub",
    },
    {
        name: "DEFRA",
        abbreviation: "DEFRA",
        description: "UK DEFRA GHG Conversion Factors",
        url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    },
    {
        name: "EXIOBASE",
        abbreviation: "EXIO",
        description: "EXIOBASE multi-regional input-output database",
        url: "https://www.exiobase.eu/",
    },
    {
        name: "USEEIO",
        abbreviation: "USEEIO",
        description: "US EPA USEEIO supply chain emission factors",
        url: "https://www.epa.gov/land-research/us-environmentally-extended-input-output-useeio-models",
    },
    {
        name: "Ecoinvent",
        abbreviation: "ECOINV",
        description: "Ecoinvent life cycle inventory database",
        url: "https://ecoinvent.org/",
    },
];
