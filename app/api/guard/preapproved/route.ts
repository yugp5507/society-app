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

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const guard = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!guard?.societyId) return NextResponse.json({ entries: [] });

    // Using Visitor model since residents create pre-approved visitors there
    const entries = await prisma.visitor.findMany({
      where: { 
        isExpected: true,
        status: "APPROVED",
        expectedDate: { gte: start, lte: end },
        societyId: guard.societyId
      },
      include: { apartment: { include: { building: true } } },
      orderBy: { expectedDate: "asc" }
    });

    // Map to match GateEntry format for dashboard
    const mapped = entries.map(e => ({
      id: e.id,
      visitorName: e.name,
      visitorPhone: e.phone,
      purpose: e.purpose,
      apartment: e.apartment,
      isVisitorModel: true
    }));

    return NextResponse.json({ entries: mapped });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
