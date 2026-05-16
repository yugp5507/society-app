"use client";

const features = [
  {
    emoji: "🔔",
    title: "Smart Notice Board",
    description: "Send announcements to all residents instantly with push notifications and read receipts.",
    color: "bg-blue-50",
    iconBg: "bg-blue-100",
    border: "border-blue-100",
    accent: "text-blue-600",
  },
  {
    emoji: "🚗",
    title: "Visitor Management",
    description: "Track every entry with our QR code system. Residents approve visits from their phone.",
    color: "bg-violet-50",
    iconBg: "bg-violet-100",
    border: "border-violet-100",
    accent: "text-violet-600",
  },
  {
    emoji: "💰",
    title: "Online Maintenance",
    description: "Collect payments via UPI, cards & net banking. Automated reminders and receipts.",
    color: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    border: "border-emerald-100",
    accent: "text-emerald-600",
  },
  {
    emoji: "📝",
    title: "Complaint System",
    description: "Raise and track complaints with real-time status updates. Nothing falls through the cracks.",
    color: "bg-amber-50",
    iconBg: "bg-amber-100",
    border: "border-amber-100",
    accent: "text-amber-600",
  },
  {
    emoji: "🏊",
    title: "Amenity Booking",
    description: "Book clubhouse, gym & ground online. Prevent conflicts with a shared calendar.",
    color: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    border: "border-cyan-100",
    accent: "text-cyan-600",
  },
  {
    emoji: "👮",
    title: "Security Guard Panel",
    description: "Digital gate entry with QR codes. Guards manage visitors from a dedicated dashboard.",
    color: "bg-rose-50",
    iconBg: "bg-rose-100",
    border: "border-rose-100",
    accent: "text-rose-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4
            bg-blue-50 border border-blue-200 text-blue-700">
            ✨ Packed with Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Everything your society needs
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            One platform for residents, admins and security — designed for the way Indian societies work.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group relative rounded-2xl border ${f.border} ${f.color} p-6
                hover:shadow-xl hover:shadow-slate-900/8 hover:-translate-y-1.5
                transition-all duration-300 cursor-default`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm`}>
                {f.emoji}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>

              {/* Hover arrow */}
              <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                Learn more
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
