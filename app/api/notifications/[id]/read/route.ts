import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

// PATCH /api/notifications/[id]/read — mark single notification as read
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Only update if the notification belongs to this user
    const notification = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    })

    if (notification.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/notifications/[id]/read error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
