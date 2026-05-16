import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { society, admin } = await req.json();

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: admin.email } });
    if (existingUser) {
      return NextResponse.json({ error: "Admin email already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(admin.password, 12);

    // Create Admin User and Society in a transaction
    // Wait, prisma nested create allows creating society and its admin?
    // Since society depends on adminId, we can create User and nested create Society!
    
    const newUser = await prisma.user.create({
      data: {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        password: hashedPassword,
        role: "SOCIETY_ADMIN",
        adminSociety: {
          create: {
            name: society.name,
            address: society.address,
            city: society.city,
          },
        },
      },
      include: {
        adminSociety: {
          include: {
            admin: { select: { name: true, email: true } },
            buildings: { select: { id: true } },
          },
        },
      },
    });

    const createdSociety = newUser.adminSociety;

    return NextResponse.json(createdSociety, { status: 201 });
  } catch (error) {
    console.error("Error creating society and admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
