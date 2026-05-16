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
    const { maintenanceId } = body

    if (!maintenanceId) {
      return Response.json({ error: 'Maintenance ID required' }, { status: 400 })
    }

    const maintenance = await prisma.maintenance.findUnique({
      where: { id: maintenanceId },
      include: {
        user: true,
        society: true,
        apartment: true,
      }
    })

    if (!maintenance) {
      return Response.json({ error: 'Maintenance record not found' }, { status: 404 })
    }

    if (maintenance.status === 'PAID') {
      return Response.json({ error: 'Already paid' }, { status: 400 })
    }

    const totalAmount = maintenance.amount + (maintenance.penaltyAmount || 0)

    const hasRealKeys = 
      process.env.RAZORPAY_KEY_ID && 
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== 'your-razorpay-key' &&
      process.env.RAZORPAY_KEY_ID !== 'your-razorpay-key-id'

    if (!hasRealKeys) {
      const testOrderId = 'test_order_' + Date.now()
      
      await prisma.maintenance.update({
        where: { id: maintenanceId },
        data: { razorpayOrderId: testOrderId }
      })

      return Response.json({
        orderId: testOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        isTest: true,
        keyId: 'test_key',
        message: 'Test mode active. Add real Razorpay keys for live payments.'
      })
    }

    const Razorpay = (await import('razorpay')).default
    
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: 'maint_' + maintenanceId.slice(-8),
      notes: {
        maintenanceId: maintenanceId,
        residentName: maintenance.user.name,
        flatNumber: maintenance.apartment.number,
        month: maintenance.month.toString(),
        year: maintenance.year.toString(),
      }
    })

    await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: { razorpayOrderId: order.id }
    })

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error('Create order full error:', JSON.stringify(error))
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return Response.json(
      { error: 'Failed to create payment: ' + (error?.message || JSON.stringify(error)) },
      { status: 500 }
    )
  }
}