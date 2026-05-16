"use client";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "SocietyPro transformed how we manage our 500-unit complex. Maintenance collection went from 60% to 95% in just 3 months!",
    name: "Rajesh Sharma",
    role: "Secretary",
    society: "Green Valley Residency, Pune",
    avatar: "RS",
    avatarBg: "bg-blue-600",
  },
  {
    quote:
      "The QR gate entry system is amazing. Our residents feel much safer now and the guard's job has become so much easier.",
    name: "Priya Mehta",
    role: "Society Admin",
    society: "Lakeview Heights, Bangalore",
    avatar: "PM",
    avatarBg: "bg-violet-600",
  },
  {
    quote:
      "Notice board and complaint system saved us countless WhatsApp arguments. Everything is now documented and trackable!",
    name: "Amit Patel",
    role: "Treasurer",
    society: "Sunrise Enclave, Ahmedabad",
    avatar: "AP",
    avatarBg: "bg-emerald-600",
  },
];

function StarRating() {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4
            bg-amber-50 border border-amber-200 text-amber-700">
            ❤️ Happy Customers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Loved by societies across India
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Join thousands of satisfied residents, admins and security staff.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative bg-white rounded-2xl border border-slate-200 p-7
                hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/8 hover:-translate-y-1
                transition-all duration-300"
            >
              {/* Quote mark */}
              <div className="absolute top-6 right-7 text-6xl text-slate-100 font-serif leading-none select-none">"</div>

              <StarRating />

              <blockquote className="text-slate-700 text-sm leading-relaxed mb-6 italic relative z-10">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 ${t.avatarBg} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} · {t.society}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
