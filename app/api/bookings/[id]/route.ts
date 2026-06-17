import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { sendNotification } from "@/src/lib/notify";
import { format } from "date-fns";

// PATCH /api/bookings/[id] — admin approve/reject or resident cancel
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, paymentStatus } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        amenity: { select: { name: true } },
        user: { select: { name: true } },
      },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Residents can only cancel their own bookings
    if (session.user.role === "RESIDENT") {
      if (booking.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (status !== "CANCELLED") {
        return NextResponse.json({ error: "Residents can only cancel bookings" }, { status: 403 });
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        amenity: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    // Send notification to resident based on new status
    const amenityName = booking.amenity.name;
    const dateStr = format(new Date(booking.date), 'do MMM yyyy');
    const timeStr = `${booking.startTime} – ${booking.endTime}`;

    if (status === "APPROVED" && booking.userId !== session.user.id) {
      sendNotification({
        userId: booking.userId,
        title: '🎉 Booking Confirmed!',
        message: `Your booking for ${amenityName} on ${dateStr} (${timeStr}) has been approved.`,
        type: 'BOOKING',
        link: '/resident/bookings',
      });
    } else if (status === "REJECTED" && booking.userId !== session.user.id) {
      sendNotification({
        userId: booking.userId,
        title: 'Booking Not Approved',
        message: `Your booking for ${amenityName} on ${dateStr} (${timeStr}) was not approved.`,
        type: 'BOOKING',
        link: '/resident/bookings',
      });
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("PATCH /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] — admin hard delete
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
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
