import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// GET /api/visitors — role-scoped
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const societyId = searchParams.get("societyId");

    // Build date filter
    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateParam);
      end.setHours(23, 59, 59, 999);
      dateFilter = { gte: start, lte: end };
    } else if (searchParams.get("today") === "true") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      dateFilter = { gte: start, lte: end };
    }

    const role = session.user.role;
    let where: any = {};

    if (role === "RESIDENT") {
      // Resident sees visitors for their flat(s)
      const apartment = await prisma.apartment.findFirst({
        where: { residentId: session.user.id },
      });
      if (!apartment) return NextResponse.json({ visitors: [] });
      where.flatNumber = apartment.number;
      // Get their society
      const building = await prisma.building.findUnique({
        where: { id: apartment.buildingId },
      });
      if (building) where.societyId = building.societyId;
    } else if (role === "SOCIETY_ADMIN") {
      const society = await prisma.society.findFirst({
        where: { adminId: session.user.id },
      });
      if (!society) return NextResponse.json({ visitors: [] });
      where.societyId = society.id;
    } else if (role === "SUPER_ADMIN") {
      if (societyId) where.societyId = societyId;
    }
    // Gate / SUB_ADMIN uses societyId from query
    else {
      if (societyId) where.societyId = societyId;
    }

    if (status) where.status = status;
    if (dateFilter) where.entryTime = dateFilter;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { flatNumber: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const visitors = await prisma.visitor.findMany({
      where,
      orderBy: { entryTime: "desc" },
      take: 200,
    });

    return NextResponse.json({ visitors });
  } catch (error) {
    console.error("GET /api/visitors error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/visitors — log new visitor entry (gate/guard)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, vehiclePlate, purpose, flatNumber, societyId, status = "INSIDE" } = body;

    if (!name || !purpose || !flatNumber || !societyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate society exists
    const society = await prisma.society.findUnique({ where: { id: societyId } });
    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    // Try to find apartment and its resident
    const apartment = await prisma.apartment.findFirst({
      where: {
        number: { equals: flatNumber, mode: "insensitive" },
        building: { societyId },
      },
      include: { resident: true },
    });

    const userId = apartment?.residentId ?? society.adminId;

    const visitor = await prisma.visitor.create({
      data: {
        name,
        phone: phone || null,
        vehiclePlate: vehiclePlate || null,
        purpose,
        flatNumber,
        status: status as any,
        userId,
        societyId,
        apartmentId: apartment?.id ?? null,
      },
    });

    return NextResponse.json({ visitor }, { status: 201 });
  } catch (error) {
    console.error("POST /api/visitors error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
