import { ComplaintStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== UserRole.SOCIETY_ADMIN) {
    return NextResponse.json({ message: "Only society admins can update complaints" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid update payload" }, { status: 400 });
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      society: {
        select: {
          adminId: true,
        },
      },
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

  return NextResponse.json({ complaint: updatedComplaint });
}
