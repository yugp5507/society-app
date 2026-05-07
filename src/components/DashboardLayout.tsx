"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

type SidebarVariant = "resident" | "society-admin" | "super-admin";

export default function DashboardLayout({
  children,
  variant,
  title,
}: {
  children: React.ReactNode;
  variant: SidebarVariant;
  title: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar variant={variant} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        <TopNavbar title={title} onMenuClick={() => setMobileOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
