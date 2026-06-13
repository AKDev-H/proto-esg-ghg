import type { EmissionScope, Scope3Category, DataStatus } from "@/types";

export interface EmissionFactorOption {
    id: string;
    activityType: string;
    factorValue: number;
    activityUnit: string;
    source: string;
    country: string;
    scope3Category?: string | null;
}

export interface ActivityListItem {
    id: string;
    scope: EmissionScope;
    activityType: string;
    inputValue: number;
    inputUnit: string;
    calculatedEmissions: number | null;
    dataStatus: DataStatus;
    createdAt: string;
    scope3Category?: Scope3Category | null;
    vehicle?: {
        vehicleType: string;
        fuelType: string;
        quantity: number;
        unit: string;
    } | null;
    stationary?: {
        equipmentType: string;
        fuelType: string;
        quantity: number;
        unit: string;
    } | null;
    refrigerant?: {
        refrigerantType: string;
        quantity: number;
        unit: string;
    } | null;
    electricity?: { gridRegion: string | null } | null;
}

export type { ActivityFilterInput, CreateActivityInput } from "./schemas";
