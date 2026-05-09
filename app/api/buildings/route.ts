import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SOCIETY_ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const societyId = searchParams.get("societyId");

    const society = societyId
      ? await prisma.society.findUnique({ where: { id: societyId } })
      : await prisma.society.findFirst({ where: { adminId: session.user.id } });

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const buildings = await prisma.building.findMany({
      where: { societyId: society.id },
      include: {
        apartments: {
          include: {
            resident: { select: { id: true, name: true, phone: true } },
            inviteTokens: {
              where: { used: false },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: [{ floor: "asc" }, { number: "asc" }],
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(buildings);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, buildingType, totalFloors, totalApartments } = await req.json();

    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id },
    });

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const building = await prisma.building.create({
      data: {
        name,
        societyId: society.id,
      },
      include: {
        apartments: {
          include: {
            resident: { select: { id: true, name: true, phone: true } },
            inviteTokens: {
              where: { used: false },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    console.error("Error creating building:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
