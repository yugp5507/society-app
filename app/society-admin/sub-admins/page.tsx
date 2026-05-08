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
    select: { id: true, name: true },
  });

  // Get all Sub Admins for this society.
  // Since SUB_ADMINs don't have a direct societyId, we find them by the buildings they manage in this society.
  // Alternatively, if they have no buildings yet, we could miss them. But let's assume they are created via the Building assignment.
  // Wait, if a SUB_ADMIN is created and not assigned, they won't be found this way.
  // Better approach: Since User doesn't have societyId directly, we can find users with role SUB_ADMIN who manage a building in this society.
  
  const subAdmins = await prisma.user.findMany({
    where: {
      role: "SUB_ADMIN",
      subAdminBuildings: {
        some: {
          societyId: society.id,
        },
      },
    },
    include: {
      subAdminBuildings: true,
    },
  });

  return (
    <SubAdminClient
      initialSubAdmins={subAdmins}
      buildings={buildings}
      societyId={society.id}
    />
  );
}
