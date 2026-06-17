import { ComplaintStatus, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { sendNotification } from "@/src/lib/notify";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
  adminResponse: z.string().trim().max(1000).optional(),
});

const nextAllowedStatus: Record<ComplaintStatus, ComplaintStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
  CLOSED: [],
};

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  OPEN: 'Open',
  CLOSED: 'Closed',
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== Role.SOCIETY_ADMIN) {
    return NextResponse.json({ message: "Only society admins can update complaints" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid update payload" }, { status: 400 });
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      society: { select: { adminId: true } },
    },
  });

  if (!complaint) {
    return NextResponse.json({ message: "Complaint not found" }, { status: 404 });
  }

  if (complaint.society.adminId !== session.user.id) {
    return NextResponse.json({ message: "You cannot update this complaint" }, { status: 403 });
  }

  if (
    complaint.status !== parsed.data.status &&
    !nextAllowedStatus[complaint.status].includes(parsed.data.status)
  ) {
    return NextResponse.json(
      { message: "Invalid status flow. Allowed: Open -> In Progress -> Resolved" },
      { status: 400 }
    );
  }

  const updatedComplaint = await prisma.complaint.update({
    where: { id },
    data: {
      status: parsed.data.status,
      adminResponse: parsed.data.adminResponse,
    },
  });

  // Notify the resident whose complaint was updated
  const statusLabel = STATUS_LABELS[parsed.data.status] ?? parsed.data.status;
  sendNotification({
    userId: complaint.userId,
    title: `Complaint ${statusLabel}`,
    message: `Your complaint "${complaint.title}" has been marked as ${statusLabel}.${
      parsed.data.adminResponse ? ` Admin note: ${parsed.data.adminResponse.substring(0, 80)}` : ''
    }`,
    type: 'COMPLAINT',
    link: '/resident/complaints',
  });

  return NextResponse.json({ complaint: updatedComplaint });
}
