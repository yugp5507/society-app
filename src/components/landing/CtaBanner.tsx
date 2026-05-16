"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section id="contact" className="py-20 relative overflow-hidden" style={{ background: "#0F172A" }}>
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)", transform: "translate(-40%, -40%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)", transform: "translate(30%, 40%)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6
          bg-blue-600/20 border border-blue-500/30 text-blue-300">
          🎉 Join 500+ Societies
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
          Ready to modernize
          <br />
          <span className="text-blue-400">your society?</span>
        </h2>

        <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
          Join 500+ societies already using SocietyPro. Setup takes less than 30 minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-4 rounded-xl
              hover:bg-blue-50 transition-all duration-200 shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-0.5 text-base"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border-2 border-slate-600 text-slate-300 font-semibold px-8 py-4 rounded-xl
              hover:border-slate-400 hover:text-white transition-all duration-200 text-base"
          >
            Already a member? Login
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500 font-medium">
          No credit card required · Free plan available · Cancel anytime
        </p>
      </div>
    </section>
  );
}
