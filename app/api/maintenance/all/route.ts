import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id }
    });

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const buildingId = searchParams.get("buildingId");

    const where: any = {
      societyId: society.id,
    };

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (status) where.status = status;
    if (buildingId) {
      where.apartment = {
        buildingId: buildingId
      };
    }

    const records = await prisma.maintenance.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        apartment: {
          include: {
            building: true
          }
        }
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ maintenance: records });
  } catch (error) {
    console.error("GET /api/maintenance/all error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
