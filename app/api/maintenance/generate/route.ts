import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { month, year, amount, dueDate, penaltyAmount } = body

    if (!month || !year || !amount || !dueDate) {
      return Response.json(
        { error: 'Month, year, amount and due date are required' },
        { status: 400 }
      )
    }

    // Find society for this admin
    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id }
    })

    if (!society) {
      return Response.json(
        { error: 'No society found for this admin' },
        { status: 400 }
      )
    }

    // Get all occupied apartments in this society
    const buildings = await prisma.building.findMany({
      where: { societyId: society.id },
      include: {
        apartments: {
          where: {
            residentId: { not: null }
          },
          include: {
            resident: true
          }
        }
      }
    })

    // Collect all occupied apartments
    const occupiedApartments = []
    for (const building of buildings) {
      for (const apartment of building.apartments) {
        if (apartment.residentId && apartment.resident) {
          occupiedApartments.push(apartment)
        }
      }
    }

    if (occupiedApartments.length === 0) {
      return Response.json(
        { error: 'No occupied apartments found in this society' },
        { status: 400 }
      )
    }

    // Convert month name to number if needed
    const monthNames = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ]
    
    const monthNumber = typeof month === 'string' && isNaN(Number(month))
      ? monthNames.indexOf(month) + 1
      : Number(month)

    const yearNumber = Number(year)

    console.log('Month number:', monthNumber)
    console.log('Year number:', yearNumber)
    console.log('Type of month:', typeof monthNumber)
    console.log('Type of year:', typeof yearNumber)

    // Generate maintenance records
    let created = 0
    let skipped = 0

    for (const apartment of occupiedApartments) {
      // Check if already exists for this apartment/month/year
      const existing = await prisma.maintenance.findFirst({
        where: {
          AND: [
            { apartmentId: apartment.id },
            { month: monthNumber },
            { year: yearNumber },
          ]
        }
      })

      if (existing) {
        skipped++
        continue
      }

      // Create maintenance record
      await prisma.maintenance.create({
        data: {
          amount: parseFloat(amount),
          month: monthNumber,
          year: yearNumber,
          dueDate: new Date(dueDate),
          status: 'PENDING',
          userId: apartment.residentId!,
          societyId: society.id,
          apartmentId: apartment.id,
          penaltyAmount: penaltyAmount 
            ? parseFloat(penaltyAmount) 
            : 0,
        }
      })
      created++
    }

    return Response.json({
      success: true,
      message: `Generated ${created} maintenance bills. ${skipped} already existed.`,
      created,
      skipped,
      total: occupiedApartments.length,
    })

  } catch (error: any) {
    console.error('Generate maintenance error:', error)
    return Response.json(
      { error: 'Failed to generate maintenance bills: ' + error.message },
      { status: 500 }
    )
  }
}
