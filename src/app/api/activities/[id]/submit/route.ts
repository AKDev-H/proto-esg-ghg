import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const activity = await prisma.activityData.findUnique({ where: { id } })
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (activity.dataStatus === 'approved') {
      return NextResponse.json({ error: 'Activity already approved' }, { status: 400 })
    }

    const updated = await prisma.activityData.update({
      where: { id },
      data: {
        dataStatus: 'submitted',
        submittedById: session.user.id,
      },
    })

    await prisma.approvalRequest.create({
      data: {
        activityDataId: id,
        requestedById: session.user.id,
        status: 'pending',
      },
    })

    await prisma.auditLog.create({
      data: {
        organizationId: activity.organizationId,
        userId: session.user.id,
        action: 'submit',
        entityType: 'ActivityData',
        entityId: id,
        newValue: { dataStatus: 'submitted' },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}