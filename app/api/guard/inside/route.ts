import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SECURITY_GUARD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guard = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!guard?.societyId) return NextResponse.json({ entries: [] });

    const entries = await prisma.gateEntry.findMany({
      where: { status: "INSIDE", societyId: guard.societyId },
      include: { apartment: { include: { building: true } } },
      orderBy: { entryTime: "desc" }
    });

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
