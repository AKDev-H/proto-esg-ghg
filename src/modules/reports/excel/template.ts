import * as XLSX from "xlsx";

const ORGANIZATION_ROWS = [
    { Field: "Organization Name", Value: "MATC Precision Manufacturing" },
    { Field: "Reporting Year", Value: 2024 },
    { Field: "Country", Value: "US" },
    { Field: "Methodology", Value: "GHG Protocol Corporate Standard + Scope 3 Standard" },
    { Field: "Profile", Value: "MATC Compliance" },
    { Field: "Notes", Value: "Do not rename sheet tabs. Emissions in kgCO2e." },
];

const ACTIVITY_ROWS = [
    {
        scope: "scope1",
        scope3_category: "",
        activity_type: "diesel",
        description: "Fleet diesel consumption",
        input_value: 12500,
        input_unit: "liter",
        emissions_kgco2e: 33500,
        facility: "Main Plant",
        data_source: "EPA",
        ghg_protocol_reference: "Scope 1 - Mobile combustion",
    },
    {
        scope: "scope1",
        scope3_category: "",
        activity_type: "natural_gas",
        description: "Boiler natural gas",
        input_value: 8200,
        input_unit: "m3",
        emissions_kgco2e: 16646,
        facility: "Main Plant",
        data_source: "EPA",
        ghg_protocol_reference: "Scope 1 - Stationary combustion",
    },
    {
        scope: "scope2",
        scope3_category: "",
        activity_type: "electricity",
        description: "Purchased grid electricity",
        input_value: 485000,
        input_unit: "kWh",
        emissions_kgco2e: 186725,
        facility: "Main Plant",
        data_source: "EPA",
        ghg_protocol_reference: "Scope 2 - Location-based",
    },
    {
        scope: "scope3",
        scope3_category: "cat1_purchased_goods",
        activity_type: "stainless_steel",
        description: "Stainless steel sheet procurement",
        input_value: 92000,
        input_unit: "kg",
        emissions_kgco2e: 565800,
        facility: "Main Plant",
        data_source: "Ecoinvent",
        ghg_protocol_reference: "Cat 1 - Purchased goods",
    },
    {
        scope: "scope3",
        scope3_category: "cat1_purchased_goods",
        activity_type: "aluminum",
        description: "Aluminum billet procurement",
        input_value: 38000,
        input_unit: "kg",
        emissions_kgco2e: 323000,
        facility: "Main Plant",
        data_source: "DEFRA",
        ghg_protocol_reference: "Cat 1 - Purchased goods",
    },
    {
        scope: "scope3",
        scope3_category: "cat1_purchased_goods",
        activity_type: "chemicals_passivation",
        description: "Passivation chemicals",
        input_value: 2400,
        input_unit: "kg",
        emissions_kgco2e: 7680,
        facility: "Main Plant",
        data_source: "Ecoinvent",
        ghg_protocol_reference: "Cat 1 - Purchased goods",
    },
    {
        scope: "scope3",
        scope3_category: "cat2_capital_goods",
        activity_type: "tooling_machinery",
        description: "CNC tooling capital purchase",
        input_value: 12000,
        input_unit: "kg",
        emissions_kgco2e: 34200,
        facility: "Main Plant",
        data_source: "USEEIO",
        ghg_protocol_reference: "Cat 2 - Capital goods",
    },
    {
        scope: "scope3",
        scope3_category: "cat3_fuel_energy",
        activity_type: "clean_room_electricity_upstream",
        description: "Upstream electricity T&D losses",
        input_value: 42000,
        input_unit: "kWh",
        emissions_kgco2e: 2083,
        facility: "Clean Room",
        data_source: "DEFRA",
        ghg_protocol_reference: "Cat 3 - Fuel and energy related",
    },
    {
        scope: "scope3",
        scope3_category: "cat4_upstream_transport",
        activity_type: "road_freight",
        description: "Inbound raw material trucking",
        input_value: 185000,
        input_unit: "ton-km",
        emissions_kgco2e: 20703,
        facility: "Logistics",
        data_source: "DEFRA",
        ghg_protocol_reference: "Cat 4 - Upstream transport",
    },
    {
        scope: "scope3",
        scope3_category: "cat5_waste",
        activity_type: "scrap_metal_recycling",
        description: "Scrap metal sent for recycling",
        input_value: 14500,
        input_unit: "kg",
        emissions_kgco2e: 304.5,
        facility: "Main Plant",
        data_source: "DEFRA",
        ghg_protocol_reference: "Cat 5 - Operational waste",
    },
    {
        scope: "scope3",
        scope3_category: "cat5_waste",
        activity_type: "hazardous_waste",
        description: "Hazardous waste treatment",
        input_value: 980,
        input_unit: "kg",
        emissions_kgco2e: 888.86,
        facility: "Main Plant",
        data_source: "DEFRA",
        ghg_protocol_reference: "Cat 5 - Operational waste",
    },
    {
        scope: "scope3",
        scope3_category: "cat9_downstream_transport",
        activity_type: "road_freight",
        description: "Finished goods outbound delivery",
        input_value: 92000,
        input_unit: "ton-km",
        emissions_kgco2e: 10295.72,
        facility: "Logistics",
        data_source: "DEFRA",
        ghg_protocol_reference: "Cat 9 - Downstream transport",
    },
];

const INSTRUCTIONS_ROWS = [
    ["GHG Protocol + MATC Excel Import Template"],
    [""],
    ["1. Fill Organization sheet with reporting metadata."],
    ["2. Enter activity rows in Activities sheet (one row per emission source)."],
    ["3. Use scope values: scope1, scope2, scope3."],
    ["4. For Scope 3, use scope3_category keys like cat1_purchased_goods."],
    ["5. emissions_kgco2e is required for report generation."],
    ["6. Save as .xlsx and upload via Reports > Excel Import tab."],
];

export function buildGhgExcelTemplateBuffer(): Buffer {
    const workbook = XLSX.utils.book_new();

    const instructionsSheet = XLSX.utils.aoa_to_sheet(INSTRUCTIONS_ROWS);
    const organizationSheet = XLSX.utils.json_to_sheet(ORGANIZATION_ROWS);
    const activitiesSheet = XLSX.utils.json_to_sheet(ACTIVITY_ROWS);

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
    XLSX.utils.book_append_sheet(workbook, organizationSheet, "Organization");
    XLSX.utils.book_append_sheet(workbook, activitiesSheet, "Activities");

    return Buffer.from(
        XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as ArrayBuffer,
    );
}

export async function ensureTemplateOnDisk() {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "storage", "templates");
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, "ghg-protocol-matc-template.xlsx");
    await fs.writeFile(filePath, buildGhgExcelTemplateBuffer());
    return filePath;
}
