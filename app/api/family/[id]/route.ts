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

const familyMemberUpdateSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  relation: relationEnum,
  phone: phoneSchema,
  dateOfBirth: z.string().nullable().optional(),
});

function parseDateOrNull(input: string | null | undefined): Date | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (!input) return null;
  return new Date(`${input}T00:00:00.000Z`);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "RESIDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

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

  const existing = await prisma.familyMember.findUnique({
    where: { id },
    select: { id: true, apartmentId: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Family member not found" }, { status: 404 });
  }

  if (existing.apartmentId !== apartment.id) {
    return NextResponse.json({ message: "You cannot edit this family member" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = familyMemberUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors).flat().filter(Boolean)[0] ??
      "Invalid input";
    return NextResponse.json({ message: firstError, errors: parsed.error.flatten() }, { status: 400 });
  }

  const dob = parseDateOrNull(parsed.data.dateOfBirth);

  const updated = await prisma.familyMember.update({
    where: { id },
    data: {
      name: parsed.data.name,
      relation: parsed.data.relation,
      phone: parsed.data.phone,
      dateOfBirth: dob ?? null,
    },
  });

  return NextResponse.json({ familyMember: updated });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "RESIDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

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

  const existing = await prisma.familyMember.findUnique({
    where: { id },
    select: { id: true, apartmentId: true },
  });

  if (!existing) {
    return NextResponse.json({ message: "Family member not found" }, { status: 404 });
  }

  if (existing.apartmentId !== apartment.id) {
    return NextResponse.json({ message: "You cannot delete this family member" }, { status: 403 });
  }

  await prisma.familyMember.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}

