import { UserRole } from "@prisma/client";

export function getDashboardPathByRole(role?: UserRole | null): string {
  if (role === "SUPER_ADMIN") return "/super-admin/dashboard";
  if (role === "SOCIETY_ADMIN") return "/society-admin/dashboard";
  return "/resident/dashboard";
}
