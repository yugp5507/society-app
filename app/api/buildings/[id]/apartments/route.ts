import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: buildingId } = await params;

    const apartments = await prisma.apartment.findMany({
      where: { buildingId },
      include: {
        resident: { select: { id: true, name: true, phone: true } },
        inviteTokens: {
          where: { used: false },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: buildingId } = await params;
    const { number, floor, type, ownerName, ownerPhone } = await req.json();

    // Verify building belongs to admin's society
    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id },
    });

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const building = await prisma.building.findFirst({
      where: { id: buildingId, societyId: society.id },
    });

    if (!building) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 });
    }

    // Build apartment data - store type in number field for now (schema doesn't have type field)
    // We'll encode type in the number display: "101 (2BHK)"
    const apartmentNumber = type ? `${number} (${type})` : number;

    const apartment = await prisma.apartment.create({
      data: {
        number: apartmentNumber,
        floor: parseInt(floor) || 0,
        buildingId,
      },
      include: {
        resident: { select: { id: true, name: true, phone: true } },
        inviteTokens: {
          where: { used: false },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error("Error creating apartment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
