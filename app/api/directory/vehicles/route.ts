import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

// GET /api/directory/vehicles?q=plate&buildingId=xxx&type=CAR
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').toUpperCase()
    const buildingId = searchParams.get('buildingId') ?? ''
    const vehicleType = searchParams.get('type') ?? ''

    // Resolve society
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

    if (!societyId) return NextResponse.json({ vehicles: [] })

    const buildingFilter: any = { societyId }
    if (buildingId) buildingFilter.id = buildingId

    const buildings = await prisma.building.findMany({
      where: buildingFilter,
      include: {
        apartments: {
          include: {
            vehicles: {
              where: {
                ...(q ? { plateNumber: { contains: q } } : {}),
                ...(vehicleType ? { type: vehicleType } : {}),
              },
            },
            resident: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    })

    const vehicles = buildings.flatMap(b =>
      b.apartments.flatMap(a =>
        a.vehicles.map(v => ({
          id: v.id,
          plateNumber: v.plateNumber,
          type: v.type,
          brand: v.brand,
          color: v.color,
          owner: a.resident
            ? {
                id: a.resident.id,
                name: a.resident.name,
                phone: a.resident.phone,
              }
            : null,
          flat: { number: a.number, floor: a.floor },
          building: { id: b.id, name: b.name },
        }))
      )
    )

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('GET /api/directory/vehicles error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
