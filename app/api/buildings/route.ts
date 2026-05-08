import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

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
        apartments: true,
      },
    });

    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    console.error("Error creating building:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
