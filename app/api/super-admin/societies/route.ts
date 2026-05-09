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

    const body = await req.json();
    const { society, adminMode, newAdmin, existingUserId } = body;

    let adminId: string;
    let adminCredentials: { name: string; email: string; password?: string } | null = null;

    if (adminMode === "existing") {
      // Use existing user
      const existingUser = await prisma.user.findUnique({ where: { id: existingUserId } });
      if (!existingUser) {
        return NextResponse.json({ error: "Selected user not found" }, { status: 404 });
      }
      // Update role to SOCIETY_ADMIN
      await prisma.user.update({
        where: { id: existingUserId },
        data: { role: "SOCIETY_ADMIN" },
      });
      adminId = existingUserId;
      adminCredentials = { name: existingUser.name, email: existingUser.email };
    } else {
      // Create new admin
      const existingUser = await prisma.user.findUnique({ where: { email: newAdmin.email } });
      if (existingUser) {
        return NextResponse.json({ error: "Admin email already exists" }, { status: 400 });
      }
      const hashedPassword = await hash(newAdmin.password, 12);
      const createdUser = await prisma.user.create({
        data: {
          name: newAdmin.name,
          email: newAdmin.email,
          phone: newAdmin.phone,
          password: hashedPassword,
          role: "SOCIETY_ADMIN",
        },
      });
      adminId = createdUser.id;
      adminCredentials = {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password, // plain text to show super admin
      };
    }

    // Create the society linked to the admin
    const createdSociety = await prisma.society.create({
      data: {
        name: society.name,
        address: society.address,
        city: society.city,
        adminId,
      },
      include: {
        admin: { select: { name: true, email: true } },
        buildings: { select: { id: true } },
      },
    });

    return NextResponse.json(
      { society: createdSociety, adminCredentials },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating society:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return all non-admin, non-super-admin users for the "select existing" dropdown
    const users = await prisma.user.findMany({
      where: { role: { in: ["RESIDENT", "SUB_ADMIN"] } },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
