import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SECURITY_GUARD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, buildingId, apartmentId, purpose, vehicleNumber, duration } = await req.json();

    const building = await prisma.building.findUnique({ where: { id: buildingId } });
    if (!building) return NextResponse.json({ error: "Building not found" }, { status: 404 });

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

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
