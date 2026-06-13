import { resolveCalculatedEmissions } from "@/modules/calculations/services/calculations";
import type { ActivityListItem, EmissionFactorOption } from "@/modules/activities/types";
import type { EmissionScope } from "@/types";

type ActivityRecord = {
    id: string;
    activityType: string;
    inputValue: unknown;
    inputUnit: string;
    calculatedEmissions: unknown;
    dataStatus: string;
    createdAt: Date;
    scope3Category?: string | null;
    scope1Vehicles?: Array<{
        vehicleType: string;
        fuelType: string;
        quantity: unknown;
        unit: string;
    }>;
    scope1Stationary?: Array<{
        equipmentType: string;
        fuelType: string;
        quantity: unknown;
        unit: string;
    }>;
    scope1Refrigerants?: Array<{
        refrigerantType: string;
        quantity: unknown;
        unit: string;
    }>;
    scope2Electricity?: {
        gridRegion: string | null;
    } | null;
    emissionFactor?: {
        factorValue: unknown;
        activityUnit: string;
    } | null;
};

export function mapActivityRecord(
    record: ActivityRecord,
    scope: EmissionScope,
): ActivityListItem {
    const base: ActivityListItem = {
        id: record.id,
        scope,
        activityType: record.activityType,
        inputValue: Number(record.inputValue),
        inputUnit: record.inputUnit,
        calculatedEmissions: resolveCalculatedEmissions(
            Number(record.inputValue),
            record.inputUnit,
            record.calculatedEmissions != null
                ? Number(record.calculatedEmissions)
                : null,
            record.emissionFactor,
        ),
        dataStatus: record.dataStatus as ActivityListItem["dataStatus"],
        createdAt: record.createdAt.toISOString(),
        scope3Category: (record.scope3Category as ActivityListItem["scope3Category"]) ?? null,
    };

    if (scope === "scope1") {
        const vehicle = record.scope1Vehicles?.[0];
        const stationary = record.scope1Stationary?.[0];
        const refrigerant = record.scope1Refrigerants?.[0];

        return {
            ...base,
            vehicle: vehicle
                ? {
                      vehicleType: vehicle.vehicleType,
                      fuelType: vehicle.fuelType,
                      quantity: Number(vehicle.quantity),
                      unit: vehicle.unit,
                  }
                : null,
            stationary: stationary
                ? {
                      equipmentType: stationary.equipmentType,
                      fuelType: stationary.fuelType,
                      quantity: Number(stationary.quantity),
                      unit: stationary.unit,
                  }
                : null,
            refrigerant: refrigerant
                ? {
                      refrigerantType: refrigerant.refrigerantType,
                      quantity: Number(refrigerant.quantity),
                      unit: refrigerant.unit,
                  }
                : null,
        };
    }

    if (scope === "scope2") {
        return {
            ...base,
            electricity: record.scope2Electricity
                ? { gridRegion: record.scope2Electricity.gridRegion }
                : null,
        };
    }

    return base;
}

export function mapEmissionFactor(factor: {
    id: string;
    activityType: string;
    factorValue: unknown;
    activityUnit: string;
    source: string;
    country: string;
    scope3Category?: string | null;
}): EmissionFactorOption {
    return {
        id: factor.id,
        activityType: factor.activityType,
        factorValue: Number(factor.factorValue),
        activityUnit: factor.activityUnit,
        source: factor.source,
        country: factor.country,
        scope3Category: factor.scope3Category,
    };
}
