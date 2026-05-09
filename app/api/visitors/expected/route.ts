import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// GET /api/visitors/expected — resident's pre-approved visitors
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const societyId = searchParams.get("societyId");
    const today = searchParams.get("today");

    let where: any = { isExpected: true };

    if (session.user.role === "RESIDENT") {
      where.userId = session.user.id;
    } else if (session.user.role === "SOCIETY_ADMIN") {
      const society = await prisma.society.findFirst({
        where: { adminId: session.user.id },
      });
      if (society) where.societyId = society.id;
    } else if (societyId) {
      where.societyId = societyId;
    }

    if (today === "true") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      where.expectedDate = { gte: start, lte: end };
      where.status = "APPROVED"; // Only pending arrival
    }

    const expected = await prisma.visitor.findMany({
      where,
      orderBy: { expectedDate: "desc" },
      take: 100,
    });

    return NextResponse.json({ expected });
  } catch (error) {
    console.error("GET /api/visitors/expected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/visitors/expected — resident pre-approves a visitor
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "RESIDENT") {
      return NextResponse.json({ error: "Only residents can pre-approve visitors" }, { status: 403 });
    }

    const { name, phone, vehiclePlate, purpose, expectedDate, expectedTime, apartmentNumber } = await req.json();

    if (!name || !purpose || !expectedDate || !apartmentNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get resident's society
    const apartment = await prisma.apartment.findFirst({
      where: { residentId: session.user.id },
      include: { building: true },
    });

    if (!apartment) {
      return NextResponse.json({ error: "No apartment linked to your account" }, { status: 400 });
    }

    // Combine expectedDate and expectedTime into a single Date object if expectedTime exists
    let combinedDate = new Date(expectedDate);
    if (expectedTime) {
      const [hours, minutes] = expectedTime.split(':');
      combinedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }

    const created = await prisma.visitor.create({
      data: {
        name,
        phone: phone || null,
        vehiclePlate: vehiclePlate || null,
        purpose,
        flatNumber: apartmentNumber,
        status: "APPROVED",
        isExpected: true,
        expectedDate: combinedDate,
        userId: session.user.id,
        societyId: apartment.building.societyId,
        apartmentId: apartment.id,
        approvedById: session.user.id,
      },
    });

    return NextResponse.json({ expectedVisitor: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/visitors/expected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
