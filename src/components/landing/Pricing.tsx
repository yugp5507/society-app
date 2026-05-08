import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "Free",
    sub: "Forever",
    units: "Up to 50 units",
    highlight: false,
    features: ["Notice Board", "Resident Portal", "Visitor Log", "Basic Complaints", "Email Support"],
  },
  {
    name: "Standard",
    price: "₹999",
    sub: "per month",
    units: "Up to 200 units",
    highlight: true,
    features: ["Everything in Basic", "Maintenance Payments", "Amenity Booking", "Sub Admin Roles", "WhatsApp Notifications", "Priority Support"],
  },
  {
    name: "Premium",
    price: "₹2,499",
    sub: "per month",
    units: "Unlimited units",
    highlight: false,
    features: ["Everything in Standard", "Multi-Society Dashboard", "Custom Reports", "API Access", "Dedicated Account Manager", "24/7 Phone Support"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-600 max-w-xl mx-auto">No hidden charges. No per-resident fees. Just flat pricing for your whole society.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map(({ name, price, sub, units, highlight, features }) => (
            <div key={name} className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              highlight
                ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30 scale-105"
                : "bg-white border border-slate-200 hover:shadow-lg hover:border-blue-200"
            }`}>
              {highlight && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}
              <div className="p-8 flex-1">
                <p className={`text-sm font-semibold uppercase tracking-widest mb-4 ${highlight ? "text-blue-200" : "text-blue-600"}`}>{name}</p>
                <div className="mb-1">
                  <span className={`text-4xl font-extrabold ${highlight ? "text-white" : "text-slate-900"}`}>{price}</span>
                  <span className={`text-sm ml-1 ${highlight ? "text-blue-200" : "text-slate-500"}`}>/{sub}</span>
                </div>
                <p className={`text-sm mb-8 ${highlight ? "text-blue-200" : "text-slate-500"}`}>{units}</p>
                <ul className="space-y-3">
                  {features.map(f => (
                    <li key={f} className={`flex items-start gap-3 text-sm ${highlight ? "text-blue-100" : "text-slate-600"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${highlight ? "bg-white/20" : "bg-blue-50"}`}>
                        <Check className={`w-3 h-3 ${highlight ? "text-white" : "text-blue-600"}`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-8 pb-8">
                <Link href="/login" className={`block text-center font-semibold py-3 rounded-xl transition-all ${
                  highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}>
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
