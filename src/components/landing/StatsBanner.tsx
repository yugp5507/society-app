"use client";

const stats = [
  { value: "500+", label: "Societies", emoji: "🏘️" },
  { value: "50,000+", label: "Residents", emoji: "👥" },
  { value: "98%", label: "Satisfaction Rate", emoji: "😊" },
  { value: "₹2Cr+", label: "Collected", emoji: "💰" },
];

export default function StatsBanner() {
  return (
    <section id="stats" className="py-16 relative overflow-hidden" style={{ background: "#0F172A" }}>
      {/* Subtle glow blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map(({ value, label, emoji }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <span className="text-3xl mb-2">{emoji}</span>
              <p className="text-4xl md:text-5xl font-extrabold text-white mb-1 tracking-tight">
                {value}
              </p>
              <p className="text-sm font-medium text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
