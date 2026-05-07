"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarCheck,
  Megaphone,
  MessageSquareWarning,
  DoorOpen,
  IndianRupee,
  Building2,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  Home,
  LogOut,
  User,
} from "lucide-react";

type SidebarVariant = "resident" | "society-admin" | "super-admin";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const NAV: Record<SidebarVariant, SidebarItem[]> = {
  resident: [
    { label: "Dashboard", href: "/resident/dashboard", icon: LayoutDashboard },
    { label: "My Family", href: "/resident/family", icon: Users },
    { label: "My Vehicles", href: "/resident/vehicles", icon: Car },
    { label: "Book Amenity", href: "/resident/bookings", icon: CalendarCheck },
    { label: "Notice Board", href: "/resident/notices", icon: Megaphone },
    { label: "My Complaints", href: "/resident/complaints", icon: MessageSquareWarning },
    { label: "Visitor Entry", href: "/resident/visitors", icon: DoorOpen },
    { label: "Pay Maintenance", href: "/resident/maintenance", icon: IndianRupee },
  ],
  "society-admin": [
    { label: "Dashboard", href: "/society-admin/dashboard", icon: LayoutDashboard },
    { label: "Residents", href: "/society-admin/residents", icon: Users },
    { label: "Buildings", href: "/society-admin/buildings", icon: Building2 },
    { label: "Notices", href: "/society-admin/notices", icon: Megaphone },
    { label: "Complaints", href: "/society-admin/complaints", icon: MessageSquareWarning },
    { label: "Bookings", href: "/society-admin/bookings", icon: CalendarCheck },
    { label: "Visitor Log", href: "/society-admin/visitors", icon: DoorOpen },
    { label: "Maintenance", href: "/society-admin/maintenance", icon: IndianRupee },
  ],
  "super-admin": [
    { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { label: "Societies", href: "/super-admin/societies", icon: Home },
    { label: "Admins", href: "/super-admin/admins", icon: ShieldCheck },
    { label: "Residents", href: "/super-admin/residents", icon: Users },
    { label: "Reports", href: "/super-admin/reports", icon: BarChart3 },
  ],
};

const BRAND: Record<SidebarVariant, { label: string }> = {
  resident: { label: "Resident Portal" },
  "society-admin": { label: "Admin Portal" },
  "super-admin": { label: "Super Admin" },
};

export default function Sidebar({ variant, mobileOpen, setMobileOpen }: { variant: SidebarVariant, mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const items = NAV[variant];
  const brand = BRAND[variant];

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function isActive(href: string) {
    if (pathname === href) return true;
    return pathname?.startsWith(`${href}/`);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-400">
      {/* Brand header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase leading-tight">SocietyPro</span>
            <span className="block text-white font-semibold leading-tight">{brand.label}</span>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button
          className="md:hidden p-1 text-slate-400 hover:text-white"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 group-hover:border-slate-600">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">My Account</p>
            <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">View Profile</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-[260px] z-20">
        {sidebarContent}
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
