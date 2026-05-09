import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    let where: any = {};

    if (session.user.role === "RESIDENT") {
      where.userId = session.user.id;
    } else if (session.user.role === "SOCIETY_ADMIN") {
      const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
      if (society) where.societyId = society.id;
    }

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (status) where.status = status;

    const maintenanceBills = await prisma.maintenance.findMany({
      where,
      include: {
        user: { 
          select: { 
            name: true, 
            phone: true,
            apartments: { select: { number: true } }
          } 
        }
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" }
      ],
    });

    return NextResponse.json({ maintenance: maintenanceBills });
  } catch (error) {
    console.error("GET /api/maintenance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Generate bills for all residents in a society for a given month/year
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
    if (!society) return NextResponse.json({ error: "Society not found" }, { status: 404 });

    const { month, year, amount } = await req.json();

    if (!month || !year || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get all residents in the society
    const residents = await prisma.user.findMany({
      where: {
        role: "RESIDENT",
        apartments: {
          some: { building: { societyId: society.id } }
        }
      }
    });

    if (residents.length === 0) {
      return NextResponse.json({ error: "No residents found in the society" }, { status: 404 });
    }

    // Check existing bills to prevent duplicates
    const existingBills = await prisma.maintenance.findMany({
      where: {
        societyId: society.id,
        month: parseInt(month),
        year: parseInt(year)
      },
      select: { userId: true }
    });

    const existingUserIds = new Set(existingBills.map(b => b.userId));
    
    const newBillsData = residents
      .filter(r => !existingUserIds.has(r.id))
      .map(r => ({
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        status: "PENDING" as const,
        userId: r.id,
        societyId: society.id,
      }));

    if (newBillsData.length === 0) {
      return NextResponse.json({ error: "Bills already generated for all residents for this month" }, { status: 400 });
    }

    const result = await prisma.maintenance.createMany({
      data: newBillsData
    });

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${result.count} bills successfully` 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/maintenance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
