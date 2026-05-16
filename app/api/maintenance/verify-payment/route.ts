import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { 
      maintenanceId, 
      razorpayPaymentId, 
      razorpayOrderId, 
      razorpaySignature 
    } = await req.json();

    if (!maintenanceId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update maintenance record
    const updatedMaintenance = await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpayPaymentId,
        paidAt: new Date(),
        // For receipt generation, we could generate a receipt URL here or just point to our route
        receiptUrl: `/receipt/${maintenanceId}`
      }
    });

    return NextResponse.json({ success: true, maintenance: updatedMaintenance });

  } catch (error) {
    console.error("POST /api/maintenance/verify-payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
