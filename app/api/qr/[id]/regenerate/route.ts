import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import crypto from "crypto";

// PATCH /api/qr/[id]/regenerate
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const qr = await prisma.gateQR.update({
      where: { id },
      data: { token: crypto.randomUUID() },
    });

    return NextResponse.json({ qr });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
