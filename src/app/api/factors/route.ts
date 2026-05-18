import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ADMIN_ROLES } from '@/modules/auth/types'
import { factorSchema, factorFilterSchema } from '@/modules/emission-factors/schemas'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const country = searchParams.get('country')
        const activityType = searchParams.get('activityType')
        
        const params = factorFilterSchema.parse({
            category: category || undefined,
            country: country || undefined,
            activityType: activityType || undefined,
        })

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const where = {} as Record<string, unknown>

        if (params.category) where.category = params.category
        if (params.country) where.country = params.country
        if (params.activityType) {
            where.activityType = { contains: params.activityType, mode: 'insensitive' }
        }

        const organizationId = session.user.organizationId
        if (organizationId) {
            where.OR = [{ organizationId }, { organizationId: null }]
        }

const [factors, total] = await Promise.all([
            prisma.emissionFactor.findMany({
                where,
                orderBy: [{ category: "asc" }, { activityType: "asc" }],
                skip,
                take: limit,
            }),
            prisma.emissionFactor.count({ where }),
        ])

        return NextResponse.json({
            factors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Factors GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!ADMIN_ROLES.includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const data = factorSchema.parse(body)

        const factor = await prisma.emissionFactor.create({
            data: {
                category: data.category,
                scope3Category: data.scope3Category as any,
                activityType: data.activityType,
                activityUnit: data.activityUnit,
                factorValue: data.factorValue,
                source: data.source,
                country: data.country,
                validFrom: new Date(data.validFrom),
                validTo: data.validTo ? new Date(data.validTo) : null,
                isCustom: data.isCustom ?? false,
                organizationId: data.organizationId ?? null,
            },
        })

        return NextResponse.json(factor, { status: 201 })
    } catch (error) {
        console.error('Factors POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
