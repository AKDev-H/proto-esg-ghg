import { CONVERSION_FACTORS, STANDARD_UNITS } from "@/lib/constants";

type WeightUnit = keyof typeof CONVERSION_FACTORS.weight;
type DistanceUnit = keyof typeof CONVERSION_FACTORS.distance;
type FuelUnit = keyof typeof CONVERSION_FACTORS.fuel;
type EnergyUnit = keyof typeof CONVERSION_FACTORS.energy;

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

export interface CalculationResult {
    inputValue: number;
    inputUnit: string;
    convertedValue: number;
    convertedUnit: string;
    emissionFactor: number;
    calculatedEmissions: number;
}

export function calculateEmissions(
    activityValue: number,
    activityUnit: string,
    emissionFactor: number,
    scope: "scope1" | "scope2" | "scope3",
): CalculationResult {
    let convertedValue = activityValue;
    let convertedUnit = activityUnit;

    if (scope === "scope1" || scope === "scope2") {
        if (activityUnit === "gallon" || activityUnit === "liter") {
            convertedValue = convertFuel(
                activityValue,
                activityUnit as FuelUnit,
            );
            convertedUnit = STANDARD_UNITS.fuel;
        } else if (
            activityUnit === "kWh" ||
            activityUnit === "MWh" ||
            activityUnit === "MJ"
        ) {
            convertedValue = convertEnergy(
                activityValue,
                activityUnit as EnergyUnit,
            );
            convertedUnit = STANDARD_UNITS.energy;
        } else if (
            activityUnit === "lb" ||
            activityUnit === "kg" ||
            activityUnit === "ton"
        ) {
            convertedValue = convertWeight(
                activityValue,
                activityUnit as WeightUnit,
            );
            convertedUnit = STANDARD_UNITS.weight;
        }
    } else if (scope === "scope3") {
        if (
            activityUnit === "kg" ||
            activityUnit === "lb" ||
            activityUnit === "ton"
        ) {
            convertedValue = convertWeight(
                activityValue,
                activityUnit as WeightUnit,
            );
            convertedUnit = STANDARD_UNITS.weight;
        } else if (
            activityUnit === "km" ||
            activityUnit === "mile" ||
            activityUnit === "m"
        ) {
            convertedValue = convertDistance(
                activityValue,
                activityUnit as DistanceUnit,
            );
            convertedUnit = STANDARD_UNITS.distance;
        } else if (
            activityUnit === "kWh" ||
            activityUnit === "MWh" ||
            activityUnit === "MJ"
        ) {
            convertedValue = convertEnergy(
                activityValue,
                activityUnit as EnergyUnit,
            );
            convertedUnit = STANDARD_UNITS.energy;
        }
    }

    const calculatedEmissions = convertedValue * emissionFactor;

    return {
        inputValue: activityValue,
        inputUnit: activityUnit,
        convertedValue: Math.round(convertedValue * 1000) / 1000,
        convertedUnit,
        emissionFactor,
        calculatedEmissions: Math.round(calculatedEmissions * 1000) / 1000,
    };
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
    return Math.round((kgCO2 / 1000) * 100) / 100;
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
