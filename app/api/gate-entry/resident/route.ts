import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "RESIDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apartment = await prisma.apartment.findFirst({
      where: { residentId: session.user.id }
    });
    if (!apartment) return NextResponse.json({ entries: [] });

    const entries = await prisma.gateEntry.findMany({
      where: { apartmentId: apartment.id },
      orderBy: { createdAt: "desc" }
    });

    const mapped = entries.map(e => ({
      id: e.id,
      name: e.visitorName,
      phone: e.visitorPhone,
      purpose: e.purpose,
      vehiclePlate: e.vehicleNumber,
      status: e.status,
      entryTime: e.entryTime || e.createdAt,
      exitTime: e.exitTime,
      isExpected: e.entryMethod === "PRE_APPROVED",
    }));

    return NextResponse.json({ entries: mapped });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
