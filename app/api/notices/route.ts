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

    let societyId = "";

    if (session.user.role === "SOCIETY_ADMIN") {
      const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
      if (society) societyId = society.id;
    } else if (session.user.role === "RESIDENT") {
      const apt = await prisma.apartment.findFirst({
        where: { residentId: session.user.id },
        include: { building: true },
      });
      if (apt) societyId = apt.building.societyId;
    }

    if (!societyId) {
      return NextResponse.json({ notices: [] });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = { societyId };
    if (category) where.category = category;

    const notices = await prisma.notice.findMany({
      where,
      include: {
        creator: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notices });
  } catch (error) {
    console.error("GET /api/notices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
    if (!society) return NextResponse.json({ error: "Society not found" }, { status: 404 });

    const { title, content, category } = await req.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category,
        societyId: society.id,
        createdBy: session.user.id,
      },
      include: {
        creator: { select: { name: true } }
      }
    });

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
