"use client";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    description: "Perfect for small societies getting started",
    features: [
      "Up to 50 units",
      "Notice board",
      "Basic complaints",
      "Visitor log",
      "Email support",
    ],
    cta: "Get Started Free",
    ctaLink: "/signup",
    highlighted: false,
    badge: null,
  },
  {
    name: "Standard",
    price: "₹999",
    period: "/month",
    description: "Everything you need for a well-run society",
    features: [
      "Up to 200 units",
      "All Basic features",
      "Maintenance payments (UPI/Card)",
      "Amenity booking",
      "QR gate entry",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlighted: true,
    badge: "⭐ Most Popular",
  },
  {
    name: "Premium",
    price: "₹2,499",
    period: "/month",
    description: "For large societies and housing corporations",
    features: [
      "Unlimited units",
      "All Standard features",
      "Custom domain",
      "Advanced analytics",
      "Dedicated support",
      "Multi-society management",
    ],
    cta: "Contact Sales",
    ctaLink: "/signup",
    highlighted: false,
    badge: null,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4
            bg-blue-50 border border-blue-200 text-blue-700">
            💎 Simple Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            No hidden charges. Cancel anytime. Start for free.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1
                ${plan.highlighted
                  ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/35 border-2 border-blue-500 scale-105"
                  : "bg-white border border-slate-200 hover:shadow-xl hover:shadow-slate-900/10"
                }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-3 py-1 bg-amber-400 text-slate-900 text-xs font-extrabold rounded-full shadow-md whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-5">
                <p className={`text-xs font-extrabold tracking-widest uppercase mb-2 ${plan.highlighted ? "text-blue-200" : "text-blue-600"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm font-medium mb-1 ${plan.highlighted ? "text-blue-200" : "text-slate-500"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${plan.highlighted ? "text-blue-100" : "text-slate-500"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Divider */}
              <div className={`w-full h-px mb-5 ${plan.highlighted ? "bg-blue-500" : "bg-slate-100"}`} />

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "bg-blue-500" : "bg-blue-50"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? "text-white" : "text-blue-600"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? "text-blue-50" : "text-slate-700"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaLink}
                className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all duration-200
                  ${plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50 shadow-md"
                    : "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom reassurance */}
        <p className="text-center text-sm text-slate-400 mt-10">
          All plans include a 14-day free trial. No credit card required. 🎉
        </p>
      </div>
    </section>
  );
}
