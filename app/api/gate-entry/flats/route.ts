import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get("buildingId");

    if (!buildingId) return NextResponse.json({ flats: [] });

    const flats = await prisma.apartment.findMany({
      where: { buildingId },
      select: { id: true, number: true },
      orderBy: { number: "asc" }
    });

    return NextResponse.json({ flats });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
