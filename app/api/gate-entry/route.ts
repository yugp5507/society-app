import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { societyId, apartmentId, name, phone, purpose, vehicleNumber, duration, method } = await req.json();

    const entry = await prisma.gateEntry.create({
      data: {
        visitorName: name,
        visitorPhone: phone,
        purpose,
        vehicleNumber: vehicleNumber || null,
        duration,
        entryMethod: method || "QR_SCAN",
        status: "PENDING",
        societyId,
        apartmentId,
      }
    });

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
