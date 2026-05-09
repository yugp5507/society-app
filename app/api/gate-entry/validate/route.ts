import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 });

    const qr = await prisma.gateQR.findUnique({
      where: { token },
      include: { society: true },
    });

    if (!qr) return NextResponse.json({ error: "Invalid QR Code" }, { status: 400 });
    if (!qr.isActive) return NextResponse.json({ error: "Gate is currently closed" }, { status: 400 });

    const buildings = await prisma.building.findMany({
      where: { societyId: qr.societyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ gate: qr, buildings });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
