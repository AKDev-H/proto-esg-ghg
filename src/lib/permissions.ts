import type { UserRole } from "@/types";

export type Feature =
    | "manageUsers"
    | "manageOrgSettings"
    | "manageFactors"
    | "createActivities"
    | "submitActivities"
    | "approveActivities"
    | "generateReports"
    | "deleteReports";

const ROLE_FEATURES: Record<UserRole, Feature[]> = {
    super_admin: [
        "manageUsers",
        "manageOrgSettings",
        "manageFactors",
        "createActivities",
        "submitActivities",
        "approveActivities",
        "generateReports",
        "deleteReports",
    ],
    org_admin: [
        "manageUsers",
        "manageOrgSettings",
        "manageFactors",
        "createActivities",
        "submitActivities",
        "approveActivities",
        "generateReports",
        "deleteReports",
    ],
    sustainability_manager: [
        "manageFactors",
        "createActivities",
        "submitActivities",
        "generateReports",
    ],
    data_entry_staff: [
        "createActivities",
        "submitActivities",
        "generateReports",
    ],
    viewer: [],
};

export function can(
    role: UserRole | string | null | undefined,
    feature: Feature,
): boolean {
    if (!role) return false;
    return ROLE_FEATURES[role as UserRole]?.includes(feature) ?? false;
}

export function canManageUsers(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "manageUsers");
}

export function canManageOrgSettings(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "manageOrgSettings");
}

export function canManageFactors(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "manageFactors");
}

export function canCreateActivities(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "createActivities");
}

export function canSubmitActivities(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "submitActivities");
}

export function canApproveActivities(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "approveActivities");
}

export function canGenerateReports(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "generateReports");
}

export function canDeleteReports(
    role: UserRole | string | null | undefined,
): boolean {
    return can(role, "deleteReports");
}
