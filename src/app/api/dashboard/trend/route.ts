import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const yearsParam = searchParams.get('years')
    const organizationId = session.user.organizationId
    const isSuperAdmin = session.user.role === "super_admin"

    if (isSuperAdmin) {
      return NextResponse.json([])
    }

    if (!yearsParam) {
      return NextResponse.json({ error: 'Years parameter required' }, { status: 400 })
    }

    const years = yearsParam.split(',').map(Number)

    const reportingYears = await prisma.reportingYear.findMany({
      where: {
        year: { in: years },
        organizationId: organizationId!,
      },
      include: {
        activities: {
          select: {
            scope: true,
            scope3Category: true,
            calculatedEmissions: true,
          },
        },
      },
    })

    const trendData = reportingYears.map((ry) => {
      const totalEmissions = ry.activities.reduce((sum, a) => sum + (a.calculatedEmissions ?? 0), 0)
      const byScope = {
        scope1: 0,
        scope2: 0,
        scope3: 0,
      }
      for (const activity of ry.activities) {
        byScope[activity.scope as keyof typeof byScope] += activity.calculatedEmissions ?? 0
      }

      return {
        year: ry.year,
        total: Math.round(totalEmissions),
        totalTonCO2e: Math.round(totalEmissions / 1000 * 100) / 100,
        scope1: Math.round(byScope.scope1),
        scope2: Math.round(byScope.scope2),
        scope3: Math.round(byScope.scope3),
      }
    })

    return NextResponse.json(trendData)
  } catch (error) {
    console.error('Dashboard trend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}