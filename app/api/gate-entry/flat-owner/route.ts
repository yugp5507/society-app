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

    const maskPhone = (p: string) => {
      if (!p || p.length < 5) return "XXXXX";
      return p.substring(0, 2) + "XXXXX" + p.substring(p.length - 3);
    };

    return NextResponse.json({
      owner: {
        name: apartment.resident.name,
        phone: maskPhone(apartment.resident.phone || "")
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
