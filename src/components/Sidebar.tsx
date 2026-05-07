"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarVariant = "resident" | "society-admin" | "super-admin";

type SidebarItem = {
  label: string;
  href: string;
};

const NAV: Record<SidebarVariant, SidebarItem[]> = {
  resident: [
    { label: "Dashboard", href: "/resident/dashboard" },
    { label: "My Family", href: "/resident/family" },
    { label: "My Vehicles", href: "/resident/vehicles" },
    { label: "Book Amenity", href: "/resident/bookings" },
    { label: "Notice Board", href: "/resident/notices" },
    { label: "My Complaints", href: "/resident/complaints" },
    { label: "Visitor Entry", href: "/resident/visitors" },
    { label: "Pay Maintenance", href: "/resident/maintenance" },
  ],
  "society-admin": [
    { label: "Dashboard", href: "/society-admin/dashboard" },
    { label: "Residents", href: "/society-admin/residents" },
    { label: "Buildings & Apartments", href: "/society-admin/buildings" },
    { label: "Notice Board", href: "/society-admin/notices" },
    { label: "Complaints", href: "/society-admin/complaints" },
    { label: "Amenity Booking", href: "/society-admin/bookings" },
    { label: "Visitor Log", href: "/society-admin/visitors" },
    { label: "Maintenance", href: "/society-admin/maintenance" },
  ],
  "super-admin": [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: "Societies", href: "/super-admin/societies" },
    { label: "Admins", href: "/super-admin/admins" },
    { label: "Residents", href: "/super-admin/residents" },
    { label: "Reports", href: "/super-admin/reports" },
  ],
};

function getHeading(variant: SidebarVariant) {
  if (variant === "resident") return "Resident Panel";
  if (variant === "society-admin") return "Society Admin";
  return "Super Admin";
}

export default function Sidebar({ variant }: { variant: SidebarVariant }) {
  const pathname = usePathname();
  const items = NAV[variant];
  const heading = getHeading(variant);

  function isActive(href: string) {
    if (pathname === href) return true;
    // Mark active for nested pages under the same top-level link.
    return pathname?.startsWith(`${href}/`);
  }

  return (
    <aside className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">SocietyPro</p>
        <h1 className="text-xl font-bold text-[#1e3a5f]">{heading}</h1>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                active ? "bg-[#1e3a5f] text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

