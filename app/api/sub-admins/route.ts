import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone, password, buildingId } = await req.json();

    // Validate building belongs to the society admin's society
    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id },
    });

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    const building = await prisma.building.findFirst({
      where: { id: buildingId, societyId: society.id },
    });

    if (!building) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    // Create user and assign building
    const newSubAdmin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "SUB_ADMIN",
        subAdminBuildings: {
          connect: { id: buildingId },
        },
      },
      include: {
        subAdminBuildings: true,
      },
    });

    // We don't return the password
    const { password: _, ...userWithoutPassword } = newSubAdmin;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating sub admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const buildingId = searchParams.get("buildingId");

    if (!id || !buildingId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const society = await prisma.society.findFirst({
      where: { adminId: session.user.id },
    });

    if (!society) {
      return NextResponse.json({ error: "Society not found" }, { status: 404 });
    }

    // Disconnect building from sub admin
    await prisma.building.update({
      where: { id: buildingId, societyId: society.id },
      data: { subAdminId: null },
    });

    // Optionally delete the user if they manage no other buildings
    const user = await prisma.user.findUnique({
      where: { id },
      include: { subAdminBuildings: true },
    });

    if (user && user.subAdminBuildings.length === 0) {
      await prisma.user.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing sub admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
