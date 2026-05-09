import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// GET /api/bookings/slots?amenityId=xxx&date=YYYY-MM-DD
// Returns generated time slots with availability status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const amenityId = searchParams.get("amenityId");
    const date = searchParams.get("date");

    if (!amenityId || !date) {
      return NextResponse.json({ error: "amenityId and date are required" }, { status: 400 });
    }

    const amenity = await prisma.amenity.findUnique({ where: { id: amenityId } });
    if (!amenity) return NextResponse.json({ error: "Amenity not found" }, { status: 404 });

    // Get booked slots for this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedSlots = await prisma.booking.findMany({
      where: {
        amenityId,
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ["PENDING", "APPROVED"] },
      },
      select: { startTime: true, endTime: true, status: true },
    });

    // Generate slots
    const slots: { start: string; end: string; available: boolean; status: string }[] = [];
    const [openH, openM] = amenity.openTime.split(":").map(Number);
    const [closeH, closeM] = amenity.closeTime.split(":").map(Number);
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;
    const duration = amenity.slotDuration;

    const nowDate = new Date();
    const isToday = new Date(date).toDateString() === nowDate.toDateString();
    const nowMins = isToday ? nowDate.getHours() * 60 + nowDate.getMinutes() : -1;

    let slotIntervals: { start: number, end: number }[] = [];

    if (duration === 480) { // Full Day
      slotIntervals.push({ start: openMins, end: closeMins });
    } else if (duration === 240) { // Half Day
      const mid = openMins + Math.floor((closeMins - openMins) / 2);
      slotIntervals.push({ start: openMins, end: mid });
      slotIntervals.push({ start: mid, end: closeMins });
    } else { // Hourly, 30 mins, 2 hours
      for (let m = openMins; m + duration <= closeMins; m += duration) {
        slotIntervals.push({ start: m, end: m + duration });
      }
    }

    for (const interval of slotIntervals) {
      const startH = Math.floor(interval.start / 60).toString().padStart(2, "0");
      const startMin = (interval.start % 60).toString().padStart(2, "0");
      const endH = Math.floor(interval.end / 60).toString().padStart(2, "0");
      const endMin = (interval.end % 60).toString().padStart(2, "0");
      
      // Convert to 12-hour format for better display if desired, 
      // but sticking to HH:mm to match existing start/end strings.
      const start = `${startH}:${startMin}`;
      const end = `${endH}:${endMin}`;

      const booked = bookedSlots.find(b => b.startTime === start);
      const isPast = isToday && interval.start < nowMins;

      slots.push({
        start,
        end,
        available: !booked && !isPast,
        status: isPast ? "past" : booked ? "booked" : "available",
      });
    }

    // Check if this day is available for this amenity
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[new Date(date).getDay()];
    const isDayAvailable = amenity.availableDays.includes(dayName);

    return NextResponse.json({ slots, isDayAvailable, amenity });
  } catch (error) {
    console.error("GET /api/bookings/slots error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
