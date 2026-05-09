import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// GET /api/qr
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
    if (!society) return NextResponse.json({ qrs: [] });

    const qrs = await prisma.gateQR.findMany({
      where: { societyId: society.id },
      include: { society: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ qrs });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
