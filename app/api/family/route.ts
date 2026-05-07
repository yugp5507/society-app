import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const relationEnum = z.enum([
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Other",
]);

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

const familyMemberCreateSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  relation: relationEnum,
  phone: phoneSchema,
  dateOfBirth: z.string().nullable().optional(),
});

function parseDateOrNull(input: string | null | undefined): Date | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (!input) return null;
  // Input expected as YYYY-MM-DD from <input type="date" />
  return new Date(`${input}T00:00:00.000Z`);
}

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

  const familyMembers = await prisma.familyMember.findMany({
    where: { apartmentId: apartment.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ familyMembers });
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

  const body = await request.json();
  const parsed = familyMemberCreateSchema.safeParse(body);

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors).flat().filter(Boolean)[0] ??
      "Invalid input";
    return NextResponse.json({ message: firstError, errors: parsed.error.flatten() }, { status: 400 });
  }

  const dob = parseDateOrNull(parsed.data.dateOfBirth);

  const created = await prisma.familyMember.create({
    data: {
      name: parsed.data.name,
      relation: parsed.data.relation,
      phone: parsed.data.phone,
      dateOfBirth: dob ?? null,
      apartmentId: apartment.id,
    },
  });

  return NextResponse.json({ familyMember: created }, { status: 201 });
}

