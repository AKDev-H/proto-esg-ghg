import { CONVERSION_FACTORS, STANDARD_UNITS } from "@/lib/constants";
import {
    EQUIPMENT_TYPE_TO_FACTOR,
    FUEL_ENERGY_TO_FACTOR,
    TRANSPORT_MODE_TO_FACTOR,
    WASTE_TYPE_DISPOSAL_TO_FACTOR,
} from "@/lib/matc-emission-factors";

type WeightUnit = keyof typeof CONVERSION_FACTORS.weight;
type DistanceUnit = keyof typeof CONVERSION_FACTORS.distance;
type FuelUnit = keyof typeof CONVERSION_FACTORS.fuel;
type EnergyUnit = keyof typeof CONVERSION_FACTORS.energy;
type GasVolumeUnit = keyof typeof CONVERSION_FACTORS.gasVolume;

const WEIGHT_UNITS = new Set<string>(Object.keys(CONVERSION_FACTORS.weight));
const FUEL_UNITS = new Set<string>(Object.keys(CONVERSION_FACTORS.fuel));
const ENERGY_UNITS = new Set<string>(Object.keys(CONVERSION_FACTORS.energy));
const DISTANCE_UNITS = new Set<string>(Object.keys(CONVERSION_FACTORS.distance));
const GAS_VOLUME_UNITS = new Set<string>(Object.keys(CONVERSION_FACTORS.gasVolume));

const UNIT_ALIASES: Record<string, string> = {
    tonne: "ton",
    tonnes: "ton",
    t: "ton",
    l: "liter",
    litre: "liter",
    litres: "liter",
    gal: "gallon",
    gallons: "gallon",
    kwh: "kWh",
    mwh: "MWh",
    "tonne-km": "ton-km",
    "tonnes-km": "ton-km",
    tkm: "ton-km",
    "passenger-km": "km",
    pkm: "km",
    nights: "night",
    sqft: "sqm",
};

export interface CalculationResult {
    inputValue: number;
    inputUnit: string;
    convertedValue: number;
    convertedUnit: string;
    emissionFactor: number;
    calculatedEmissions: number;
}

export function normalizeUnit(unit: string): string {
    const trimmed = unit.trim();
    if (!trimmed) return trimmed;

    const alias = UNIT_ALIASES[trimmed.toLowerCase()];
    if (alias) return alias;

    if (trimmed.toLowerCase() === "kwh") return "kWh";
    if (trimmed.toLowerCase() === "mwh") return "MWh";

    return trimmed;
}

export function convertWeight(value: number, from: WeightUnit): number {
    return value * CONVERSION_FACTORS.weight[from];
}

export function convertDistance(value: number, from: DistanceUnit): number {
    return value * CONVERSION_FACTORS.distance[from];
}

export function convertFuel(value: number, from: FuelUnit): number {
    return value * CONVERSION_FACTORS.fuel[from];
}

export function convertEnergy(value: number, from: EnergyUnit): number {
    return value * CONVERSION_FACTORS.energy[from];
}

export function convertGasVolume(value: number, from: GasVolumeUnit): number {
    return value * CONVERSION_FACTORS.gasVolume[from];
}

export function convertActivityToFactorUnit(
    activityValue: number,
    activityUnit: string,
    factorUnit: string,
): { convertedValue: number; convertedUnit: string } {
    const from = normalizeUnit(activityUnit);
    const to = normalizeUnit(factorUnit);

    if (from === to) {
        return { convertedValue: activityValue, convertedUnit: to };
    }

    if (WEIGHT_UNITS.has(from) && WEIGHT_UNITS.has(to)) {
        const inKg = convertWeight(activityValue, from as WeightUnit);
        const convertedValue =
            to === "kg"
                ? inKg
                : inKg / CONVERSION_FACTORS.weight[to as WeightUnit];
        return { convertedValue, convertedUnit: to };
    }

    if (FUEL_UNITS.has(from) && FUEL_UNITS.has(to)) {
        const inLiters = convertFuel(activityValue, from as FuelUnit);
        const convertedValue =
            to === "liter"
                ? inLiters
                : inLiters / CONVERSION_FACTORS.fuel[to as FuelUnit];
        return { convertedValue, convertedUnit: to };
    }

    if (GAS_VOLUME_UNITS.has(from) && GAS_VOLUME_UNITS.has(to)) {
        const inM3 = convertGasVolume(activityValue, from as GasVolumeUnit);
        const convertedValue =
            to === "m3"
                ? inM3
                : inM3 / CONVERSION_FACTORS.gasVolume[to as GasVolumeUnit];
        return { convertedValue, convertedUnit: to };
    }

    if (ENERGY_UNITS.has(from) && ENERGY_UNITS.has(to)) {
        const inKwh = convertEnergy(activityValue, from as EnergyUnit);
        const convertedValue =
            to === "kWh"
                ? inKwh
                : inKwh / CONVERSION_FACTORS.energy[to as EnergyUnit];
        return { convertedValue, convertedUnit: to };
    }

    if (DISTANCE_UNITS.has(from) && DISTANCE_UNITS.has(to)) {
        const inKm = convertDistance(activityValue, from as DistanceUnit);
        const convertedValue =
            to === "km"
                ? inKm
                : inKm / CONVERSION_FACTORS.distance[to as DistanceUnit];
        return { convertedValue, convertedUnit: to };
    }

    throw new Error(
        `Cannot convert activity unit "${activityUnit}" to emission factor unit "${factorUnit}"`,
    );
}

export function resolveCalculatedEmissions(
    inputValue: number,
    inputUnit: string,
    calculatedEmissions: number | null | undefined,
    factor?: { factorValue: unknown; activityUnit: string } | null,
): number | null {
    if (calculatedEmissions != null) {
        return Number(calculatedEmissions);
    }

    if (!factor) {
        return null;
    }

    try {
        return calculateEmissions(
            Number(inputValue),
            String(inputUnit),
            Number(factor.factorValue),
            String(factor.activityUnit),
        ).calculatedEmissions;
    } catch {
        return null;
    }
}

export function calculateEmissions(
    activityValue: number,
    activityUnit: string,
    emissionFactor: number,
    emissionFactorUnit: string,
): CalculationResult {
    const { convertedValue, convertedUnit } = convertActivityToFactorUnit(
        activityValue,
        activityUnit,
        emissionFactorUnit,
    );

    const calculatedEmissions = convertedValue * emissionFactor;

    return {
        inputValue: activityValue,
        inputUnit: activityUnit,
        convertedValue: roundToPrecision(convertedValue, 3),
        convertedUnit,
        emissionFactor,
        calculatedEmissions: roundToPrecision(calculatedEmissions, 3),
    };
}

export function resolveScope3FactorActivityType(
    scope3Category: string,
    activityType: string,
    details?: Record<string, unknown>,
): string {
    const nested = extractScope3DetailFields(details);
    if (!nested) return activityType;

    switch (scope3Category) {
        case "cat1_purchased_goods": {
            const materialType = String(nested.materialType || activityType);
            if (materialType === "surface_treatment_passivation") {
                return "chemicals_passivation";
            }
            return materialType;
        }
        case "cat2_capital_goods": {
            const equipmentType = String(nested.equipmentType || "");
            return EQUIPMENT_TYPE_TO_FACTOR[equipmentType] || "tooling_machinery";
        }
        case "cat3_fuel_energy": {
            const fuelType = String(nested.fuelType || "");
            const activityDescription = String(nested.activityDescription || "");
            if (fuelType === "electricity") {
                return (
                    FUEL_ENERGY_TO_FACTOR[`${fuelType}:${activityDescription}`] ||
                    "clean_room_electricity_upstream"
                );
            }
            return activityType;
        }
        case "cat4_upstream_transport":
        case "cat9_downstream_transport": {
            const mode = String(nested.transportMode || nested.mode || "");
            return TRANSPORT_MODE_TO_FACTOR[mode] || activityType;
        }
        case "cat5_waste": {
            const wasteType = String(nested.wasteType || "");
            const disposalMethod = String(nested.disposalMethod || "");
            return (
                WASTE_TYPE_DISPOSAL_TO_FACTOR[`${wasteType}:${disposalMethod}`] ||
                activityType
            );
        }
        case "cat10_product_processing": {
            const processingType = String(nested.processingType || "");
            if (processingType === "refining" || processingType === "fabrication") {
                return "surface_treatment_passivation";
            }
            return activityType;
        }
        default:
            return activityType;
    }
}

function extractScope3DetailFields(
    details?: Record<string, unknown>,
): Record<string, unknown> | null {
    if (!details) return null;

    for (const value of Object.values(details)) {
        if (value && typeof value === "object" && "create" in (value as object)) {
            return (value as { create: Record<string, unknown> }).create;
        }
        if (value && typeof value === "object") {
            return value as Record<string, unknown>;
        }
    }

    return null;
}

export function deriveScope3ActivityQuantity(
    scope3Category: string,
    data: Record<string, number | string | undefined>,
): { activityValue: number; activityUnit: string } | null {
    switch (scope3Category) {
        case "cat4_upstream_transport":
        case "cat9_downstream_transport": {
            const weight = Number(data.weight);
            const distance = Number(data.distance);
            if (!weight || !distance) return null;
            return { activityValue: weight * distance, activityUnit: "ton-km" };
        }
        case "cat6_business_travel": {
            if (data.travelType === "hotel") {
                const nights = Number(data.numberOfTrips);
                if (!nights) return null;
                return { activityValue: nights, activityUnit: "night" };
            }
            const distance = Number(data.distance);
            const trips = Number(data.numberOfTrips);
            if (!distance || !trips) return null;
            return { activityValue: distance * trips, activityUnit: "km" };
        }
        case "cat7_employee_commuting": {
            const distance = Number(data.averageDistancePerDay);
            const days = Number(data.daysPerYear);
            const employees = Number(data.numberOfEmployees);
            if (!distance || !days || !employees) return null;
            return {
                activityValue: distance * days * employees,
                activityUnit: "passenger-km",
            };
        }
        case "cat11_product_use": {
            const annualEnergy = Number(data.annualEnergyKwh);
            const lifetime = Number(data.lifetimeYears);
            const units = Number(data.unitsSold);
            if (!annualEnergy || !lifetime || !units) return null;
            return {
                activityValue: annualEnergy * lifetime * units,
                activityUnit: "kWh",
            };
        }
        default:
            return null;
    }
}

export function calculateTotalEmissions(
    activities: { calculatedEmissions: number | null }[],
): number {
    return activities.reduce(
        (sum, activity) => sum + (activity.calculatedEmissions ?? 0),
        0,
    );
}

export function aggregateByScope(
    activities: Array<{ scope: string; calculatedEmissions: number | null }>,
) {
    return activities.reduce(
        (acc, activity) => {
            const scope = activity.scope;
            acc[scope] =
                (acc[scope] || 0) + (activity.calculatedEmissions ?? 0);
            return acc;
        },
        {} as Record<string, number>,
    );
}

export function aggregateByCategory(
    activities: Array<{
        scope3Category: string | null;
        calculatedEmissions: number | null;
    }>,
) {
    return activities.reduce(
        (acc, activity) => {
            const category = activity.scope3Category || "unknown";
            acc[category] =
                (acc[category] || 0) + (activity.calculatedEmissions ?? 0);
            return acc;
        },
        {} as Record<string, number>,
    );
}

export function convertToTonCO2(kgCO2: number): number {
    return roundToPrecision(kgCO2 / 1000, 2);
}

export function formatEmissionsSummary(emissions: number): {
    totalKgCO2e: number;
    totalTonCO2e: number;
    formatted: string;
} {
    const totalTonCO2e = convertToTonCO2(emissions);
    return {
        totalKgCO2e: Math.round(emissions),
        totalTonCO2e,
        formatted: `${totalTonCO2e.toLocaleString()} tCO2e`,
    };
}

function roundToPrecision(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

export { STANDARD_UNITS };
