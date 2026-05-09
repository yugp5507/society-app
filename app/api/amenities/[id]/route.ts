import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// PUT /api/amenities/[id] — update amenity
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name, description, capacity, location, availableDays,
      openTime, closeTime, slotDuration, advanceBookDays,
      isPaid, pricePerSlot, status,
    } = body;

    const amenity = await prisma.amenity.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(location !== undefined && { location }),
        ...(availableDays !== undefined && {
          availableDays: Array.isArray(availableDays) ? availableDays.join(",") : availableDays,
        }),
        ...(openTime !== undefined && { openTime }),
        ...(closeTime !== undefined && { closeTime }),
        ...(slotDuration !== undefined && { slotDuration: parseInt(slotDuration) }),
        ...(advanceBookDays !== undefined && { advanceBookDays: parseInt(advanceBookDays) }),
        ...(isPaid !== undefined && { isPaid: !!isPaid }),
        ...(pricePerSlot !== undefined && { pricePerSlot: isPaid ? parseFloat(pricePerSlot) : null }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ amenity });
  } catch (error) {
    console.error("PUT /api/amenities/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/amenities/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SOCIETY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.amenity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/amenities/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
