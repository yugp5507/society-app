import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone, gateAssignment, shift, isActive } = await req.json();

    const guard = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          name,
          email,
          phone,
        },
      });

      await tx.guardProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          societyId: (await tx.society.findFirst({ where: { adminId: session.user.id } }))?.id || "",
          gateAssignment,
          shift,
          isActive,
        },
        update: {
          gateAssignment,
          shift,
          isActive,
        },
      });

      return user;
    });

    return NextResponse.json({ guard });
  } catch (error) {
    console.error("PUT guard error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
