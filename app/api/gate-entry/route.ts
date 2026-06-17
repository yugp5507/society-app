import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendNotification } from "@/src/lib/notify";

// Called by the QR gate kiosk when a visitor scans to enter
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
      },
      include: {
        apartment: { select: { residentId: true, number: true } },
      },
    });

    // Notify the resident that a visitor has arrived at the gate
    if (entry.apartment?.residentId) {
      sendNotification({
        userId: entry.apartment.residentId,
        title: '🚪 Visitor at Gate',
        message: `${name} is at the gate to visit you (Flat ${entry.apartment.number}). Purpose: ${purpose}.`,
        type: 'VISITOR',
        link: '/resident/visitors',
      });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
