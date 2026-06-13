import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type {
    EmissionScope,
    Scope3Category,
    Country,
    TransportMode,
    DisposalType,
    SupplierCategory,
} from "@prisma/client";

const prisma = new PrismaClient();

// ─── Factor definitions ───────────────────────────────────────────────

const VALID_FROM = new Date("2024-01-01");
const VALID_TO = new Date("2025-12-31");

type FactorDef = {
    category: EmissionScope;
    scope3Category?: Scope3Category;
    activityType: string;
    activityUnit: string;
    factorValue: number;
    source: string;
    country: Country;
};

const SCOPE1_FACTORS: FactorDef[] = [];
const SCOPE2_FACTORS: FactorDef[] = [];
const SCOPE3_FACTORS: FactorDef[] = [];

for (const country of ["US", "MY"] as Country[]) {
    SCOPE1_FACTORS.push(
        { category: "scope1", activityType: "gasoline", activityUnit: "liter", factorValue: 2.31, source: "EPA", country },
        { category: "scope1", activityType: "diesel", activityUnit: "liter", factorValue: 2.68, source: "EPA", country },
        { category: "scope1", activityType: "natural_gas", activityUnit: "m3", factorValue: 2.03, source: "EPA", country },
        { category: "scope1", activityType: "lpg", activityUnit: "liter", factorValue: 1.56, source: "DEFRA", country },
        { category: "scope1", activityType: "r410a", activityUnit: "kg", factorValue: 2088, source: "EPA", country },
        { category: "scope1", activityType: "r22", activityUnit: "kg", factorValue: 1810, source: "EPA", country },
        { category: "scope1", activityType: "r134a", activityUnit: "kg", factorValue: 1430, source: "EPA", country },
    );

    const s2Factor = country === "US" ? 0.385 : 0.58;
    const s2Source = country === "US" ? "EPA" : "Malaysia Grid";
    SCOPE2_FACTORS.push(
        { category: "scope2", activityType: "electricity", activityUnit: "kWh", factorValue: s2Factor, source: s2Source, country },
    );

    SCOPE3_FACTORS.push(
        { category: "scope3", scope3Category: "cat1_purchased_goods", activityType: "steel", activityUnit: "kg", factorValue: 2.15, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat1_purchased_goods", activityType: "plastic", activityUnit: "kg", factorValue: 2.53, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat1_purchased_goods", activityType: "chemicals", activityUnit: "kg", factorValue: 3.2, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat2_capital_goods", activityType: "machinery", activityUnit: "kg", factorValue: 2.85, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat3_fuel_energy", activityType: "fuel_extraction", activityUnit: "kWh", factorValue: 0.0496, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat4_upstream_transport", activityType: "road_freight", activityUnit: "ton-km", factorValue: 0.11191, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat5_waste", activityType: "landfill", activityUnit: "kg", factorValue: 0.589, source: "EPA", country },
        { category: "scope3", scope3Category: "cat5_waste", activityType: "recycling", activityUnit: "kg", factorValue: 0.021, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat6_business_travel", activityType: "flight_long_haul", activityUnit: "km", factorValue: 0.113, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat7_employee_commuting", activityType: "car", activityUnit: "passenger-km", factorValue: 0.170, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat8_upstream_leased", activityType: "office_space", activityUnit: "sqm", factorValue: 0.089, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat9_downstream_transport", activityType: "road_freight", activityUnit: "ton-km", factorValue: 0.11191, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat10_product_processing", activityType: "processing_steel", activityUnit: "kg", factorValue: 0.45, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat11_product_use", activityType: "product_electricity", activityUnit: "kWh", factorValue: 0.385, source: "EPA", country },
        { category: "scope3", scope3Category: "cat12_end_of_life", activityType: "recycling", activityUnit: "kg", factorValue: 0.021, source: "DEFRA", country },
        { category: "scope3", scope3Category: "cat13_downstream_leased", activityType: "equipment_leased", activityUnit: "kg", factorValue: 1.25, source: "DEFRA", country },
    );
}

// ─── Dynamic year computation ──────────────────────────────────────────
// Dashboard uses new Date().getFullYear() for year selector and trend queries,
// so we must seed data for [currentYear-2, currentYear-1, currentYear].

const CURRENT_YEAR = new Date().getFullYear();
const BASE_YEAR = CURRENT_YEAR - 2;
const PREV_YEAR = CURRENT_YEAR - 1;
const YEARS = [BASE_YEAR, PREV_YEAR, CURRENT_YEAR] as const;

// ─── Activity definitions per year ────────────────────────────────────

type DetailBuilder = (activityDataId: string) => Record<string, unknown>;

type ActivityDef = {
    scope: EmissionScope;
    scope3Cat: Scope3Category | null;
    activityType: string;
    inputValue: number;
    inputUnit: string;
    detail: DetailBuilder;
    qualifier?: string;
};

// Scope 1 helpers
function vehicle(vt: string, ft: string, qty: number, unit: string): DetailBuilder {
    return () => ({ scope1Vehicles: { create: { vehicleType: vt, fuelType: ft, quantity: qty, unit } } });
}
function stationary(et: string, ft: string, qty: number, unit: string): DetailBuilder {
    return () => ({ scope1Stationary: { create: { equipmentType: et, fuelType: ft, quantity: qty, unit } } });
}
function refrigerant(rt: string, qty: number, unit = "kg"): DetailBuilder {
    return () => ({ scope1Refrigerants: { create: { refrigerantType: rt, quantity: qty, unit } } });
}

// Scope 2 helper
function electricity(consumption: number, unit: string, gridRegion: string): DetailBuilder {
    return () => ({ scope2Electricity: { create: { consumption, unit, gridRegion } } });
}

// Scope 3 helpers
function purchasedGoods(mat: string, qty: number, unit: string, supplierCountry: string): DetailBuilder {
    return () => ({ scope3PurchasedGoods: { create: { materialType: mat, quantity: qty, unit, supplierCountry } } });
}
function capitalGoods(equip: string, qty: number, unit: string, year: number): DetailBuilder {
    return () => ({ scope3CapitalGoods: { create: { equipmentType: equip, quantity: qty, unit, purchaseYear: year } } });
}
function fuelEnergy(ft: string, qty: number, unit: string, desc: string): DetailBuilder {
    return () => ({ scope3FuelEnergy: { create: { fuelType: ft, quantity: qty, unit, activityDescription: desc } } });
}
function transport(mode: TransportMode, weight: number, distance: number, distUnit: string, cat: string): DetailBuilder {
    return () => ({ scope3Transportation: { create: { transportMode: mode, weight, distance, distanceUnit: distUnit, transportCategory: cat } } });
}
function waste(wt: string, method: string, qty: number, unit: string): DetailBuilder {
    return () => ({ scope3Waste: { create: { wasteType: wt, disposalMethod: method, quantity: qty, unit } } });
}
function businessTravel(tt: string, dist: number, trips: number, origin?: string, dest?: string): DetailBuilder {
    return () => ({ scope3BusinessTravel: { create: { travelType: tt, distance: dist, numberOfTrips: trips, origin, destination: dest } } });
}
function employeeCommute(mode: string, avgDist: number, days: number, employees: number): DetailBuilder {
    return () => ({ scope3EmployeeCommuting: { create: { transportMode: mode, averageDistancePerDay: avgDist, daysPerYear: days, numberOfEmployees: employees } } });
}
function upstreamLeased(at: string, lt: string, qty: number, unit: string): DetailBuilder {
    return () => ({ scope3UpstreamLeased: { create: { assetType: at, leaseType: lt, quantity: qty, unit } } });
}
function productProcessing(pt: string, proct: string, qty: number, unit: string): DetailBuilder {
    return () => ({ scope3ProductProcessing: { create: { productType: pt, processingType: proct, quantity: qty, unit } } });
}
function productUse(pt: string, annualKwh: number, lifetime: number, unitsSold: number): DetailBuilder {
    return () => ({ scope3ProductUse: { create: { productType: pt, annualEnergyKwh: annualKwh, lifetimeYears: lifetime, unitsSold } } });
}
function endOfLife(dt: DisposalType, qty: number, unit: string): DetailBuilder {
    return () => ({ scope3EndOfLife: { create: { disposalType: dt, wasteQuantity: qty, unit } } });
}
function downstreamLeased(pt: string, lt: string, qty: number, unit: string): DetailBuilder {
    return () => ({ scope3DownstreamLeased: { create: { productType: pt, leaseType: lt, quantity: qty, unit } } });
}

// Data by year — values scaled with YoY reductions
const YEAR_SCALE: Record<number, number> = {
    [BASE_YEAR]: 1.08,
    [PREV_YEAR]: 1.035,
    [CURRENT_YEAR]: 1.0,
};

// Fleet fuel tracking is done by the dashboard code reading vehicle.fuelType.
// Stationary fuel tracking checks for "diesel" → generators, "natural_gas" → processGases.
// Waste disposal tracking checks for "recycl" substring.
// All use exact lowercase strings.
const SCOPE1_DEFS: Array<Omit<ActivityDef, "inputValue"> & { baseValue: number; facilityIdx: number }> = [
    // Fleet vehicles
    { scope: "scope1", scope3Cat: null, activityType: "gasoline", baseValue: 45000, inputUnit: "liter", facilityIdx: 0, detail: vehicle("sedan", "gasoline", 45000, "liter"), qualifier: "sedan fleet" },
    { scope: "scope1", scope3Cat: null, activityType: "diesel", baseValue: 85000, inputUnit: "liter", facilityIdx: 0, detail: vehicle("truck_heavy", "diesel", 85000, "liter"), qualifier: "heavy truck fleet" },
    { scope: "scope1", scope3Cat: null, activityType: "diesel", baseValue: 42000, inputUnit: "liter", facilityIdx: 2, detail: vehicle("van", "diesel", 42000, "liter"), qualifier: "van fleet" },
    // Stationary combustion
    { scope: "scope1", scope3Cat: null, activityType: "natural_gas", baseValue: 500000, inputUnit: "m3", facilityIdx: 0, detail: stationary("boiler", "natural_gas", 500000, "m3"), qualifier: "main boiler" },
    { scope: "scope1", scope3Cat: null, activityType: "natural_gas", baseValue: 300000, inputUnit: "m3", facilityIdx: 0, detail: stationary("furnace", "natural_gas", 300000, "m3"), qualifier: "heat treatment furnace" },
    { scope: "scope1", scope3Cat: null, activityType: "diesel", baseValue: 20000, inputUnit: "liter", facilityIdx: 1, detail: stationary("generator", "diesel", 20000, "liter"), qualifier: "backup generator" },
    // Refrigerants
    { scope: "scope1", scope3Cat: null, activityType: "r410a", baseValue: 100, inputUnit: "kg", facilityIdx: 0, detail: refrigerant("R-410A", 100), qualifier: "HVAC R-410A" },
    { scope: "scope1", scope3Cat: null, activityType: "r22", baseValue: 50, inputUnit: "kg", facilityIdx: 0, detail: refrigerant("R-22", 50), qualifier: "HVAC R-22" },
    { scope: "scope1", scope3Cat: null, activityType: "r134a", baseValue: 60, inputUnit: "kg", facilityIdx: 1, detail: refrigerant("R-134a", 60), qualifier: "chiller R-134a" },
];

const SCOPE2_DEFS: Array<{ baseValue: number; facilityIdx: number; detail: DetailBuilder; qualifier: string }> = [
    { baseValue: 8_000_000, facilityIdx: 0, detail: electricity(8_000_000, "kWh", "MROE"), qualifier: "main plant" },
    { baseValue: 3_000_000, facilityIdx: 1, detail: electricity(3_000_000, "kWh", "MROE"), qualifier: "assembly line 2" },
    { baseValue: 1_200_000, facilityIdx: 2, detail: electricity(1_200_000, "kWh", "MROE"), qualifier: "warehouse" },
];

const SCOPE3_DEFS: Array<Omit<ActivityDef, "inputValue"> & { baseValue: number; facilityIdx: number }> = [
    // Cat 1: Purchased goods — the dominant scope 3 category
    { scope: "scope3", scope3Cat: "cat1_purchased_goods", activityType: "steel", baseValue: 1_400_000, inputUnit: "kg", facilityIdx: 0, detail: purchasedGoods("steel", 1_400_000, "kg", "US"), qualifier: "stainless steel coils" },
    { scope: "scope3", scope3Cat: "cat1_purchased_goods", activityType: "plastic", baseValue: 200_000, inputUnit: "kg", facilityIdx: 0, detail: purchasedGoods("plastic", 200_000, "kg", "US"), qualifier: "engineering plastics" },
    { scope: "scope3", scope3Cat: "cat1_purchased_goods", activityType: "chemicals", baseValue: 300_000, inputUnit: "kg", facilityIdx: 0, detail: purchasedGoods("chemicals", 300_000, "kg", "US"), qualifier: "surface treatment chemicals" },
    // Cat 2: Capital goods
    { scope: "scope3", scope3Cat: "cat2_capital_goods", activityType: "machinery", baseValue: 500_000, inputUnit: "kg", facilityIdx: 0, detail: capitalGoods("CNC Machining Center", 500_000, "kg", CURRENT_YEAR), qualifier: "CNC machining center" },
    // Cat 3: Fuel & energy
    { scope: "scope3", scope3Cat: "cat3_fuel_energy", activityType: "fuel_extraction", baseValue: 8_000_000, inputUnit: "kWh", facilityIdx: 0, detail: fuelEnergy("electricity", 8_000_000, "kWh", "extraction"), qualifier: "well-to-tank electricity" },
    // Cat 4: Upstream transport
    { scope: "scope3", scope3Cat: "cat4_upstream_transport", activityType: "road_freight", baseValue: 13_400_000, inputUnit: "ton-km", facilityIdx: 2, detail: transport("truck", 10_000, 1_340, "km", "upstream"), qualifier: "inbound raw materials" },
    // Cat 5: Waste — need "recycl" in disposalMethod for recycling rate calc
    { scope: "scope3", scope3Cat: "cat5_waste", activityType: "landfill", baseValue: 120_000, inputUnit: "kg", facilityIdx: 0, detail: waste("non_hazardous", "landfill", 120_000, "kg"), qualifier: "general waste landfill" },
    { scope: "scope3", scope3Cat: "cat5_waste", activityType: "recycling", baseValue: 180_000, inputUnit: "kg", facilityIdx: 0, detail: waste("metal", "recycling", 180_000, "kg"), qualifier: "scrap metal recycling" },
    // Cat 6: Business travel
    { scope: "scope3", scope3Cat: "cat6_business_travel", activityType: "flight_long_haul", baseValue: 50_000, inputUnit: "km", facilityIdx: 0, detail: businessTravel("flight", 10_000, 5, "New York", "London"), qualifier: "international flights" },
    // Cat 7: Employee commuting
    { scope: "scope3", scope3Cat: "cat7_employee_commuting", activityType: "car", baseValue: 1_650_000, inputUnit: "passenger-km", facilityIdx: 0, detail: employeeCommute("car", 30, 220, 250), qualifier: "car commuters" },
    // Cat 8: Upstream leased
    { scope: "scope3", scope3Cat: "cat8_upstream_leased", activityType: "office_space", baseValue: 10_000, inputUnit: "sqm", facilityIdx: 2, detail: upstreamLeased("office", "operating", 10_000, "sqm"), qualifier: "leased office space" },
    // Cat 9: Downstream transport
    { scope: "scope3", scope3Cat: "cat9_downstream_transport", activityType: "road_freight", baseValue: 4_000_000, inputUnit: "ton-km", facilityIdx: 2, detail: transport("truck", 8_000, 500, "km", "downstream"), qualifier: "outbound delivery" },
    // Cat 10: Product processing
    { scope: "scope3", scope3Cat: "cat10_product_processing", activityType: "processing_steel", baseValue: 400_000, inputUnit: "kg", facilityIdx: 0, detail: productProcessing("steel_components", "fabrication", 400_000, "kg"), qualifier: "steel component fabrication" },
    // Cat 11: Product use
    { scope: "scope3", scope3Cat: "cat11_product_use", activityType: "product_electricity", baseValue: 5_000_000, inputUnit: "kWh", facilityIdx: 1, detail: productUse("industrial_motor", 2_000, 5, 500), qualifier: "industrial motors sold" },
    // Cat 12: End of life
    { scope: "scope3", scope3Cat: "cat12_end_of_life", activityType: "recycling", baseValue: 200_000, inputUnit: "kg", facilityIdx: 0, detail: endOfLife("recycling", 200_000, "kg"), qualifier: "product end-of-life recycling" },
    // Cat 13: Downstream leased
    { scope: "scope3", scope3Cat: "cat13_downstream_leased", activityType: "equipment_leased", baseValue: 20_000, inputUnit: "kg", facilityIdx: 1, detail: downstreamLeased("machinery", "operating", 20_000, "kg"), qualifier: "leased equipment" },
];

// ─── Factor seeding ───────────────────────────────────────────────────

async function seedFactors() {
    const allFactors = [...SCOPE1_FACTORS, ...SCOPE2_FACTORS, ...SCOPE3_FACTORS];
    const map: Record<string, string> = {};

    for (const f of allFactors) {
        const key = `${f.country}:${f.category}:${f.scope3Category ?? ""}:${f.activityType}`;
        const existing = await prisma.emissionFactor.findFirst({
            where: {
                country: f.country, category: f.category,
                scope3Category: f.scope3Category ?? undefined,
                activityType: f.activityType,
                organizationId: null, isCustom: false,
            },
        });
        if (existing) { map[key] = existing.id; continue; }
        const ef = await prisma.emissionFactor.create({
            data: {
                category: f.category, scope3Category: f.scope3Category ?? undefined,
                activityType: f.activityType, activityUnit: f.activityUnit,
                factorValue: f.factorValue, source: f.source, country: f.country,
                validFrom: VALID_FROM, validTo: VALID_TO,
            },
        });
        map[key] = ef.id;
    }
    console.log(`  Seeded ${allFactors.length} emission factors`);
    return map;
}

// ─── Facilities ───────────────────────────────────────────────────────

const FACILITY_DEFS = [
    { name: "Main Manufacturing Plant", location: "123 Industrial Blvd", address: "123 Industrial Blvd, City, State 12345", facilityType: "manufacturing" },
    { name: "Assembly Line 2", location: "456 Production Ave", address: "456 Production Ave, City, State 12345", facilityType: "assembly" },
    { name: "Warehouse & Logistics", location: "789 Storage Rd", address: "789 Storage Rd, City, State 12345", facilityType: "warehouse" },
];

async function seedFacilities(orgId: string) {
    const map: Record<string, string> = {};
    for (const f of FACILITY_DEFS) {
        const existing = await prisma.facility.findFirst({ where: { organizationId: orgId, name: f.name } });
        if (existing) { map[f.name] = existing.id; continue; }
        const fac = await prisma.facility.create({ data: { organizationId: orgId, ...f } });
        map[f.name] = fac.id;
    }
    return map;
}

// ─── Suppliers ────────────────────────────────────────────────────────

const SUPPLIER_DEFS = [
    { name: "Apex Stainless Supply Co.", categories: ["stainless_steel"] as SupplierCategory[], country: "US", contactEmail: "sustainability@apexstainless.com" },
    { name: "Pacific Aluminum Works", categories: ["aluminum"] as SupplierCategory[], country: "US", contactEmail: "esg@pacificaluminum.com" },
    { name: "ChemTreat Solutions", categories: ["chemicals"] as SupplierCategory[], country: "US", contactEmail: "compliance@chemtreat.com" },
    { name: "Midwest Freight Logistics", categories: ["logistics"] as SupplierCategory[], country: "US", contactEmail: "ops@midwestfreight.com" },
    { name: "Global Metals & Alloys", categories: ["stainless_steel", "logistics"] as SupplierCategory[], country: "US", contactEmail: "esg@globalmetals.com" },
    { name: "Precision Plastics Corp", categories: ["other"] as SupplierCategory[], country: "US", contactEmail: "quality@precisionplastics.com" },
];

async function seedSuppliers(orgId: string, userId: string | null) {
    const map: Record<string, string> = {};
    for (const s of SUPPLIER_DEFS) {
        const existing = await prisma.supplier.findFirst({ where: { organizationId: orgId, name: s.name } });
        if (existing) { map[s.name] = existing.id; continue; }
        const supplier = await prisma.supplier.create({
            data: { organizationId: orgId, name: s.name, country: s.country, contactEmail: s.contactEmail, categories: [...s.categories] },
        });
        map[s.name] = supplier.id;
    }

    // Create questionnaire invites for supply chain dashboard metrics
    // All 6 suppliers have invites; 4 are submitted (CoC signed), 2 are pending
    for (let i = 0; i < SUPPLIER_DEFS.length; i++) {
        const s = SUPPLIER_DEFS[i];
        const supplierId = map[s.name];
        const existingInvites = await prisma.supplierQuestionnaireInvite.findFirst({
            where: { organizationId: orgId, supplierId },
        });
        if (existingInvites) continue;

        const token = `seed-token-${orgId}-${supplierId}-${Date.now()}`;
        const tokenHash = await bcrypt.hash(token, 6);

        const isSubmitted = i < 4; // first 4 are submitted, last 2 are pending
        const invite = await prisma.supplierQuestionnaireInvite.create({
            data: {
                organizationId: orgId,
                supplierId,
                tokenHash,
                questionnaireTypes: ["carbon_disclosure", "energy_usage"],
                status: isSubmitted ? "submitted" : "pending",
                expiresAt: new Date("2025-12-31"),
                sentAt: new Date("2024-01-15"),
                submittedAt: isSubmitted ? new Date("2024-02-15") : undefined,
                createdById: userId ?? "",
            },
        });

        // Create a response for submitted invites
        if (isSubmitted) {
            await prisma.supplierQuestionnaireResponse.create({
                data: {
                    inviteId: invite.id,
                    carbonDisclosure: {
                        hasSbtiCommitment: i === 0 || i === 1, // first 2 suppliers have SBTi
                        scope1: 1200,
                        scope2: 3400,
                        scope3: 8900,
                        reportingYear: 2024,
                    },
                    energyUsage: {
                        totalKwh: 500000,
                        renewablePercent: 15 + i * 5,
                    },
                    respondentName: `${s.name} Contact`,
                    respondentEmail: s.contactEmail,
                    respondentTitle: "Sustainability Manager",
                },
            });
        }
    }

    console.log(`  Seeded ${SUPPLIER_DEFS.length} suppliers + questionnaire invites`);
    return map;
}

// ─── Activity creation ───────────────────────────────────────────────

function scaleValue(baseValue: number, yearScale: number): number {
    return Math.round(baseValue * yearScale);
}

async function seedActivitiesForYear(
    orgId: string, yearId: string, year: number,
    fac: Record<string, string>,
    factors: Record<string, string>,
    country: Country,
    userId: string | null,
) {
    const scale = YEAR_SCALE[year] ?? 1.0;
    const facArr = FACILITY_DEFS.map(f => fac[f.name]);

    const created: Array<{ scope: string; scope3Category: string | null; calculatedEmissions: number }> = [];

    // Helper to get factor value + unit
    function getFactor(at: string, cat?: Scope3Category) {
        const key = `${country}:scope3:${cat ?? ""}:${at}`;
        const id = factors[key];
        if (!id) throw new Error(`Factor not found: ${key}`);
        return id;
    }

    // ── Scope 1 ──
    for (const def of SCOPE1_DEFS) {
        const val = scaleValue(def.baseValue, scale);
        const factorKey = `${country}:scope1::${def.activityType}`;
        const efId = factors[factorKey];
        if (!efId) { console.error(`  Missing factor: ${factorKey}`); continue; }
        const ef = await prisma.emissionFactor.findUniqueOrThrow({ where: { id: efId } });
        const emissions = Math.round(val * ef.factorValue * 1000) / 1000;
        const detailData = def.detail("");

        const activity = await prisma.activityData.create({
            data: {
                organizationId: orgId, reportingYearId: yearId,
                facilityId: facArr[def.facilityIdx],
                scope: "scope1", activityType: def.activityType,
                inputValue: val, inputUnit: def.inputUnit,
                convertedValue: val, convertedUnit: ef.activityUnit,
                emissionFactorId: efId, calculatedEmissions: emissions,
                dataStatus: "approved",
                submittedById: userId, approvedById: userId,
                ...detailData,
            },
        });
        created.push({ scope: "scope1", scope3Category: null, calculatedEmissions: emissions });
    }

    // ── Scope 2 ──
    const s2FactorKey = `${country}:scope2::electricity`;
    const s2EfId = factors[s2FactorKey];
    const s2Ef = s2EfId ? await prisma.emissionFactor.findUnique({ where: { id: s2EfId } }) : null;
    const gridRegion = country === "US" ? "MROE" : "MY_Peninsular";

    for (const def of SCOPE2_DEFS) {
        const val = scaleValue(def.baseValue, scale);
        if (!s2Ef) continue;
        const emissions = Math.round(val * s2Ef.factorValue * 1000) / 1000;
        const detailData = def.detail("");

        const activity = await prisma.activityData.create({
            data: {
                organizationId: orgId, reportingYearId: yearId,
                facilityId: facArr[def.facilityIdx],
                scope: "scope2", activityType: "electricity",
                inputValue: val, inputUnit: "kWh",
                convertedValue: val, convertedUnit: s2Ef.activityUnit,
                emissionFactorId: s2EfId, calculatedEmissions: emissions,
                dataStatus: "approved",
                submittedById: userId, approvedById: userId,
                ...detailData,
            },
        });
        created.push({ scope: "scope2", scope3Category: null, calculatedEmissions: emissions });
    }

    // ── Scope 3 ──
    for (const def of SCOPE3_DEFS) {
        const val = scaleValue(def.baseValue, scale);
        const efId = getFactor(def.activityType, def.scope3Cat ?? undefined);
        const ef = await prisma.emissionFactor.findUniqueOrThrow({ where: { id: efId } });
        const emissions = Math.round(val * ef.factorValue * 1000) / 1000;
        const detailData = def.detail("");

        const dataStatus = year === CURRENT_YEAR && def.scope3Cat === "cat5_waste"
            ? "submitted" as const  // one waste category has pending approval for dashboard badge
            : "approved" as const;

        const activity = await prisma.activityData.create({
            data: {
                organizationId: orgId, reportingYearId: yearId,
                facilityId: facArr[def.facilityIdx],
                scope: "scope3", scope3Category: def.scope3Cat ?? undefined,
                activityType: def.activityType,
                inputValue: val, inputUnit: def.inputUnit,
                convertedValue: val, convertedUnit: ef.activityUnit,
                emissionFactorId: efId, calculatedEmissions: emissions,
                dataStatus,
                submittedById: userId, approvedById: userId,
                ...detailData,
            },
        });
        created.push({ scope: "scope3", scope3Category: def.scope3Cat ?? null, calculatedEmissions: emissions });
    }

    // Print summary
    const s1 = created.filter(c => c.scope === "scope1").reduce((s, c) => s + c.calculatedEmissions, 0);
    const s2 = created.filter(c => c.scope === "scope2").reduce((s, c) => s + c.calculatedEmissions, 0);
    const s3 = created.filter(c => c.scope === "scope3").reduce((s, c) => s + c.calculatedEmissions, 0);
    console.log(`  ${year}: S1=${(s1 / 1000).toFixed(1)}t S2=${(s2 / 1000).toFixed(1)}t S3=${(s3 / 1000).toFixed(1)}t Total=${((s1 + s2 + s3) / 1000).toFixed(1)}t`);
    return created;
}

// ─── Clean old data for an org + years ──────────────────────────────

async function cleanupOrgData(orgId: string) {
    const years = await prisma.reportingYear.findMany({
        where: { organizationId: orgId, year: { in: [...YEARS] } },
    });
    const yearIds = years.map(y => y.id);
    if (yearIds.length === 0) return years;

    // Delete related records in order (respect FK constraints through cascade)
    // ActivityData cascade should handle detail records
    await prisma.activityData.deleteMany({
        where: { organizationId: orgId, reportingYearId: { in: yearIds } },
    });

    return years;
}

// ─── Org-level seeding ────────────────────────────────────────────────

async function seedForOrg(orgSlug: string, country: Country) {
    const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
    if (!org) { console.log(`  Skip ${orgSlug}: not found`); return; }

    const user = await prisma.user.findFirst({ where: { organizationId: org.id } });
    const userId = user?.id ?? null;

    console.log(`\n${org.name} (${country})`);

    // Ensure reporting years exist
    for (const yr of YEARS) {
        await prisma.reportingYear.upsert({
            where: { organizationId_year: { organizationId: org.id, year: yr } },
            update: { status: yr === CURRENT_YEAR ? "draft" : "approved" },
            create: { organizationId: org.id, year: yr, status: yr === CURRENT_YEAR ? "draft" : "approved" },
        });
    }

    // Clean old activity data for these years
    const existingYears = await cleanupOrgData(org.id);
    if (existingYears.length > 0) {
        console.log(`  Cleaned existing activities for years: ${existingYears.map(y => y.year).join(", ")}`);
    }

    const factors = await seedFactors();
    const facilities = await seedFacilities(org.id);
    await seedSuppliers(org.id, userId);

    // Seed each year — oldest first for base year to work correctly
    for (const yr of YEARS) {
        const yearRec = await prisma.reportingYear.findUniqueOrThrow({
            where: { organizationId_year: { organizationId: org.id, year: yr } },
        });
        await seedActivitiesForYear(org.id, yearRec.id, yr, facilities, factors, country, userId);
    }
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
    console.log("Seeding comprehensive scope activities for dashboard...\n");

    await seedForOrg("matc-precision", "US");
    await seedForOrg("acme-manufacturing", "US");
    await seedForOrg("green-energy-sdn", "MY");

    console.log("\nDone! Dashboard should now display rich data across all tabs.");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
