import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// POST /api/qr/generate
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gateName } = await req.json();

    const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
    if (!society) return NextResponse.json({ error: "Society not found" }, { status: 404 });

    const qr = await prisma.gateQR.create({
      data: {
        gateName,
        societyId: society.id,
      },
    });

    return NextResponse.json({ qr });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
