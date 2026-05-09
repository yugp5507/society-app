import { UserRole } from "@prisma/client";

export function getDashboardPathByRole(role?: UserRole | string | null): string {
  if (role === "SUPER_ADMIN")   return "/super-admin/dashboard";
  if (role === "SOCIETY_ADMIN") return "/society-admin/dashboard";
  if (role === "SUB_ADMIN")     return "/sub-admin/dashboard";
  if (role === "RESIDENT")      return "/resident/dashboard";
  return "/login";
}

export function getRoleLabel(role?: string | null): string {
  if (role === "SUPER_ADMIN")   return "Super Admin";
  if (role === "SOCIETY_ADMIN") return "Society Admin";
  if (role === "SUB_ADMIN")     return "Sub Admin";
  if (role === "RESIDENT")      return "Resident";
  return "User";
}

export function getRoleColor(role?: string | null): string {
  if (role === "SUPER_ADMIN")   return "#7C3AED"; // purple
  if (role === "SOCIETY_ADMIN") return "#2563EB"; // blue
  if (role === "SUB_ADMIN")     return "#0891B2"; // cyan
  if (role === "RESIDENT")      return "#059669"; // green
  return "#64748B";
}
