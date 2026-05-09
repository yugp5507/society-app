import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, action: string }> }) {
  try {
    const { id, action } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SECURITY_GUARD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Action can be applied to GateEntry or Visitor model depending on if it's pre-approved
    // We check GateEntry first
    let entry = await prisma.gateEntry.findUnique({ where: { id } });
    
    if (entry) {
      if (action === "allow") {
        await prisma.gateEntry.update({
          where: { id },
          data: { status: "INSIDE", entryTime: new Date(), guardId: session.user.id }
        });
      } else if (action === "deny") {
        await prisma.gateEntry.update({
          where: { id },
          data: { status: "DENIED", guardId: session.user.id }
        });
      } else if (action === "exit") {
        await prisma.gateEntry.update({
          where: { id },
          data: { status: "LEFT", exitTime: new Date(), guardId: session.user.id }
        });
      }
    } else {
      // It might be a Visitor model (pre-approved)
      let visitor = await prisma.visitor.findUnique({ where: { id } });
      if (visitor) {
        if (action === "allow") {
          await prisma.visitor.update({
            where: { id },
            data: { status: "INSIDE", entryTime: new Date() }
          });
          // Log into GateEntry as well for uniformity
          await prisma.gateEntry.create({
            data: {
              visitorName: visitor.name,
              visitorPhone: visitor.phone || "N/A",
              purpose: visitor.purpose,
              vehicleNumber: visitor.vehiclePlate,
              entryMethod: "PRE_APPROVED",
              status: "INSIDE",
              societyId: visitor.societyId,
              apartmentId: visitor.apartmentId!,
              guardId: session.user.id,
              entryTime: new Date(),
            }
          });
        }
      } else {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
