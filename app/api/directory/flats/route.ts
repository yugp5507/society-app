import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

// GET /api/directory/flats?buildingId=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const buildingId = searchParams.get('buildingId') ?? ''

    // Resolve societyId
    let societyId = ''
    if (session.user.role === 'SOCIETY_ADMIN') {
      const society = await prisma.society.findFirst({ where: { adminId: session.user.id } })
      if (society) societyId = society.id
    } else if (session.user.role === 'RESIDENT') {
      const apt = await prisma.apartment.findFirst({
        where: { residentId: session.user.id },
        include: { building: true },
      })
      if (apt) societyId = apt.building.societyId
    }

    if (!societyId) return NextResponse.json({ flats: [], buildings: [] })

    // Always return buildings list for the dropdown
    const buildings = await prisma.building.findMany({
      where: { societyId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })

    const buildingWhere: any = { societyId }
    if (buildingId) buildingWhere.id = buildingId

    const allBuildings = await prisma.building.findMany({
      where: buildingWhere,
      include: {
        apartments: {
          include: {
            resident: {
              select: { id: true, name: true, phone: true, isActive: true, createdAt: true },
            },
            familyMembers: { select: { id: true, name: true, relation: true } },
            vehicles: { select: { id: true, plateNumber: true, type: true, brand: true, color: true } },
            inviteTokens: {
              where: { used: false, expiresAt: { gt: new Date() } },
              select: { id: true },
            },
            maintenances: {
              orderBy: { createdAt: 'desc' },
              take: 3,
              select: { id: true, month: true, year: true, status: true, amount: true, dueDate: true },
            },
            gateEntries: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: { id: true, visitorName: true, visitorPhone: true, purpose: true, status: true, createdAt: true },
            },
          },
          orderBy: [{ floor: 'asc' }, { number: 'asc' }],
        },
      },
      orderBy: { name: 'asc' },
    })

    const isAdmin = session.user.role === 'SOCIETY_ADMIN' || session.user.role === 'SUB_ADMIN'

    const flats = allBuildings.flatMap(b =>
      b.apartments.map(a => {
        let status: 'OCCUPIED' | 'VACANT' | 'INVITED' = 'VACANT'
        if (a.resident) status = 'OCCUPIED'
        else if (a.inviteTokens.length > 0) status = 'INVITED'

        return {
          id: a.id,
          number: a.number,
          floor: a.floor,
          buildingId: b.id,
          buildingName: b.name,
          status,
          resident: a.resident
            ? {
                id: a.resident.id,
                name: a.resident.name,
                phone: isAdmin ? a.resident.phone : null,
                isActive: a.resident.isActive,
                movedInAt: a.resident.createdAt,
              }
            : null,
          familyMembers: a.familyMembers,
          vehicles: a.vehicles,
          familyCount: a.familyMembers.length,
          vehicleCount: a.vehicles.length,
          maintenances: isAdmin ? a.maintenances : [],
          recentVisitors: isAdmin ? a.gateEntries : [],
        }
      })
    )

    return NextResponse.json({ flats, buildings })
  } catch (error) {
    console.error('GET /api/directory/flats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
