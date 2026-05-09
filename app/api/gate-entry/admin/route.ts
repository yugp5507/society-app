import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id }
    });
    if (!society) return NextResponse.json({ entries: [] });

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let where: any = { societyId: society.id };

    if (dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateParam);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: "insensitive" } },
        { visitorPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    const entries = await prisma.gateEntry.findMany({
      where,
      include: { apartment: { include: { building: true } } },
      orderBy: { createdAt: "desc" }
    });

    const mapped = entries.map(e => ({
      id: e.id,
      name: e.visitorName,
      phone: e.visitorPhone,
      flatNumber: e.apartment?.number || "N/A",
      purpose: e.purpose,
      vehiclePlate: e.vehicleNumber,
      status: e.status,
      entryTime: e.entryTime || e.createdAt,
      exitTime: e.exitTime,
    }));

    return NextResponse.json({ entries: mapped });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
