import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const vehicleTypeEnum = z.enum(["Car", "Motorcycle", "Scooter", "Cycle"]);
const vehicleColorEnum = z.enum(["Red", "White", "Black", "Silver", "Blue", "Other"]);

export const vehicleCreateSchema = z.object({
  plateNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Plate number is required")
    .max(20, "Plate number is too long"),
  type: vehicleTypeEnum,
  brand: z.string().trim().nullable().optional(),
  color: vehicleColorEnum.nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "RESIDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apartment = await prisma.apartment.findFirst({
    where: { residentId: session.user.id },
    select: { id: true },
  });

  if (!apartment) {
    return NextResponse.json(
      { message: "No apartment linked to this resident account" },
      { status: 400 }
    );
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { apartmentId: apartment.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vehicles });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "RESIDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apartment = await prisma.apartment.findFirst({
    where: { residentId: session.user.id },
    select: { id: true },
  });

  if (!apartment) {
    return NextResponse.json(
      { message: "No apartment linked to this resident account" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const parsed = vehicleCreateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError =
        Object.values(parsed.error.flatten().fieldErrors).flat().filter(Boolean)[0] ??
        "Invalid input";
      return NextResponse.json(
        { message: firstError, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check for existing plate number
    const existing = await prisma.vehicle.findUnique({
      where: { plateNumber: parsed.data.plateNumber },
    });

    if (existing) {
      return NextResponse.json(
        { message: "A vehicle with this plate number already exists" },
        { status: 400 }
      );
    }

    const created = await prisma.vehicle.create({
      data: {
        plateNumber: parsed.data.plateNumber,
        type: parsed.data.type,
        brand: parsed.data.brand || null,
        color: parsed.data.color || null,
        apartmentId: apartment.id,
      },
    });

    return NextResponse.json({ vehicle: created }, { status: 201 });
  } catch (error) {
    console.error("Vehicle create error:", error);
    return NextResponse.json(
      { message: "Failed to add vehicle" },
      { status: 500 }
    );
  }
}
