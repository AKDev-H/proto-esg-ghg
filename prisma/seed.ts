import {
    PrismaClient,
    EmissionScope,
    Scope3Category,
    Country,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    const passwordHash = await bcrypt.hash("admin123", 12);

    const org1 = await prisma.organization.upsert({
        where: { slug: "acme-manufacturing" },
        update: {},
        create: {
            name: "Acme Manufacturing",
            slug: "acme-manufacturing",
            country: "US",
            currency: "USD",
            reportingYear: 2024,
            industryType: "automotive",
        },
    });
    console.log("Created organization:", org1.name);

    const org2 = await prisma.organization.upsert({
        where: { slug: "green-energy-sdn" },
        update: {},
        create: {
            name: "Green Energy Sdn Bhd",
            slug: "green-energy-sdn",
            country: "MY",
            currency: "MYR",
            reportingYear: 2024,
            industryType: "electronics",
        },
    });
    console.log("Created organization:", org2.name);

    const superAdmin = await prisma.user.upsert({
        where: { email: "admin@esgcarbon.com" },
        update: {},
        create: {
            email: "admin@esgcarbon.com",
            name: "Super Admin",
            passwordHash,
            role: "super_admin",
            organizationId: null,
        },
    });
    console.log("Created super admin user:", superAdmin.email);

    const orgAdmin = await prisma.user.upsert({
        where: { email: "admin@acme.com" },
        update: {},
        create: {
            email: "admin@acme.com",
            name: "Acme Admin",
            passwordHash,
            role: "org_admin",
            organizationId: org1.id,
        },
    });
    console.log("Created org admin user:", orgAdmin.email);

    const sustainabilityManager = await prisma.user.upsert({
        where: { email: "sustainability@greenenergy.my" },
        update: {},
        create: {
            email: "sustainability@greenenergy.my",
            name: "Green Energy Manager",
            passwordHash,
            role: "sustainability_manager",
            organizationId: org2.id,
        },
    });
    console.log("Created sustainability manager:", sustainabilityManager.email);

    const reportingYear1 = await prisma.reportingYear.upsert({
        where: {
            organizationId_year: {
                organizationId: org1.id,
                year: 2024,
            },
        },
        update: {},
        create: {
            organizationId: org1.id,
            year: 2024,
            status: "draft",
        },
    });
    console.log("Created reporting year:", reportingYear1.year);

    const reportingYear2 = await prisma.reportingYear.upsert({
        where: {
            organizationId_year: {
                organizationId: org2.id,
                year: 2024,
            },
        },
        update: {},
        create: {
            organizationId: org2.id,
            year: 2024,
            status: "draft",
        },
    });
    console.log("Created reporting year:", reportingYear2.year);

    const factorSources = [
        {
            name: "EPA",
            abbreviation: "EPA",
            description: "US Environmental Protection Agency",
        },
        {
            name: "DEFRA",
            abbreviation: "DEFRA",
            description: "UK Department for Environment, Food & Rural Affairs",
        },
        {
            name: "Malaysia Grid",
            abbreviation: "MY-GRID",
            description: " Malaysia Grid Emission Factor",
        },
    ];

    for (const source of factorSources) {
        await prisma.factorSource.upsert({
            where: { name: source.name },
            update: {},
            create: source,
        });
    }
    console.log("Created factor sources");

    const emissionFactors: {
        category: EmissionScope;
        scope3Category?: Scope3Category;
        activityType: string;
        activityUnit: string;
        factorValue: number;
        source: string;
        country: Country;
        validFrom: Date;
    }[] = [
        {
            category: "scope1",
            activityType: "gasoline",
            activityUnit: "liter",
            factorValue: 2.31,
            source: "EPA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope1",
            activityType: "diesel",
            activityUnit: "liter",
            factorValue: 2.68,
            source: "EPA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope1",
            activityType: "natural_gas",
            activityUnit: "m3",
            factorValue: 2.0,
            source: "EPA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope1",
            activityType: "gasoline",
            activityUnit: "liter",
            factorValue: 2.31,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope1",
            activityType: "diesel",
            activityUnit: "liter",
            factorValue: 2.68,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope2",
            activityType: "electricity",
            activityUnit: "kWh",
            factorValue: 0.42,
            source: "EPA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope2",
            activityType: "electricity",
            activityUnit: "kWh",
            factorValue: 0.58,
            source: "Malaysia Grid",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat1_purchased_goods",
            activityType: "steel",
            activityUnit: "kg",
            factorValue: 1.85,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat1_purchased_goods",
            activityType: "plastic",
            activityUnit: "kg",
            factorValue: 2.13,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat1_purchased_goods",
            activityType: "steel",
            activityUnit: "kg",
            factorValue: 1.85,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat11_product_use",
            activityType: "electric_equipment",
            activityUnit: "kWh",
            factorValue: 0.5,
            source: "EPA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat11_product_use",
            activityType: "electric_equipment",
            activityUnit: "kWh",
            factorValue: 0.5,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 2: Capital Goods
        {
            category: "scope3",
            scope3Category: "cat2_capital_goods",
            activityType: "machinery",
            activityUnit: "kg",
            factorValue: 2.5,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat2_capital_goods",
            activityType: "machinery",
            activityUnit: "kg",
            factorValue: 2.5,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 3: Fuel & Energy Related Activities
        {
            category: "scope3",
            scope3Category: "cat3_fuel_energy",
            activityType: "natural_gas",
            activityUnit: "kg",
            factorValue: 2.0,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat3_fuel_energy",
            activityType: "diesel",
            activityUnit: "liter",
            factorValue: 2.68,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 4: Upstream Transportation
        {
            category: "scope3",
            scope3Category: "cat4_upstream_transport",
            activityType: "road_transport",
            activityUnit: "ton-km",
            factorValue: 0.062,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat4_upstream_transport",
            activityType: "road_transport",
            activityUnit: "ton-km",
            factorValue: 0.062,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 5: Waste Generated
        {
            category: "scope3",
            scope3Category: "cat5_waste",
            activityType: "landfill",
            activityUnit: "kg",
            factorValue: 0.58,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat5_waste",
            activityType: "landfill",
            activityUnit: "kg",
            factorValue: 0.58,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat5_waste",
            activityType: "recycling",
            activityUnit: "kg",
            factorValue: -0.21,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 6: Business Travel
        {
            category: "scope3",
            scope3Category: "cat6_business_travel",
            activityType: "flight_short",
            activityUnit: "km",
            factorValue: 0.255,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat6_business_travel",
            activityType: "flight_long",
            activityUnit: "km",
            factorValue: 0.195,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat6_business_travel",
            activityType: "hotel",
            activityUnit: "night",
            factorValue: 21.0,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 7: Employee Commuting
        {
            category: "scope3",
            scope3Category: "cat7_employee_commuting",
            activityType: "car",
            activityUnit: "km",
            factorValue: 0.171,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat7_employee_commuting",
            activityType: "car",
            activityUnit: "km",
            factorValue: 0.171,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 8: Upstream Leased Assets
        {
            category: "scope3",
            scope3Category: "cat8_upstream_leased",
            activityType: "equipment",
            activityUnit: "kg",
            factorValue: 2.0,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 9: Downstream Transportation
        {
            category: "scope3",
            scope3Category: "cat9_downstream_transport",
            activityType: "road_transport",
            activityUnit: "ton-km",
            factorValue: 0.062,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat9_downstream_transport",
            activityType: "road_transport",
            activityUnit: "ton-km",
            factorValue: 0.062,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 10: Processing of Sold Products
        {
            category: "scope3",
            scope3Category: "cat10_product_processing",
            activityType: "processing",
            activityUnit: "kg",
            factorValue: 0.5,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 12: End of Life Treatment
        {
            category: "scope3",
            scope3Category: "cat12_end_of_life",
            activityType: "landfill",
            activityUnit: "kg",
            factorValue: 0.58,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
        {
            category: "scope3",
            scope3Category: "cat12_end_of_life",
            activityType: "recycling",
            activityUnit: "kg",
            factorValue: -0.21,
            source: "DEFRA",
            country: "MY",
            validFrom: new Date("2024-01-01"),
        },
        // Cat 13: Downstream Leased Assets
        {
            category: "scope3",
            scope3Category: "cat13_downstream_leased",
            activityType: "building",
            activityUnit: "sqm",
            factorValue: 35.0,
            source: "DEFRA",
            country: "US",
            validFrom: new Date("2024-01-01"),
        },
    ];

    for (const factor of emissionFactors) {
        await prisma.emissionFactor.create({
            data: {
                ...factor,
                validTo: new Date("2025-12-31"),
            },
        });
    }
    console.log("Created emission factors");

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
