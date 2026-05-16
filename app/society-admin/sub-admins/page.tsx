import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import SubAdminClient from "./SubAdminClient";

export default async function SubAdminsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SOCIETY_ADMIN") {
    redirect("/login");
  }

  // Get society of this admin
  const society = await prisma.society.findFirst({
    where: { adminId: session.user.id },
  });

  if (!society) {
    return <div>No society found.</div>;
  }

  // Get buildings
  const buildings = await prisma.building.findMany({
    where: { societyId: society.id },
    select: { id: true, name: true, subAdminId: true },
  });

  // Get all Sub Admins for this society.
  // We find them by the buildings they manage in this society.
  const subAdminIds = buildings
    .map((b) => b.subAdminId)
    .filter((id): id is string => id !== null);

  const subAdmins = await prisma.user.findMany({
    where: {
      id: { in: subAdminIds },
    },
  });

  // Enrich subAdmins with their buildings
  const enrichedSubAdmins = subAdmins.map((admin) => ({
    ...admin,
    subAdminBuildings: buildings.filter((b) => b.subAdminId === admin.id),
  }));

  return (
    <SubAdminClient
      initialSubAdmins={enrichedSubAdmins as any}
      buildings={buildings}
      societyId={society.id}
    />
  );
}
