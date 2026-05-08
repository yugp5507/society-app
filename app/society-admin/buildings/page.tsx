import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import BuildingsClient from "./BuildingsClient";

export default async function SocietyAdminBuildingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SOCIETY_ADMIN") {
    redirect("/login");
  }

  const society = await prisma.society.findFirst({
    where: { adminId: session.user.id },
  });

  if (!society) {
    return <div>No society found.</div>;
  }

  const buildings = await prisma.building.findMany({
    where: { societyId: society.id },
    include: {
      apartments: {
        include: {
          resident: {
            select: { id: true, name: true, phone: true },
          },
          inviteTokens: {
            where: { used: false },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <BuildingsClient initialBuildings={buildings} societyId={society.id} />;
}
