import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

// GET /api/notifications — get notifications for logged-in user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: any = { userId: session.user.id }
    if (type && type !== 'ALL') where.type = type
    if (unreadOnly) where.isRead = false

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/notifications — internal: create notification (admin/system use)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, title, message, type, link } = await req.json()
    if (!userId || !title || !message || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const notification = await prisma.notification.create({
      data: { userId, title, message, type, link },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('POST /api/notifications error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
