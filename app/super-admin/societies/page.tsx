import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import SocietiesClient from "./SocietiesClient";

export default async function SocietiesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const societies = await prisma.society.findMany({
    include: {
      admin: {
        select: { name: true, email: true },
      },
      buildings: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <SocietiesClient initialSocieties={societies} />;
}
