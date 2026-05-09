import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// Public list of societies (for gate selector — no auth required)
export async function GET() {
  try {
    const societies = await prisma.society.findMany({
      select: { id: true, name: true, city: true, address: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ societies });
  } catch (error) {
    console.error("GET /api/societies/list error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
