import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find society where this user is admin
    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id }
    })

    if (!society) {
      return Response.json({ guards: [] })
    }

    const guardProfiles = await prisma.guardProfile.findMany({
      where: { societyId: society.id },
      include: { user: true }
    })

    const guards = guardProfiles.map(gp => ({
      id: gp.user.id,
      name: gp.user.name,
      email: gp.user.email,
      phone: gp.user.phone,
      gateAssignment: gp.gateAssignment,
      shift: gp.shift,
      isActive: gp.isActive,
      guardProfileId: gp.id,
    }))

    return Response.json({ guards })

  } catch (error) {
    console.error('GET guards error:', error)
    return Response.json({ error: 'Failed to fetch guards' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, password, gateAssignment, shift } = body

    if (!name || !email || !phone || !password) {
      return Response.json({ error: 'All fields required' }, { status: 400 })
    }

    // Find society for this admin
    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id }
    })

    if (!society) {
      return Response.json(
        { error: 'No society found. Please contact Super Admin.' }, 
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

    // Create user WITHOUT societyId
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'SECURITY_GUARD',
      }
    })

    // Create guard profile with societyId
    const guardProfile = await prisma.guardProfile.create({
      data: {
        userId: user.id,
        societyId: society.id,
        gateAssignment: gateAssignment || 'Main Gate',
        shift: shift || 'Morning (6 AM - 2 PM)',
        isActive: true,
      }
    })

    return Response.json({ 
      success: true,
      message: 'Guard created successfully',
      guard: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gateAssignment: guardProfile.gateAssignment,
        shift: guardProfile.shift,
        isActive: guardProfile.isActive,
      }
    })

  } catch (error) {
    console.error('POST guard error:', error)
    return Response.json({ error: 'Failed to create guard' }, { status: 500 })
  }
}
