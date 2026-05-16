import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const maintenanceRecords = await prisma.maintenance.findMany({
      where,
      include: {
        apartment: {
          include: {
            building: true
          }
        }
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" }
      ],
    });

    return NextResponse.json({ maintenance: maintenanceRecords });
  } catch (error) {
    console.error("GET /api/maintenance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
