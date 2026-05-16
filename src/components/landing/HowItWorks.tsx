"use client";
import { Building2, Mail, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "Create Society",
    description: "Admin registers your society on SocietyPro. Add buildings, towers, and flats in minutes.",
    color: "bg-blue-600",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-600",
  },
  {
    number: "02",
    icon: Mail,
    title: "Invite Residents",
    description: "Send unique invite links to each flat via WhatsApp or email. Residents join in one click.",
    color: "bg-violet-600",
    lightBg: "bg-violet-50",
    border: "border-violet-200",
    textColor: "text-violet-600",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Go Live!",
    description: "Everyone's connected. All features unlocked — payments, notices, visitors, complaints.",
    color: "bg-emerald-600",
    lightBg: "bg-emerald-50",
    border: "border-emerald-200",
    textColor: "text-emerald-600",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28"
      style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4
            bg-emerald-50 border border-emerald-200 text-emerald-700">
            🚀 Quick Setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Get started in 3 simple steps
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            No technical knowledge required. Be up and running in less than 30 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-16 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-0.5
            bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-300 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
                {/* Step circle */}
                <div className={`relative w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-lg mb-6`}
                  style={{ boxShadow: `0 8px 24px ${i === 0 ? "rgba(37,99,235,0.35)" : i === 1 ? "rgba(124,58,237,0.35)" : "rgba(5,150,105,0.35)"}` }}
                >
                  <Icon className="w-7 h-7 text-white" />
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center
                    text-xs font-extrabold text-slate-700 shadow-md border border-slate-100">
                    {i + 1}
                  </div>
                </div>

                {/* Content card */}
                <div className={`w-full rounded-2xl border ${step.border} ${step.lightBg} p-6`}>
                  <p className={`text-xs font-bold ${step.textColor} mb-2 tracking-widest uppercase`}>
                    Step {step.number}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
