import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// PATCH /api/visitors/[id]/exit — mark visitor exit
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        status: "LEFT",
        exitTime: new Date(),
      },
    });

    return NextResponse.json({ visitor: updated });
  } catch (error) {
    console.error("PATCH /api/visitors/[id]/exit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
