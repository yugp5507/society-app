import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// GET /api/amenities?societyId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const societyId = searchParams.get("societyId");
    const activeOnly = searchParams.get("active") === "true";

    let where: any = {};
    if (societyId) {
      where.societyId = societyId;
    } else {
      // Derive from session
      const session = await getServerSession(authOptions);
      if (session?.user?.role === "SOCIETY_ADMIN") {
        const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
        if (society) where.societyId = society.id;
      } else if (session?.user?.role === "RESIDENT") {
        const apt = await prisma.apartment.findFirst({
          where: { residentId: session.user.id },
          include: { building: true },
        });
        if (apt) where.societyId = apt.building.societyId;
      }
    }

    if (activeOnly) where.status = "ACTIVE";

    const amenities = await prisma.amenity.findMany({
      where,
      include: { _count: { select: { bookings: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ amenities });
  } catch (error) {
    console.error("GET /api/amenities error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/amenities — admin creates amenity
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
    if (!society) return NextResponse.json({ error: "Society not found" }, { status: 404 });

    const body = await req.json();
    const {
      name, description, capacity, location, availableDays,
      openTime, closeTime, slotDuration, advanceBookDays,
      isPaid, pricePerSlot, status,
    } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const amenity = await prisma.amenity.create({
      data: {
        name,
        description: description || null,
        capacity: parseInt(capacity) || 10,
        location: location || null,
        availableDays: Array.isArray(availableDays) ? availableDays.join(",") : (availableDays || "Mon,Tue,Wed,Thu,Fri,Sat,Sun"),
        openTime: openTime || "06:00",
        closeTime: closeTime || "22:00",
        slotDuration: parseInt(slotDuration) || 60,
        advanceBookDays: parseInt(advanceBookDays) || 7,
        isPaid: !!isPaid,
        pricePerSlot: isPaid && pricePerSlot ? parseFloat(pricePerSlot) : null,
        status: status || "ACTIVE",
        societyId: society.id,
      },
    });

    return NextResponse.json({ amenity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/amenities error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
