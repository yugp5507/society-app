import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const apartmentId = searchParams.get("apartmentId");

    if (!apartmentId) return NextResponse.json({ owner: null });

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: { resident: true }
    });

    if (!apartment?.resident) return NextResponse.json({ owner: null });

    return NextResponse.json({
      owner: {
        name: apartment.resident.name,
        phone: apartment.resident.phone || "Not Available"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
