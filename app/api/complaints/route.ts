import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { ComplaintStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const createComplaintSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  category: z.enum(["Plumbing", "Electrical", "Cleanliness", "Security", "Parking", "Lift", "Other"]),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");

  const whereBase = {
    ...(status ? { status: status as ComplaintStatus } : {}),
    ...(category ? { category } : {}),
  };

  const where =
    session.user.role === "RESIDENT"
      ? { ...whereBase, userId: session.user.id }
      : session.user.role === "SOCIETY_ADMIN"
        ? { ...whereBase, society: { adminId: session.user.id } }
        : whereBase;

  const complaints = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          apartments: {
            select: { number: true },
            take: 1,
          },
        },
      },
    },
  });

  return NextResponse.json({
    complaints: complaints.map((complaint) => ({
      id: complaint.id,
      title: complaint.title,
      category: complaint.category,
      description: complaint.description,
      photo: complaint.photo,
      adminResponse: complaint.adminResponse,
      status: complaint.status,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      residentName: complaint.user.name,
      apartmentNumber: complaint.user.apartments[0]?.number ?? "N/A",
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== UserRole.RESIDENT) {
    return NextResponse.json({ message: "Only residents can create complaints" }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = createComplaintSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors).flat().filter(Boolean)[0] ?? "Invalid form data";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  const resident = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      apartments: {
        select: {
          building: {
            select: {
              societyId: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  const societyId = resident?.apartments[0]?.building.societyId;
  if (!societyId) {
    return NextResponse.json(
      { message: "Resident is not mapped to an apartment/society yet" },
      { status: 400 }
    );
  }

  const photo = formData.get("photo");
  let photoPath: string | undefined;

  if (photo instanceof File && photo.size > 0) {
    const bytes = Buffer.from(await photo.arrayBuffer());
    const safeExt = photo.name.includes(".") ? photo.name.split(".").pop() : "jpg";
    const fileName = `${randomUUID()}.${safeExt}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "complaints");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), bytes);
    photoPath = `/uploads/complaints/${fileName}`;
  }

  const complaint = await prisma.complaint.create({
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      photo: photoPath,
      userId: session.user.id,
      societyId,
    },
  });

  return NextResponse.json({ complaint }, { status: 201 });
}
