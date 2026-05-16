import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// GET /api/bookings — role-scoped bookings list
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const month = searchParams.get("month"); // YYYY-MM

    let where: any = {};

    if (session.user.role === "RESIDENT") {
      where.userId = session.user.id;
    } else if (session.user.role === "SOCIETY_ADMIN") {
      const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
      if (society) where.amenity = { societyId: society.id };
    }

    if (status) where.status = status;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lt: new Date(y, m, 1),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        amenity: { select: { id: true, name: true, location: true, isPaid: true, pricePerSlot: true } },
        user: { select: { id: true, name: true, email: true, phone: true,
          apartment: { select: { number: true } } } },
      },
      orderBy: { date: "desc" },
      take: 200,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/bookings — resident creates booking
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amenityId, date, startTime, endTime, purpose, guestCount } = await req.json();

    if (!amenityId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        amenityId,
        date: new Date(date),
        startTime,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (conflict) {
      return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });
    }

    const amenity = await prisma.amenity.findUnique({ where: { id: amenityId } });
    if (!amenity) return NextResponse.json({ error: "Amenity not found" }, { status: 404 });

    const booking = await prisma.booking.create({
      data: {
        amenityId,
        userId: session.user.id,
        date: new Date(date),
        startTime,
        endTime,
        purpose: purpose || null,
        guestCount: parseInt(guestCount) || 1,
        status: "PENDING",
        paymentStatus: amenity.isPaid ? "PENDING" : "NOT_REQUIRED",
        amountPaid: null,
      },
      include: {
        amenity: { select: { name: true, location: true, isPaid: true, pricePerSlot: true } },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
