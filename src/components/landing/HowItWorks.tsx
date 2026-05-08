import { Building2, UserPlus, Zap } from "lucide-react";

const steps = [
  { num: "01", icon: Building2, title: "Create your Society", desc: "Super Admin registers your society, adds buildings and apartment numbers in minutes." },
  { num: "02", icon: UserPlus, title: "Add Residents", desc: "Generate unique invite links per flat. Residents click the link to join — no manual entry." },
  { num: "03", icon: Zap, title: "Go Live!", desc: "Everyone is connected instantly. Notices, payments, complaints — all live from day one." },
];

export default function HowItWorks() {
  return (
    <section id="about" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Get started in 3 simple steps</h2>
          <p className="text-slate-600 max-w-xl mx-auto">From setup to fully operational in less than a day.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
          {steps.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-blue-100 shadow-lg shadow-blue-600/10 flex items-center justify-center">
                  <Icon className="w-10 h-10 text-blue-600" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-lg">
                  {num.slice(1)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
