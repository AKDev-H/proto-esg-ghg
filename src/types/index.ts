export type UserRole =
    | "super_admin"
    | "org_admin"
    | "sustainability_manager"
    | "data_entry_staff"
    | "viewer";

export const ADMIN_ROLES: UserRole[] = ["super_admin", "org_admin"];

export type EmissionScope = "scope1" | "scope2" | "scope3";
export const EMISSION_SCOPES = ["scope1", "scope2", "scope3"] as const;

export type Scope3Category =
    | "cat1_purchased_goods"
    | "cat2_capital_goods"
    | "cat3_fuel_energy"
    | "cat4_upstream_transport"
    | "cat5_waste"
    | "cat6_business_travel"
    | "cat7_employee_commuting"
    | "cat8_upstream_leased"
    | "cat9_downstream_transport"
    | "cat10_product_processing"
    | "cat11_product_use"
    | "cat12_end_of_life"
    | "cat13_downstream_leased";

export const SCOPE3_CATEGORIES = [
    "cat1_purchased_goods",
    "cat2_capital_goods",
    "cat3_fuel_energy",
    "cat4_upstream_transport",
    "cat5_waste",
    "cat6_business_travel",
    "cat7_employee_commuting",
    "cat8_upstream_leased",
    "cat9_downstream_transport",
    "cat10_product_processing",
    "cat11_product_use",
    "cat12_end_of_life",
    "cat13_downstream_leased",
] as const;

export const SCOPE3_CATEGORY_LABELS: Record<Scope3Category, string> = {
    cat1_purchased_goods: "1. Purchased Goods & Services",
    cat2_capital_goods: "2. Capital Goods",
    cat3_fuel_energy: "3. Fuel & Energy Related Activities",
    cat4_upstream_transport: "4. Upstream Transportation & Distribution",
    cat5_waste: "5. Waste Generated in Operations",
    cat6_business_travel: "6. Business Travel",
    cat7_employee_commuting: "7. Employee Commuting",
    cat8_upstream_leased: "8. Upstream Leased Assets",
    cat9_downstream_transport: "9. Downstream Transportation & Distribution",
    cat10_product_processing: "10. Processing of Sold Products",
    cat11_product_use: "11. Use of Sold Products",
    cat12_end_of_life: "12. End-of-Life Treatment",
    cat13_downstream_leased: "13. Downstream Leased Assets",
};

export const SCOPE3_CATEGORY_SHORT_LABELS: Record<Scope3Category, string> = {
    cat1_purchased_goods: "Purchased Goods",
    cat2_capital_goods: "Capital Goods",
    cat3_fuel_energy: "Fuel & Energy",
    cat4_upstream_transport: "Upstream Transport",
    cat5_waste: "Waste",
    cat6_business_travel: "Business Travel",
    cat7_employee_commuting: "Employee Commuting",
    cat8_upstream_leased: "Upstream Leased",
    cat9_downstream_transport: "Downstream Transport",
    cat10_product_processing: "Product Processing",
    cat11_product_use: "Product Use",
    cat12_end_of_life: "End of Life",
    cat13_downstream_leased: "Downstream Leased",
};

export const SCOPE3_CATEGORY_IMPORTANCE: Record<Scope3Category, "high" | "medium" | "low" | "na"> = {
    cat1_purchased_goods: "high",
    cat2_capital_goods: "medium",
    cat3_fuel_energy: "medium",
    cat4_upstream_transport: "high",
    cat5_waste: "medium",
    cat6_business_travel: "low",
    cat7_employee_commuting: "low",
    cat8_upstream_leased: "low",
    cat9_downstream_transport: "high",
    cat10_product_processing: "low",
    cat11_product_use: "high",
    cat12_end_of_life: "high",
    cat13_downstream_leased: "low",
};

export type Country = "US" | "MY";

export type OrganizationSettings = {
    distanceUnit: "mile" | "km";
    weightUnit: "lb" | "kg";
    fuelUnit: "gallon" | "liter";
    currency: "USD" | "MYR";
    factorSource: string;
};

export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    organizationId: string | null;
}

export interface UserWithOrganization extends SessionUser {
    organization?: {
        id: string;
        name: string;
        slug: string;
        country: Country;
        currency: string;
    } | null;
}

export type Permission = {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canExport: boolean;
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
    super_admin: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canExport: true,
    },
    org_admin: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canExport: true,
    },
    sustainability_manager: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canApprove: false,
        canExport: true,
    },
    data_entry_staff: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canApprove: false,
        canExport: false,
    },
    viewer: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canExport: false,
    },
};

export function hasPermission(
    role: UserRole,
    action: keyof Permission,
): boolean {
    return ROLE_PERMISSIONS[role][action];
}

export function canAccessOrganization(
    role: UserRole,
    organizationId: string,
    userOrganizationId: string | null,
): boolean {
    if (role === "super_admin") return true;
    return userOrganizationId === organizationId;
}

export function canManageUsers(role: UserRole): boolean {
    return role === "super_admin" || role === "org_admin";
}

export function canApproveData(role: UserRole): boolean {
    return role === "super_admin" || role === "org_admin";
}

export function isAdminRole(role: UserRole): boolean {
    return ADMIN_ROLES.includes(role);
}

export type DataStatus = "draft" | "submitted" | "approved" | "rejected";

export type WeightUnit = "kg" | "lb" | "ton" | "unit";
export type DistanceUnit = "km" | "mile" | "m";
export type EnergyUnit = "kWh" | "MWh" | "MJ";
export type TransportMode = "truck" | "rail" | "ship" | "aircraft" | "van";
export type DisposalType = "landfill" | "incineration" | "recycling" | "composting" | "energy_recovery";
export type WasteType = "hazardous" | "non_hazardous" | "electronic" | "plastic" | "metal" | "organic";
export type DisposalMethod = "landfill" | "incineration" | "recycling" | "composting" | "energy_recovery" | "anaerobic_digestion";
export type TravelType = "flight" | "train" | "taxi" | "bus" | "car" | "hotel";
export type CommuteTransportMode = "car" | "bus" | "train" | "motorcycle" | "bicycle" | "walking";
export type LeaseType = "operational" | "financial";
export type ProcessingType = "assembly" | "fabrication" | "refining" | "packaging" | "other";
export type FuelType = "natural_gas" | "diesel" | "gasoline" | "coal" | "biomass" | "electricity";
export type ActivityDescription = "extraction" | "production" | "transmission" | "distribution";
export type EquipmentType = "machinery" | "vehicle" | "building" | "computer" | "furniture" | "other";
export type AssetType = "vehicle" | "equipment" | "building" | "machinery";