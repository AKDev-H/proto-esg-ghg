export const COUNTRY_CONFIG = {
    US: {
        name: "United States",
        currency: "USD",
        units: {
            distance: "mile",
            weight: "lb",
            fuel: "gallon",
        },
        factorSources: ["EPA", "DEFRA"],
        defaultFactorSource: "EPA",
    },
    MY: {
        name: "Malaysia",
        currency: "MYR",
        units: {
            distance: "km",
            weight: "kg",
            fuel: "liter",
        },
        factorSources: ["EPA", "DEFRA"],
        defaultFactorSource: "EPA",
    },
} as const;

export const STANDARD_UNITS = {
    weight: "kg",
    distance: "km",
    fuel: "liter",
    energy: "kWh",
    emissions: "kgCO2e",
} as const;

export const CONVERSION_FACTORS = {
    weight: {
        lb: 0.453592,
        kg: 1,
        ton: 1000,
    },
    distance: {
        mile: 1.60934,
        km: 1,
        m: 0.001,
    },
    fuel: {
        gallon: 3.78541,
        liter: 1,
    },
    gasVolume: {
        m3: 1,
        scf: 0.0283168,
    },
    energy: {
        kWh: 1,
        MWh: 1000,
        MJ: 0.277778,
    },
} as const;

export const INDUSTRY_TYPES = [
    { value: "automotive", label: "Automotive" },
    { value: "electronics", label: "Electronics" },
    { value: "food_beverage", label: "Food & Beverage" },
    { value: "chemicals", label: "Chemicals" },
    { value: "textiles", label: "Textiles" },
    { value: "plastics", label: "Plastics" },
    { value: "metals", label: "Metals" },
    { value: "machinery", label: "Machinery" },
    { value: "paper_packaging", label: "Paper & Packaging" },
    { value: "other", label: "Other" },
] as const;

export const SCOPE_LABELS = {
    scope1: "Scope 1",
    scope2: "Scope 2",
    scope3: "Scope 3",
} as const;

export const SCOPE3_CATEGORY_LABELS: Record<string, string> = {
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

export const VEHICLE_TYPES = [
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "pickup", label: "Pickup Truck" },
    { value: "van", label: "Van" },
    { value: "truck_light", label: "Light Truck" },
    { value: "truck_heavy", label: "Heavy Truck" },
    { value: "bus", label: "Bus" },
    { value: "motorcycle", label: "Motorcycle" },
] as const;

export const FUEL_TYPES = [
    { value: "diesel", label: "Diesel" },
    { value: "gasoline", label: "Gasoline" },
    { value: "natural_gas", label: "Natural Gas" },
    { value: "lpg", label: "LPG" },
    { value: "biodiesel", label: "Biodiesel" },
    { value: "electric", label: "Electric" },
    { value: "hydrogen", label: "Hydrogen" },
] as const;

export const EQUIPMENT_TYPES = [
    { value: "boiler", label: "Boiler" },
    { value: "furnace", label: "Furnace" },
    { value: "heater", label: "Heater" },
    { value: "generator", label: "Generator" },
    { value: "compressor", label: "Compressor" },
    { value: "dryer", label: "Dryer" },
] as const;

export const REFRIGERANT_TYPES = [
    { value: "r410a", label: "R-410A" },
    { value: "r22", label: "R-22" },
    { value: "r134a", label: "R-134a" },
    { value: "r404a", label: "R-404A" },
    { value: "r407c", label: "R-407C" },
    { value: "r507a", label: "R-507A" },
] as const;

export const MATERIAL_TYPES = [
    { value: "steel", label: "Steel" },
    { value: "aluminum", label: "Aluminum" },
    { value: "copper", label: "Copper" },
    { value: "plastic", label: "Plastic" },
    { value: "paper", label: "Paper" },
    { value: "glass", label: "Glass" },
    { value: "concrete", label: "Concrete" },
    { value: "chemicals", label: "Chemicals" },
    { value: "textiles", label: "Textiles" },
    { value: "packaging", label: "Packaging Materials" },
    { value: "office_supplies", label: "Office Supplies" },
    { value: "other", label: "Other" },
] as const;

export const TRANSPORT_MODES = [
    { value: "truck", label: "Truck" },
    { value: "rail", label: "Rail" },
    { value: "ship", label: "Ship" },
    { value: "aircraft", label: "Aircraft" },
    { value: "van", label: "Van" },
] as const;

export const DISPOSAL_TYPES = [
    { value: "landfill", label: "Landfill" },
    { value: "incineration", label: "Incineration" },
    { value: "recycling", label: "Recycling" },
    { value: "composting", label: "Composting" },
    { value: "energy_recovery", label: "Energy Recovery" },
] as const;

export const USER_ROLES = [
    { value: "super_admin", label: "Super Admin" },
    { value: "org_admin", label: "Organization Admin" },
    { value: "sustainability_manager", label: "Sustainability Manager" },
    { value: "data_entry_staff", label: "Data Entry Staff" },
    { value: "viewer", label: "Viewer" },
] as const;

export const DATA_STATUS_LABELS = {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    rejected: "Rejected",
} as const;
