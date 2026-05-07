"use client";

import DashboardLayout from "@/src/components/DashboardLayout";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  CalendarCheck,
  IndianRupee,
  ChevronRight,
  Megaphone,
  Building2,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  PlusCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Complaint = {
  id: string;
  title: string;
  resident: string;
  flat: string;
  status: "Open" | "In Progress" | "Resolved";
};

type Notice = {
  id: string;
  title: string;
  date: string;
  category: string;
};

// ─── Static Data ─────────────────────────────────────────────────────────────
const notices: Notice[] = [
  { id: "n1", title: "Water supply maintenance on Saturday", date: "May 08, 2026", category: "Utility" },
  { id: "n2", title: "Annual general meeting notice", date: "May 12, 2026", category: "General" },
  { id: "n3", title: "Parking stickers renewal – deadline extended", date: "May 15, 2026", category: "Parking" },
];

const complaints: Complaint[] = [
  { id: "c1", title: "Lift not working in Tower B", resident: "Amit Verma", flat: "B-204", status: "Open" },
  { id: "c2", title: "Basement seepage issue ongoing", resident: "Neha Joshi", flat: "A-101", status: "In Progress" },
  { id: "c3", title: "Streetlight malfunction near gate 2", resident: "Rakesh S.", flat: "C-301", status: "Resolved" },
];

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

function statusBadge(status: Complaint["status"]) {
  const map = {
    Open: { cls: "bg-red-50 text-red-700 border-red-200", Icon: XCircle },
    "In Progress": { cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
    Resolved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
  };
  const { cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

const categoryColors: Record<string, string> = {
  Utility: "bg-blue-50 text-blue-700",
  General: "bg-slate-100 text-slate-700",
  Parking: "bg-orange-50 text-orange-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SocietyAdminDashboardPage() {
  return (
    <DashboardLayout variant="society-admin" title="Dashboard">
      
      {/* ── Welcome Section ── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Good Afternoon, Priya Nair</h2>
          <p className="text-sm text-slate-500 mt-1">Green Valley Residency • Pune, Maharashtra</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/society-admin/notices" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4 text-slate-400" /> Post Notice
          </Link>
          <Link href="/society-admin/residents" className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Resident
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Residents" subLabel="Registered families" value="862" icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" trend="+12" />
        <StatCard label="Pending Complaints" subLabel="Awaiting resolution" value="27" icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard label="Amenity Bookings" subLabel="This week" value="14" icon={CalendarCheck} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard label="Unpaid Maintenance" subLabel="Collection pending" value="₹6.8L" icon={IndianRupee} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </section>

      {/* ── At-a-glance bar ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: "Total Buildings", value: "6", icon: Building2, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "Active Visitors", value: "18", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Open Bookings", value: "5", icon: CalendarCheck, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <article key={label} className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <span className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
            </div>
          </article>
        ))}
      </section>

      {/* ── Notices + Complaints ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Notices */}
        <article className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-slate-400" />
              Recent Notices
            </h3>
            <Link href="/society-admin/notices" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center">
              Manage <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          <ul className="p-2 space-y-1">
            {notices.map((notice) => (
              <li key={notice.id} className="rounded-lg p-3 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{notice.title}</p>
                  <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${categoryColors[notice.category] ?? "bg-slate-100 text-slate-600"}`}>
                    {notice.category}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">{notice.date}</p>
              </li>
            ))}
          </ul>
        </article>

        {/* Recent Complaints */}
        <article className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              Recent Complaints
            </h3>
            <Link href="/society-admin/complaints" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center">
              Manage <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          <ul className="p-2 space-y-1">
            {complaints.map((c) => (
              <li key={c.id} className="rounded-lg p-3 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{c.resident} · {c.flat}</p>
                  </div>
                  {statusBadge(c.status)}
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </DashboardLayout>
  );
}
