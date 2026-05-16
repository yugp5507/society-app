import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find society for this admin
    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id }
    })

    if (!society) {
      return Response.json({ subAdmins: [] })
    }

    // Get all sub admins for this society
    // We can find them by the buildings they manage or their guard profile linking them to this society
    const subAdmins = await prisma.user.findMany({
      where: { 
        role: 'SUB_ADMIN',
        OR: [
          {
            guardProfile: {
              societyId: society.id
            }
          },
          {
            // Fallback: search by buildings managed by them in this society
            id: {
              in: (await prisma.building.findMany({
                where: { societyId: society.id, subAdminId: { not: null } },
                select: { subAdminId: true }
              })).map(b => b.subAdminId as string)
            }
          }
        ]
      },
      include: {
        guardProfile: true,
        // In the UI, it's called subAdminBuildings (which is an alias for the buildings they manage)
        // But the relation in Prisma might be different. Let's check the schema again.
      }
    })

    // Enrich with buildings
    const buildings = await prisma.building.findMany({
      where: { societyId: society.id }
    })

    const enrichedSubAdmins = subAdmins.map(admin => ({
      ...admin,
      subAdminBuildings: buildings.filter(b => b.subAdminId === admin.id)
    }))

    return Response.json({ subAdmins: enrichedSubAdmins })

  } catch (error) {
    console.error('GET sub-admins error:', error)
    return Response.json(
      { error: 'Failed to fetch sub admins' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, password, buildingId } = body

    if (!name || !email || !phone || !password) {
      return Response.json(
        { error: 'Name, email, phone and password are required' }, 
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return Response.json(
        { error: 'Email already registered' }, 
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create sub admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'SUB_ADMIN',
      }
    })

    // Link to building if provided
    if (buildingId) {
      await prisma.building.update({
        where: { id: buildingId },
        data: { subAdminId: user.id }
      })
    }

    // Create a GuardProfile to link them to the society (as requested in their GET logic)
    await prisma.guardProfile.create({
      data: {
        userId: user.id,
        societyId: society.id,
      }
    })

    // Fetch the building info for the response to update UI
    const managedBuildings = buildingId 
      ? await prisma.building.findMany({ where: { id: buildingId } })
      : []

    return Response.json({
      success: true,
      message: 'Sub admin created successfully',
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      subAdminBuildings: managedBuildings
    })

  } catch (error) {
    console.error('POST sub-admin error:', error)
    return Response.json(
      { error: 'Failed to create sub admin' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const buildingId = searchParams.get('buildingId')

    if (!id) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Unlink from building
    if (buildingId) {
      await prisma.building.update({
        where: { id: buildingId },
        data: { subAdminId: null }
      })
    }

    // Delete the user and their profiles
    // We use deleteMany just in case, but findUnique first is safer for cascade/relations check if needed
    // However, schema says GuardProfile has onDelete: Cascade
    await prisma.user.delete({
      where: { id }
    })

    return Response.json({ success: true, message: 'Sub admin removed successfully' })

  } catch (error) {
    console.error('DELETE sub-admin error:', error)
    return Response.json(
      { error: 'Failed to delete sub admin' }, 
      { status: 500 }
    )
  }
}
