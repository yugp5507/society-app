import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

// GET /api/directory/search?q=term
// Universal search: residents, vehicles, visitors, flats
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() ?? ''
    if (q.length < 2) return NextResponse.json({ residents: [], vehicles: [], visitors: [], flats: [] })

    const lq = q.toLowerCase()

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

    if (!societyId) return NextResponse.json({ residents: [], vehicles: [], visitors: [], flats: [] })

    // Fetch buildings in society to scope queries
    const buildingIds = (
      await prisma.building.findMany({
        where: { societyId },
        select: { id: true },
      })
    ).map(b => b.id)

    if (buildingIds.length === 0) {
      return NextResponse.json({ residents: [], vehicles: [], visitors: [], flats: [] })
    }

    // Run all searches in parallel
    const [residents, vehicles, visitors, flats] = await Promise.all([
      // Residents
      prisma.apartment.findMany({
        where: {
          buildingId: { in: buildingIds },
          residentId: { not: null },
          OR: [
            { resident: { name: { contains: lq, mode: 'insensitive' } } },
            { resident: { phone: { contains: lq } } },
            { resident: { email: { contains: lq, mode: 'insensitive' } } },
            { number: { contains: lq, mode: 'insensitive' } },
          ],
        },
        include: {
          resident: { select: { id: true, name: true, phone: true, email: true } },
          building: { select: { id: true, name: true } },
        },
        take: 8,
      }),

      // Vehicles (resident)
      prisma.vehicle.findMany({
        where: {
          apartment: { buildingId: { in: buildingIds } },
          OR: [
            { plateNumber: { contains: q.toUpperCase() } },
            { brand: { contains: lq, mode: 'insensitive' } },
            { type: { contains: lq, mode: 'insensitive' } },
          ],
        },
        include: {
          apartment: {
            select: {
              number: true,
              resident: { select: { id: true, name: true, phone: true } },
              building: { select: { name: true } },
            },
          },
        },
        take: 8,
      }),

      // Visitors (gate entries)
      prisma.gateEntry.findMany({
        where: {
          societyId,
          OR: [
            { visitorName: { contains: lq, mode: 'insensitive' } },
            { visitorPhone: { contains: lq } },
            { vehicleNumber: { contains: q.toUpperCase() } },
            { apartment: { number: { contains: lq, mode: 'insensitive' } } },
          ],
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
        take: 8,
      }),

      // Flats
      prisma.apartment.findMany({
        where: {
          buildingId: { in: buildingIds },
          OR: [
            { number: { contains: lq, mode: 'insensitive' } },
            { resident: { name: { contains: lq, mode: 'insensitive' } } },
            { building: { name: { contains: lq, mode: 'insensitive' } } },
          ],
        },
        include: {
          resident: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
          inviteTokens: {
            where: { used: false, expiresAt: { gt: new Date() } },
            select: { id: true },
          },
        },
        take: 8,
      }),
    ])

    return NextResponse.json({
      residents: residents.map(a => ({
        id: a.resident!.id,
        name: a.resident!.name,
        phone: a.resident!.phone,
        email: a.resident!.email,
        flat: { number: a.number },
        building: a.building,
      })),
      vehicles: vehicles.map(v => ({
        id: v.id,
        plateNumber: v.plateNumber,
        type: v.type,
        brand: v.brand,
        color: v.color,
        owner: v.apartment.resident,
        flat: { number: v.apartment.number },
        building: { name: v.apartment.building.name },
        category: 'RESIDENT',
      })),
      visitors: visitors.map(v => ({
        id: v.id,
        name: v.visitorName,
        phone: v.visitorPhone,
        vehicleNumber: v.vehicleNumber,
        purpose: v.purpose,
        status: v.status,
        createdAt: v.createdAt,
        flat: { number: v.apartment?.number ?? '—' },
        building: { name: v.apartment?.building?.name ?? '—' },
      })),
      flats: flats.map(a => {
        let status: string = 'VACANT'
        if (a.resident) status = 'OCCUPIED'
        else if (a.inviteTokens.length > 0) status = 'INVITED'
        return {
          id: a.id,
          number: a.number,
          floor: a.floor,
          status,
          resident: a.resident,
          building: a.building,
        }
      }),
    })
  } catch (error) {
    console.error('GET /api/directory/search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
