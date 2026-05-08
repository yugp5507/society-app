import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kulkarni",
    role: "Society Chairman",
    society: "Green Valley Residency, Pune",
    quote: "SocietyPro transformed how we manage our 300-unit society. Maintenance collection went from 60% to 95% in just 2 months!",
    avatar: "RK",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Secretary",
    society: "Lakeview Heights, Bengaluru",
    quote: "The visitor management system gives us complete security peace of mind. Every family loves the transparency it brings.",
    avatar: "PN",
    rating: 5,
  },
  {
    name: "Amit Shah",
    role: "Society Admin",
    society: "Maple Towers, Hyderabad",
    quote: "Setup took less than 2 hours for our 200 flats. The invite link system for onboarding residents is absolute genius.",
    avatar: "AS",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Loved by societies across India</h2>
          <p className="text-slate-600 max-w-xl mx-auto">Real reviews from real society managers.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, society, quote, avatar, rating }) => (
            <div key={name} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <div className="flex gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic flex-1">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{name}</p>
                  <p className="text-xs text-slate-500">{role} · {society}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
