import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
    buildMatcEmissionFactors,
    MATC_FACTOR_SOURCES,
    MATC_ORG_FACTOR_SOURCES,
} from "../src/lib/matc-emission-factors";
import { ensureTemplateOnDisk } from "../src/modules/reports/excel/template";

const prisma = new PrismaClient();

const matcOrgSettings = {
    profile: "MATC",
    factorSources: [...MATC_ORG_FACTOR_SOURCES],
    priorityActivities: [
        "stainless_steel",
        "aluminum",
        "chemicals_passivation",
        "clean_room_electricity_upstream",
        "road_freight",
        "scrap_metal_recycling",
        "hazardous_waste",
        "tooling_machinery",
    ],
};

async function main() {
    console.log("Seeding database...");

    const passwordHash = await bcrypt.hash("admin123", 12);

    const orgMatc = await prisma.organization.upsert({
        where: { slug: "matc-precision" },
        update: {
            industryType: "metals",
            settings: matcOrgSettings,
        },
        create: {
            name: "MATC Precision Manufacturing",
            slug: "matc-precision",
            country: "US",
            currency: "USD",
            reportingYear: 2024,
            industryType: "metals",
            settings: matcOrgSettings,
        },
    });
    console.log("Created organization:", orgMatc.name);

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

    const matcAdmin = await prisma.user.upsert({
        where: { email: "admin@matc.com" },
        update: {},
        create: {
            email: "admin@matc.com",
            name: "MATC Admin",
            passwordHash,
            role: "org_admin",
            organizationId: orgMatc.id,
        },
    });
    console.log("Created MATC org admin:", matcAdmin.email);

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

    for (const org of [orgMatc, org1, org2]) {
        await prisma.reportingYear.upsert({
            where: {
                organizationId_year: {
                    organizationId: org.id,
                    year: 2024,
                },
            },
            update: {},
            create: {
                organizationId: org.id,
                year: 2024,
                status: "draft",
            },
        });
    }
    console.log("Created reporting years");

    for (const source of MATC_FACTOR_SOURCES) {
        await prisma.factorSource.upsert({
            where: { name: source.name },
            update: {
                abbreviation: source.abbreviation,
                description: source.description,
                url: source.url,
            },
            create: source,
        });
    }
    console.log("Created factor sources");

    await prisma.activityData.updateMany({
        data: { emissionFactorId: null },
    });
    await prisma.emissionFactor.deleteMany({
        where: { isCustom: false, organizationId: null },
    });

    const emissionFactors = buildMatcEmissionFactors();
    const validTo = new Date("2025-12-31");

    for (const { matcPriority, ...factorData } of emissionFactors) {
        void matcPriority;
        await prisma.emissionFactor.create({
            data: {
                ...factorData,
                validTo,
            },
        });
    }
    console.log(
        `Created ${emissionFactors.length} core MATC emission factors (US + MY)`,
    );

    const matcSuppliers = [
        {
            name: "Apex Stainless Supply Co.",
            categories: ["stainless_steel"] as const,
            country: "US",
            contactEmail: "sustainability@apexstainless.com",
        },
        {
            name: "Pacific Aluminum Works",
            categories: ["aluminum"] as const,
            country: "US",
            contactEmail: "esg@pacificaluminum.com",
        },
        {
            name: "ChemTreat Solutions",
            categories: ["chemicals"] as const,
            country: "US",
            contactEmail: "compliance@chemtreat.com",
        },
        {
            name: "Midwest Freight Logistics",
            categories: ["logistics"] as const,
            country: "US",
            contactEmail: "operations@midwestfreight.com",
        },
        {
            name: "Global Metals & Logistics",
            categories: ["stainless_steel", "logistics"] as const,
            country: "US",
            contactEmail: "esg@globalmetalslogistics.com",
        },
    ];

    for (const supplier of matcSuppliers) {
        const existing = await prisma.supplier.findFirst({
            where: {
                organizationId: orgMatc.id,
                name: supplier.name,
            },
        });

        if (!existing) {
            await prisma.supplier.create({
                data: {
                    organizationId: orgMatc.id,
                    name: supplier.name,
                    country: supplier.country,
                    contactEmail: supplier.contactEmail,
                    categories: [...supplier.categories],
                },
            });
        } else {
            await prisma.supplier.update({
                where: { id: existing.id },
                data: { categories: [...supplier.categories] },
            });
        }
    }
    console.log("Created MATC priority suppliers");

    await ensureTemplateOnDisk();
    console.log("Created GHG Protocol / MATC Excel template");

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
