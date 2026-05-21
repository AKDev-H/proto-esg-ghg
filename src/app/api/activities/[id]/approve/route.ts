import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canApproveActivities } from '@/lib/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canApproveActivities(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const activity = await prisma.activityData.findUnique({ where: { id } })
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (activity.dataStatus !== 'submitted') {
      return NextResponse.json({ error: 'Activity must be submitted first' }, { status: 400 })
    }

    const updated = await prisma.activityData.update({
      where: { id },
      data: {
        dataStatus: body.status === 'reject' ? 'rejected' : 'approved',
        approvedById: session.user.id,
      },
    })

    await prisma.approvalRequest.updateMany({
      where: { activityDataId: id, status: 'pending' },
      data: {
        status: body.status === 'reject' ? 'rejected' : 'approved',
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        comments: body.comments,
      },
    })

    await prisma.auditLog.create({
      data: {
        organizationId: activity.organizationId,
        userId: session.user.id,
        action: body.status === 'reject' ? 'reject' : 'approve',
        entityType: 'ActivityData',
        entityId: id,
        newValue: { dataStatus: updated.dataStatus },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}