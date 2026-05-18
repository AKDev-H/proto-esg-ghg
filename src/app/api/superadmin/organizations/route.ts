import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COUNTRY_CONFIG } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { hashPassword } from "@/lib/auth";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                country: true,
                currency: true,
                reportingYear: true,
                industryType: true,
                settings: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        users: true,
                        facilities: true,
                        reports: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(organizations);
    } catch (error) {
        console.error("Superadmin organizations GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, country, reportingYear, industryType, adminEmail, adminPassword, adminName } = body;

        if (!name || !country || !reportingYear || !industryType || !adminEmail || !adminPassword || !adminName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingOrg = await prisma.organization.findFirst({
            where: { slug: slugify(name) },
        });

        if (existingOrg) {
            return NextResponse.json({ error: "Organization name already exists" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const passwordHash = await hashPassword(adminPassword);
        const countryConfig = COUNTRY_CONFIG[country as keyof typeof COUNTRY_CONFIG];

        const organization = await prisma.organization.create({
            data: {
                name,
                slug: slugify(name),
                country,
                currency: countryConfig.currency,
                reportingYear,
                industryType,
                settings: {
                    distanceUnit: countryConfig.units.distance,
                    weightUnit: countryConfig.units.weight,
                    fuelUnit: countryConfig.units.fuel,
                    factorSource: countryConfig.defaultFactorSource,
                },
                users: {
                    create: {
                        email: adminEmail,
                        passwordHash,
                        name: adminName,
                        role: "org_admin",
                    },
                },
                reportingYears: {
                    create: {
                        year: reportingYear,
                        status: "draft",
                    },
                },
            },
            include: {
                users: true,
            },
        });

        return NextResponse.json(
            {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                country: organization.country,
                admin: {
                    email: organization.users[0].email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Superadmin organization creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}