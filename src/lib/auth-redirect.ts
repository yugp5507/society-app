import { Role } from "@prisma/client";

export function getDashboardPathByRole(role?: Role | string | null): string {
  if (role === "SUPER_ADMIN")   return "/super-admin/dashboard";
  if (role === "SOCIETY_ADMIN") return "/society-admin/dashboard";
  if (role === "SUB_ADMIN")     return "/sub-admin/dashboard";
  if (role === "RESIDENT")      return "/resident/dashboard";
  if (role === "SECURITY_GUARD") return "/guard/dashboard";
  return "/login";
}

export function getRoleLabel(role?: string | null): string {
  if (role === "SUPER_ADMIN")   return "Super Admin";
  if (role === "SOCIETY_ADMIN") return "Society Admin";
  if (role === "SUB_ADMIN")     return "Sub Admin";
  if (role === "RESIDENT")      return "Resident";
  if (role === "SECURITY_GUARD") return "Security Guard";
  return "User";
}

export function getRoleColor(role?: string | null): string {
  if (role === "SUPER_ADMIN")   return "#7C3AED"; // purple
  if (role === "SOCIETY_ADMIN") return "#2563EB"; // blue
  if (role === "SUB_ADMIN")     return "#0891B2"; // cyan
  if (role === "RESIDENT")      return "#059669"; // green
  if (role === "SECURITY_GUARD") return "#0F172A"; // dark
  return "#64748B";
}
