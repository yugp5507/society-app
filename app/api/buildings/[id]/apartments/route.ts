import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { number, floor } = await req.json();
    const { id: buildingId } = await params;

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

    const apartment = await prisma.apartment.create({
      data: {
        number,
        floor,
        buildingId,
      },
      include: {
        resident: { select: { id: true, name: true, phone: true } },
        inviteTokens: true,
      },
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error("Error creating apartment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
