"use client";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Home,
  Users,
  IndianRupee,
  Star,
  Building2,
  LayoutDashboard,
  Bell,
  TrendingUp,
  CheckCircle2,
  Shield,
} from "lucide-react";

const badges = [
  { emoji: "🏘️", stat: "500+", label: "Societies" },
  { emoji: "👥", stat: "50,000+", label: "Residents" },
  { emoji: "₹", stat: "2Cr+", label: "Collected" },
  { emoji: "⭐", stat: "4.8/5", label: "Rating" },
];

export default function HeroSection() {
  const scrollToFeatures = () => {
    document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eff6ff 40%, #f0f9ff 70%, #f8fafc 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.35,
        }}
      />

      {/* Gradient blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", transform: "translate(-25%, 30%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* LEFT — Copy */}
          <div className="text-center lg:text-left">
            {/* Announcement pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6
              bg-blue-50 border border-blue-200 text-blue-700 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              Trusted by 500+ societies across India
              <ChevronRight className="w-3 h-3" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Smart Society{" "}
              <span className="relative inline-block">
                <span className="text-blue-600">Management</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 8" fill="none">
                  <path d="M2 6 Q75 2 150 5 Q225 8 298 4" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4" />
                </svg>
              </span>
              <br />
              <span className="text-slate-800">for Modern India</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Manage apartments, complaints, payments, visitors and more —
              all in one place. Built for Indian societies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl
                  hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all duration-200
                  hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 text-base"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 font-semibold px-7 py-3.5 rounded-xl
                  hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-200 text-base bg-white/60 backdrop-blur-sm"
              >
                See How It Works
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto lg:mx-0">
              {badges.map(({ emoji, stat, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center lg:items-start gap-0.5 bg-white/80 backdrop-blur-sm
                    rounded-xl px-3 py-3 border border-slate-200/70 shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none">{emoji}</span>
                    <span className="text-lg font-extrabold text-slate-900 leading-none">{stat}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Dashboard Mockup */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl scale-105 pointer-events-none" />

            <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-slate-400 font-mono border border-slate-200">
                  app.societypro.in/dashboard
                </div>
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
              </div>

              {/* Mock dashboard body */}
              <div className="flex" style={{ height: "340px" }}>
                {/* Sidebar */}
                <div className="w-14 bg-slate-900 flex flex-col items-center py-4 gap-3 flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  {[LayoutDashboard, Users, Bell, IndianRupee, Home].map((Icon, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        i === 0 ? "bg-blue-600/25" : "hover:bg-slate-800"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${i === 0 ? "text-blue-400" : "text-slate-500"}`} />
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 bg-slate-50 p-4 space-y-3 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-slate-700">Good morning, Admin 👋</p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Live</span>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "124", lbl: "Societies", bg: "bg-blue-50", txt: "text-blue-700", border: "border-blue-100" },
                      { val: "28.5k", lbl: "Residents", bg: "bg-emerald-50", txt: "text-emerald-700", border: "border-emerald-100" },
                      { val: "₹4.2L", lbl: "Collected", bg: "bg-violet-50", txt: "text-violet-700", border: "border-violet-100" },
                    ].map(({ val, lbl, bg, txt, border }) => (
                      <div key={lbl} className={`rounded-xl border p-2.5 ${bg} ${border}`}>
                        <p className={`text-base font-extrabold ${txt}`}>{val}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{lbl}</p>
                      </div>
                    ))}
                  </div>

                  {/* Notices */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-xs font-bold text-slate-600 mb-2">📢 Recent Notices</p>
                    {[
                      "Water supply off on 12 May — Maintenance",
                      "Lift servicing scheduled for 15 May",
                      "Gym closes at 9 PM from Monday",
                    ].map((n, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <p className="text-xs text-slate-700 truncate">{n}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent payments row */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-xs font-bold text-slate-600 mb-2">💰 Recent Payments</p>
                    <div className="space-y-1.5">
                      {[
                        { flat: "A-401", amt: "₹2,500", status: "Paid" },
                        { flat: "B-204", amt: "₹2,500", status: "Pending" },
                      ].map(({ flat, amt, status }) => (
                        <div key={flat} className="flex items-center justify-between">
                          <span className="text-xs text-slate-600 font-medium">{flat}</span>
                          <span className="text-xs font-bold text-slate-800">{amt}</span>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                            status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification card — bottom left */}
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3 z-10">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Visitor Approved</p>
                <p className="text-sm font-bold text-slate-800">Rahul Singh → A-304</p>
              </div>
            </div>

            {/* Floating payment card — top right */}
            <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3 z-10">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Payment Received</p>
                <p className="text-sm font-bold text-slate-800">₹2,500 from Flat 101</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
