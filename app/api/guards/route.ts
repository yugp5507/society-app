import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/guards
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
    if (!society) return NextResponse.json({ guards: [] });

    // Guards are users with role SECURITY_GUARD and maybe we need to link them to society.
    // For now we can fetch users by role, and assume they are created by this admin.
    // To properly scope, we might need a custom field or just fetch all SECURITY_GUARDs for now.
    // Let's use a convention: their name includes society ID or similar? 
    // Wait, the User model doesn't link directly to society except for specific roles.
    // For this prototype, let's fetch all SECURITY_GUARDs.
    // Or, we can just return users with role SECURITY_GUARD.
    
    // Actually, we can just fetch users with SECURITY_GUARD role for now.
    const guards = await prisma.user.findMany({
      where: { role: "SECURITY_GUARD" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ guards });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// POST /api/guards
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const society = await prisma.society.findFirst({ where: { adminId: session.user.id } });
    if (!society) return NextResponse.json({ error: "Society not found" }, { status: 404 });

    const { name, email, phone, password, gate, shift } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const guard = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "SECURITY_GUARD",
        societyId: society.id,
      },
    });

    return NextResponse.json({ guard });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
