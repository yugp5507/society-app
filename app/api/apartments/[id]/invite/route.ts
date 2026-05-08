import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import crypto from "crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: apartmentId } = await params;

    // Verify apartment belongs to admin's society
    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id },
    });

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const apartment = await prisma.apartment.findFirst({
      where: { 
        id: apartmentId,
        building: { societyId: society.id }
      },
    });

    if (!apartment) {
      return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
    }

    // Invalidate existing unused tokens for this apartment
    await prisma.inviteToken.updateMany({
      where: { apartmentId, used: false },
      data: { used: true },
    });

    // Generate new unique token (URL-safe base64)
    const tokenStr = crypto.randomBytes(32).toString('base64url');
    // Expire in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const inviteToken = await prisma.inviteToken.create({
      data: {
        token: tokenStr,
        apartmentId,
        expiresAt,
      },
    });

    // Generate the full link (we don't know the exact host here, so we just return the token and let client build the URL, or we can use headers)
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const link = `${protocol}://${host}/join?token=${tokenStr}`;

    return NextResponse.json({ link, token: inviteToken }, { status: 201 });
  } catch (error) {
    console.error("Error generating invite token:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
