import Link from "next/link";
import { ArrowRight, Play, Users, Home, IndianRupee, LayoutDashboard, Bell, TrendingUp, Building2 } from "lucide-react";

const badges = [
  { icon: Home, label: "500+ Societies" },
  { icon: Users, label: "50,000+ Residents" },
  { icon: IndianRupee, label: "₹2Cr+ Collected" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white pt-20 pb-16 md:pt-28 md:pb-24">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Trusted by 500+ societies across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Smart Society<br />Management<br />
              <span className="text-blue-600">for Modern India</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              Manage apartments, complaints, payments, visitors and more — all in one powerful platform built for Indian societies.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/login" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 transition-all">
                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                </div>
                Watch Demo
              </button>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="relative">
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-slate-400 font-mono border border-slate-200">app.societypro.in/dashboard</div>
              </div>
              {/* Mock dashboard */}
              <div className="flex h-64 sm:h-80">
                {/* Sidebar */}
                <div className="w-14 bg-slate-900 flex flex-col items-center py-4 gap-4 flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
                  {[LayoutDashboard, Users, Bell, IndianRupee].map((Icon, i) => (
                    <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-blue-600/20" : "hover:bg-slate-800"}`}>
                      <Icon className={`w-4 h-4 ${i === 0 ? "text-blue-400" : "text-slate-500"}`} />
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 bg-slate-50 p-4 space-y-3 overflow-hidden">
                  <div className="flex gap-3">
                    {[["124", "Societies", "bg-blue-50 border-blue-100 text-blue-700"], ["28.5k", "Residents", "bg-emerald-50 border-emerald-100 text-emerald-700"], ["318", "Complaints", "bg-amber-50 border-amber-100 text-amber-700"]].map(([v, l, cls]) => (
                      <div key={l} className={`flex-1 rounded-xl border p-3 ${cls}`}>
                        <p className="text-lg font-bold">{v}</p>
                        <p className="text-xs font-medium opacity-80">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Recent Notices</p>
                    {["Water supply off on 12 May", "Maintenance due by 31 May", "Gym closes at 9 PM"].map((n, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <p className="text-xs text-slate-700 truncate">{n}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 text-emerald-600" /></div>
              <div><p className="text-xs text-slate-500">New Resident</p><p className="text-sm font-bold text-slate-800">Joined Tower A, 404</p></div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><IndianRupee className="w-4 h-4 text-blue-600" /></div>
              <div><p className="text-xs text-slate-500">Payment Received</p><p className="text-sm font-bold text-slate-800">₹2,500 from Flat 101</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
