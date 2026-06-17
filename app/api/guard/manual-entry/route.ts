import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { sendNotification } from "@/src/lib/notify";

// Guard adds a manual entry (already inside — no approval needed)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SECURITY_GUARD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, buildingId, apartmentId, purpose, vehicleNumber, duration } = await req.json();

    const building = await prisma.building.findUnique({ where: { id: buildingId } });
    if (!building) return NextResponse.json({ error: "Building not found" }, { status: 404 });

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: { residentId: true, number: true },
    });

    const entry = await prisma.gateEntry.create({
      data: {
        visitorName: name,
        visitorPhone: phone,
        purpose,
        vehicleNumber: vehicleNumber || null,
        duration,
        entryMethod: "MANUAL",
        status: "INSIDE",
        entryTime: new Date(),
        societyId: building.societyId,
        apartmentId,
        guardId: session.user.id
      }
    });

    // Notify the resident about the manual entry
    if (apartment?.residentId) {
      sendNotification({
        userId: apartment.residentId,
        title: '🚪 Visitor Entered',
        message: `${name} has been allowed entry by the guard to visit Flat ${apartment.number}. Purpose: ${purpose}.`,
        type: 'VISITOR',
        link: '/resident/visitors',
      });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
