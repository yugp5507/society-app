import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

// GET /api/directory/residents
// Society admin → all residents; resident → limited (no phones)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''
    const buildingId = searchParams.get('buildingId') ?? ''

    // Resolve societyId for this user
    let societyId = ''
    const role = session.user.role

    if (role === 'SOCIETY_ADMIN') {
      const society = await prisma.society.findFirst({ where: { adminId: session.user.id } })
      if (society) societyId = society.id
    } else if (role === 'RESIDENT') {
      const apt = await prisma.apartment.findFirst({
        where: { residentId: session.user.id },
        include: { building: true },
      })
      if (apt) societyId = apt.building.societyId
    } else if (role === 'SUB_ADMIN') {
      // sub-admin: check buildings they manage
      const building = await prisma.building.findFirst({ where: { subAdminId: session.user.id } })
      if (building) societyId = building.societyId
    }

    if (!societyId) return NextResponse.json({ residents: [] })

    const buildingWhere: any = { societyId }
    if (buildingId) buildingWhere.id = buildingId

    const buildings = await prisma.building.findMany({
      where: buildingWhere,
      include: {
        apartments: {
          where: { residentId: { not: null } },
          include: {
            resident: {
              include: {
                _count: { select: { complaints: true } },
              },
            },
            familyMembers: true,
            vehicles: true,
            maintenances: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { number: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    const isAdmin = role === 'SOCIETY_ADMIN' || role === 'SUB_ADMIN'

    const residents = buildings.flatMap(b =>
      b.apartments
        .filter(a => a.resident)
        .filter(a => {
          if (!q) return true
          const lq = q.toLowerCase()
          return (
            a.resident!.name.toLowerCase().includes(lq) ||
            a.number.toLowerCase().includes(lq) ||
            b.name.toLowerCase().includes(lq) ||
            (isAdmin && a.resident!.phone?.toLowerCase().includes(lq))
          )
        })
        .map(a => ({
          id: a.resident!.id,
          name: a.resident!.name,
          email: isAdmin ? a.resident!.email : undefined,
          phone: isAdmin ? a.resident!.phone : undefined,
          isActive: a.resident!.isActive,
          createdAt: a.resident!.createdAt,
          flat: {
            id: a.id,
            number: a.number,
            floor: a.floor,
          },
          building: { id: b.id, name: b.name },
          familyCount: a.familyMembers.length,
          vehicleCount: a.vehicles.length,
          lastMaintenanceStatus: a.maintenances[0]?.status ?? null,
          familyMembers: isAdmin ? a.familyMembers : [],
          vehicles: isAdmin
            ? a.vehicles.map(v => ({
                id: v.id,
                plateNumber: v.plateNumber,
                type: v.type,
                brand: v.brand,
                color: v.color,
              }))
            : [],
        }))
    )

    return NextResponse.json({ residents })
  } catch (error) {
    console.error('GET /api/directory/residents error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
