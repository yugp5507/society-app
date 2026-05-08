import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { vehicleCreateSchema } from "../route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "RESIDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Ensure the vehicle belongs to the resident's apartment
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { apartment: true },
    });

    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }

    if (vehicle.apartment.residentId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

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

    // Check if plate is changing and if new plate already exists
    if (parsed.data.plateNumber !== vehicle.plateNumber) {
      const existing = await prisma.vehicle.findUnique({
        where: { plateNumber: parsed.data.plateNumber },
      });

      if (existing) {
        return NextResponse.json(
          { message: "A vehicle with this plate number already exists" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber: parsed.data.plateNumber,
        type: parsed.data.type,
        brand: parsed.data.brand || null,
        color: parsed.data.color || null,
      },
    });

    return NextResponse.json({ vehicle: updated });
  } catch (error) {
    console.error("Vehicle update error:", error);
    return NextResponse.json({ message: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RESIDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { apartment: true },
    });

    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }

    if (vehicle.apartment.residentId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Vehicle delete error:", error);
    return NextResponse.json({ message: "Failed to delete vehicle" }, { status: 500 });
  }
}
