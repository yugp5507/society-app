import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SECURITY_GUARD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guard = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { guardProfile: true }
    });
    if (!guard?.guardProfile?.societyId) return NextResponse.json({ buildings: [] });

    const buildings = await prisma.building.findMany({
      where: { societyId: guard.guardProfile.societyId },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ buildings });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
