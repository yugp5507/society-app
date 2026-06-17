import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

// GET /api/directory/vehicle-search?plate=GJ05AB1234
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const plate = (searchParams.get('plate') ?? '').toUpperCase().replace(/\s/g, '')

    if (!plate || plate.length < 3) {
      return NextResponse.json({ result: null })
    }

    // Resolve societyId
    let societyId = ''
    if (session.user.role === 'SOCIETY_ADMIN') {
      const society = await prisma.society.findFirst({ where: { adminId: session.user.id } })
      if (society) societyId = society.id
    } else if (session.user.role === 'SECURITY_GUARD') {
      const guard = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { guardProfile: true },
      })
      if (guard?.guardProfile?.societyId) societyId = guard.guardProfile.societyId
    } else if (session.user.role === 'RESIDENT') {
      const apt = await prisma.apartment.findFirst({
        where: { residentId: session.user.id },
        include: { building: true },
      })
      if (apt) societyId = apt.building.societyId
    }

    if (!societyId) return NextResponse.json({ result: null })

    // 1. Check resident vehicles
    const residentVehicle = await prisma.vehicle.findFirst({
      where: { plateNumber: { contains: plate } },
      include: {
        apartment: {
          include: {
            resident: { select: { id: true, name: true, phone: true } },
            building: { select: { id: true, name: true, societyId: true } },
          },
        },
      },
    })

    if (residentVehicle && residentVehicle.apartment.building.societyId === societyId) {
      return NextResponse.json({
        result: {
          category: 'RESIDENT',
          vehicle: {
            id: residentVehicle.id,
            plateNumber: residentVehicle.plateNumber,
            type: residentVehicle.type,
            brand: residentVehicle.brand,
            color: residentVehicle.color,
          },
          owner: residentVehicle.apartment.resident,
          flat: { number: residentVehicle.apartment.number },
          building: { name: residentVehicle.apartment.building.name },
        },
      })
    }

    // 2. Check visitor gate entries (vehicle history)
    const visitorEntries = await prisma.gateEntry.findMany({
      where: {
        societyId,
        vehicleNumber: { contains: plate },
      },
      include: {
        apartment: {
          select: {
            number: true,
            building: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    if (visitorEntries.length > 0) {
      const latest = visitorEntries[0]
      return NextResponse.json({
        result: {
          category: 'VISITOR',
          vehicleNumber: plate,
          visitorName: latest.visitorName,
          visitorPhone: latest.visitorPhone,
          lastVisitedFlat: latest.apartment?.number ?? '—',
          lastVisitedBuilding: latest.apartment?.building?.name ?? '—',
          lastVisitDate: latest.createdAt,
          lastPurpose: latest.purpose,
          totalVisits: visitorEntries.length,
          recentVisits: visitorEntries.map(e => ({
            id: e.id,
            date: e.createdAt,
            flat: e.apartment?.number ?? '—',
            purpose: e.purpose,
            status: e.status,
          })),
        },
      })
    }

    // 3. Unknown vehicle
    return NextResponse.json({
      result: {
        category: 'UNKNOWN',
        vehicleNumber: plate,
      },
    })
  } catch (error) {
    console.error('GET /api/directory/vehicle-search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
