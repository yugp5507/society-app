import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const bill = await prisma.maintenance.findUnique({ where: { id } });
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });

    // Both Admin (manual override) and Resident (post-payment) can update status to PAID
    if (session.user.role === "RESIDENT" && bill.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(status === "PAID" && !bill.paidAt && { paidAt: new Date() }),
      },
    });

    return NextResponse.json({ maintenance: updated });
  } catch (error) {
    console.error("PATCH /api/maintenance/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.maintenance.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/maintenance/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
