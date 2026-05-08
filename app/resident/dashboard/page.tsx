"use client";

import Link from "next/link";
import {
  Users,
  Car,
  AlertCircle,
  IndianRupee,
  ChevronRight,
  Megaphone,
  CalendarCheck,
  MessageSquarePlus,
  DoorOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Booking = {
  id: string;
  amenity: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending";
};

type Notice = {
  id: string;
  title: string;
  date: string;
  tag: string;
  tagColor: string;
};

// ─── Static Data ─────────────────────────────────────────────────────────────
const notices: Notice[] = [
  { id: "n1", title: "Clubhouse closed for deep cleaning on Sunday", date: "May 09, 2026", tag: "Maintenance", tagColor: "bg-orange-100 text-orange-700" },
  { id: "n2", title: "Power backup testing this Friday, 11 AM", date: "May 10, 2026", tag: "Utility", tagColor: "bg-blue-100 text-blue-700" },
  { id: "n3", title: "Security drill for all towers – mandatory", date: "May 14, 2026", tag: "Security", tagColor: "bg-red-100 text-red-700" },
];

const bookings: Booking[] = [
  { id: "b1", amenity: "Community Hall", date: "May 11, 2026", time: "6:00 PM – 8:00 PM", status: "Confirmed" },
  { id: "b2", amenity: "Badminton Court", date: "May 13, 2026", time: "7:00 AM – 8:00 AM", status: "Pending" },
  { id: "b3", amenity: "Swimming Pool", date: "May 16, 2026", time: "5:00 PM – 6:00 PM", status: "Confirmed" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatCard({
  label,
  subLabel,
  value,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  subLabel: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
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
      <p className="mt-4 text-xs text-slate-400">{subLabel}</p>
    </article>
  );
}

function QuickActionButton({
  label,
  icon: Icon,
  color,
  bgColor,
  href,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-3 rounded-xl p-6 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
    >
      <span className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </span>
      <span className="text-sm font-semibold text-slate-700 text-center leading-tight">{label}</span>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResidentDashboardPage() {
  return (
    <>
      {/* ── Welcome Section ── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome back, Rahul Sharma</h2>
          <p className="text-sm text-slate-500 mt-1">Green Valley Residency • Tower B, Flat 402</p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Maintenance Due</p>
            <p className="text-lg font-bold text-amber-900 leading-none mt-1">₹3,250</p>
          </div>
          <Link href="/resident/maintenance" className="ml-4 bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-amber-700 transition-colors shadow-sm">
            Pay Now
          </Link>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Family Members" subLabel="Registered members" value="4" icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard label="My Vehicles" subLabel="Registered vehicles" value="2" icon={Car} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard label="Complaints" subLabel="Pending resolution" value="1" icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard label="Maintenance Due" subLabel="Current month" value="₹3,250" icon={IndianRupee} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <QuickActionButton label="Pay Maintenance" icon={IndianRupee} color="text-emerald-600" bgColor="bg-emerald-50" href="/resident/maintenance" />
          <QuickActionButton label="Book Amenity" icon={CalendarCheck} color="text-purple-600" bgColor="bg-purple-50" href="/resident/bookings" />
          <QuickActionButton label="Raise Complaint" icon={MessageSquarePlus} color="text-red-600" bgColor="bg-red-50" href="/resident/complaints" />
          <QuickActionButton label="Add Visitor" icon={DoorOpen} color="text-blue-600" bgColor="bg-blue-50" href="/resident/visitors" />
        </div>
      </section>

      {/* ── Notices + Bookings ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Notices */}
        <article className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-slate-400" />
              Recent Notices
            </h3>
            <Link href="/resident/notices" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          <ul className="p-2 space-y-1">
            {notices.map((notice) => (
              <li key={notice.id} className="rounded-lg p-3 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{notice.title}</p>
                  <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${notice.tagColor}`}>
                    {notice.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">{notice.date}</p>
              </li>
            ))}
          </ul>
        </article>

        {/* Upcoming Bookings */}
        <article className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-slate-400" />
              My Bookings
            </h3>
            <Link href="/resident/bookings" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          <ul className="p-2 space-y-1">
            {bookings.map((booking) => (
              <li key={booking.id} className="rounded-lg p-3 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{booking.amenity}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{booking.date} · {booking.time}</p>
                  </div>
                  <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${
                    booking.status === "Confirmed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {booking.status === "Confirmed"
                      ? <CheckCircle2 className="w-3.5 h-3.5" />
                      : <Clock className="w-3.5 h-3.5" />
                    }
                    {booking.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </>
  );
}