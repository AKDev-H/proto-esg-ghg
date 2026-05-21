import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { COUNTRY_CONFIG } from '@/lib/constants'
import { slugify } from '@/lib/utils'

const createOrganizationSchema = {
    name: { type: 'string', minLength: 2 },
    country: { enum: ['US', 'MY'] },
    reportingYear: { type: 'number' },
    industryType: { type: 'string' },
    adminEmail: { type: 'string' },
    adminPassword: { type: 'string', minLength: 6 },
    adminName: { type: 'string', minLength: 2 },
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.name || !body.country || !body.reportingYear || !body.industryType || !body.adminEmail || !body.adminPassword || !body.adminName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const existingOrg = await prisma.organization.findFirst({
            where: { slug: slugify(body.name) },
        })

        if (existingOrg) {
            return NextResponse.json({ error: 'Organization name already exists' }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: body.adminEmail },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
        }

        const passwordHash = await hashPassword(body.adminPassword)
        const countryConfig = COUNTRY_CONFIG[body.country as keyof typeof COUNTRY_CONFIG]

        const organization = await prisma.organization.create({
            data: {
                name: body.name,
                slug: slugify(body.name),
                country: body.country,
                currency: countryConfig.currency,
                reportingYear: body.reportingYear,
                industryType: body.industryType as 'automotive' | 'electronics' | 'food_beverage' | 'chemicals' | 'textiles' | 'plastics' | 'metals' | 'machinery' | 'paper_packaging' | 'other',
                settings: {
                    distanceUnit: countryConfig.units.distance,
                    weightUnit: countryConfig.units.weight,
                    fuelUnit: countryConfig.units.fuel,
                    factorSource: countryConfig.defaultFactorSource,
                },
                users: {
                    create: {
                        email: body.adminEmail,
                        passwordHash,
                        name: body.adminName,
                        role: 'org_admin',
                    },
                },
                reportingYears: {
                    create: {
                        year: body.reportingYear,
                        status: 'draft',
                    },
                },
            },
            include: {
                users: true,
            },
        })

        return NextResponse.json(
            {
                organization: {
                    id: organization.id,
                    name: organization.name,
                    slug: organization.slug,
                    country: organization.country,
                },
                admin: {
                    email: organization.users[0].email,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                country: true,
                currency: true,
                industryType: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        facilities: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(organizations)
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}