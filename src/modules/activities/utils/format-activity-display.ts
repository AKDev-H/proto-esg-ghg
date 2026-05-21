import {
    SCOPE3_CATEGORY_SHORT_LABELS,
    type EmissionScope,
    type Scope3Category,
} from "@/types";
import type { ActivityListItem } from "@/modules/activities/types";

export const SCOPE1_ACTIVITY_LABELS: Record<string, string> = {
    vehicle: "Company Vehicle",
    vehicles: "Company Vehicle",
    stationary: "Stationary Combustion",
    refrigerant: "Refrigerant",
    refrigerants: "Refrigerant",
};

export const SCOPE2_ACTIVITY_LABELS: Record<string, string> = {
    electricity: "Electricity",
};

export function getActivityLabel(
    activity: ActivityListItem,
    activityLabels: Record<string, string> = {},
): string {
    if (activity.scope === "scope3" && activity.scope3Category) {
        return (
            SCOPE3_CATEGORY_SHORT_LABELS[activity.scope3Category] ??
            activity.scope3Category.replace(/_/g, " ")
        );
    }

    return (
        activityLabels[activity.activityType] ??
        activity.activityType.replace(/_/g, " ")
    );
}

export function getActivityDetails(activity: ActivityListItem): string {
    if (activity.scope === "scope1") {
        if (activity.vehicle) {
            return `${activity.vehicle.vehicleType} • ${activity.vehicle.fuelType} • ${activity.vehicle.quantity} ${activity.vehicle.unit}`;
        }
        if (activity.stationary) {
            return `${activity.stationary.equipmentType} • ${activity.stationary.fuelType} • ${activity.stationary.quantity} ${activity.stationary.unit}`;
        }
        if (activity.refrigerant) {
            return `${activity.refrigerant.refrigerantType} • ${activity.refrigerant.quantity} ${activity.refrigerant.unit}`;
        }
    }

    if (activity.scope === "scope2") {
        const region = activity.electricity?.gridRegion || "Default";
        return `${activity.inputValue} ${activity.inputUnit} • ${region}`;
    }

    return `${activity.inputValue} ${activity.inputUnit}`;
}

export function getActivityMobileRows(
    activity: ActivityListItem,
): Array<{ label: string; value: string }> {
    const rows: Array<{ label: string; value: string }> = [];

    if (activity.scope === "scope1") {
        if (activity.vehicle || activity.stationary || activity.refrigerant) {
            rows.push({ label: "Details", value: getActivityDetails(activity) });
        }
        rows.push({
            label: "Quantity",
            value: `${activity.vehicle?.quantity ?? activity.stationary?.quantity ?? activity.refrigerant?.quantity ?? activity.inputValue} ${activity.vehicle?.unit ?? activity.stationary?.unit ?? activity.refrigerant?.unit ?? activity.inputUnit}`,
        });
        return rows;
    }

    if (activity.scope === "scope2") {
        rows.push({
            label: "Grid Region",
            value: activity.electricity?.gridRegion || "Default",
        });
        rows.push({
            label: "Consumption",
            value: `${activity.inputValue} ${activity.inputUnit}`,
        });
        return rows;
    }

    rows.push({
        label: "Input",
        value: `${activity.inputValue} ${activity.inputUnit}`,
    });
    return rows;
}

export function getScopeActivityLabels(
    scope: EmissionScope,
): Record<string, string> {
    if (scope === "scope1") return SCOPE1_ACTIVITY_LABELS;
    if (scope === "scope2") return SCOPE2_ACTIVITY_LABELS;
    return {};
}

export function getScope3CategoryShortLabel(category: Scope3Category): string {
    return SCOPE3_CATEGORY_SHORT_LABELS[category];
}
