import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hash } from "bcryptjs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const inviteToken = await prisma.inviteToken.findUnique({
      where: { token },
      include: {
        apartment: {
          include: {
            building: {
              include: {
                society: true,
              },
            },
          },
        },
      },
    });

    if (!inviteToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (inviteToken.used) {
      return NextResponse.json({ error: "Token has already been used" }, { status: 400 });
    }

    if (inviteToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Return safe data for display
    return NextResponse.json({
      apartmentNumber: inviteToken.apartment.number,
      buildingName: inviteToken.apartment.building.name,
      societyName: inviteToken.apartment.building.society.name,
    });
  } catch (error) {
    console.error("Error validating join token:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { token, name, email, phone, password } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const inviteToken = await prisma.inviteToken.findUnique({
      where: { token },
    });

    if (!inviteToken || inviteToken.used || inviteToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    // Run in transaction: mark token as used, create user, update apartment
    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Create the user
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: "RESIDENT",
        },
      });

      // 2. Link user to apartment
      await tx.apartment.update({
        where: { id: inviteToken.apartmentId },
        data: { residentId: user.id },
      });

      // 3. Mark token as used
      await tx.inviteToken.update({
        where: { id: inviteToken.id },
        data: { used: true },
      });

      return user;
    });

    return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error("Error processing join:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
