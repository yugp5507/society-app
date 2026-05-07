"use client";

import DashboardLayout from "@/src/components/DashboardLayout";
import Link from "next/link";
import {
  Home,
  Users,
  IndianRupee,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  PlusCircle,
  UserPlus,
  MapPin,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type SocietyStatus = "Active" | "Inactive";

type Society = {
  id: string;
  name: string;
  city: string;
  residents: number;
  adminName: string;
  status: SocietyStatus;
};

type ActivityItem = {
  id: string;
  title: string;
  time: string;
  type: "success" | "info" | "warning";
};

// ─── Static Data ─────────────────────────────────────────────────────────────
const societies: Society[] = [
  { id: "1", name: "Green Valley Residency", city: "Pune", residents: 420, adminName: "Anil Mehta", status: "Active" },
  { id: "2", name: "Lakeview Heights", city: "Bengaluru", residents: 305, adminName: "Priya Nair", status: "Active" },
  { id: "3", name: "Sunrise Enclave", city: "Mumbai", residents: 510, adminName: "Rahul Shah", status: "Inactive" },
  { id: "4", name: "Maple Towers", city: "Hyderabad", residents: 280, adminName: "Sneha Reddy", status: "Active" },
];

const activities: ActivityItem[] = [
  { id: "a1", title: "New society Maple Towers onboarded", time: "10 mins ago", type: "success" },
  { id: "a2", title: "Society admin added for Lakeview Heights", time: "1 hour ago", type: "info" },
  { id: "a3", title: "Maintenance payout settled — Green Valley", time: "3 hours ago", type: "success" },
  { id: "a4", title: "Complaint escalation: Sunrise Enclave", time: "Yesterday", type: "warning" },
];

const activityTypeStyles = {
  success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  info: "bg-blue-50 text-blue-600 border border-blue-100",
  warning: "bg-amber-50 text-amber-600 border border-amber-100",
};

const activityTypeIcons = {
  success: CheckCircle2,
  info: Activity,
  warning: AlertCircle,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  label,
  subLabel,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
}: {
  label: string;
  subLabel: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
}) {
  return (
    <article className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
        <p className="text-xs text-slate-400 font-medium">{subLabel}</p>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboardPage() {
  return (
    <DashboardLayout variant="super-admin" title="Dashboard">

      {/* ── Welcome Section ── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Platform Overview</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" /> Super Administrator
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/super-admin/societies" className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" /> Add Society
          </Link>
          <Link href="/super-admin/admins" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4 text-slate-400" /> Add Admin
          </Link>
          <Link href="/super-admin/reports" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <BarChart3 className="w-4 h-4 text-slate-400" /> Reports
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Societies" subLabel="Across India" value="124" icon={Home} iconColor="text-blue-600" iconBg="bg-blue-50" trend="+4" />
        <StatCard label="Total Residents" subLabel="Registered users" value="28.5k" icon={Users} iconColor="text-emerald-600" iconBg="bg-emerald-50" trend="+860" />
        <StatCard label="Total Revenue" subLabel="Platform earnings" value="₹2.4Cr" icon={IndianRupee} iconColor="text-purple-600" iconBg="bg-purple-50" trend="18% YoY" />
        <StatCard label="Active Complaints" subLabel="Pending resolution" value="318" icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
      </section>

      {/* ── Societies Table + Activity ── */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">

        {/* Societies Table */}
        <article className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Home className="w-4 h-4 text-slate-400" />
              All Societies
            </h3>
            <Link href="/super-admin/societies" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Society</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">City</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Residents</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.map((society) => (
                  <tr key={society.id} className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                          <Home className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{society.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {society.city}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-700">{society.residents.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{society.adminName}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                        society.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {society.status === "Active"
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <XCircle className="w-3.5 h-3.5" />
                        }
                        {society.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View all link row */}
          <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
            <Link href="/super-admin/societies" className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
              View all 124 societies <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </article>

        {/* Recent Activity */}
        <article className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Recent Activity
            </h3>
          </div>
          <ul className="p-2 space-y-1">
            {activities.map((item) => {
              const Icon = activityTypeIcons[item.type];
              return (
                <li key={item.id} className="rounded-lg p-3 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${activityTypeStyles[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500 font-medium">{item.time}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Quick stats footer */}
          <div className="border-t border-slate-100 p-4 mt-auto bg-slate-50/50">
            <div className="grid grid-cols-3 gap-2 divide-x divide-slate-200">
              {[
                { label: "Active", value: "119", color: "text-slate-900" },
                { label: "Inactive", value: "5", color: "text-slate-900" },
                { label: "Pending", value: "12", color: "text-slate-900" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

    </DashboardLayout>
  );
}
