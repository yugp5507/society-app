import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const entry = await prisma.gateEntry.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ status: entry.status });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
