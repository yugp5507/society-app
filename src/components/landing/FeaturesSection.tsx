import { Bell, Car, IndianRupee, FileText, CalendarCheck, Users } from "lucide-react";

const features = [
  { icon: Bell, title: "Notice Board", desc: "Instant announcements to all residents", color: "bg-blue-50 text-blue-600" },
  { icon: Car, title: "Visitor Management", desc: "Track every entry and exit", color: "bg-violet-50 text-violet-600" },
  { icon: IndianRupee, title: "Maintenance Payments", desc: "Online payments with receipts", color: "bg-emerald-50 text-emerald-600" },
  { icon: FileText, title: "Complaint System", desc: "Raise and track complaints easily", color: "bg-amber-50 text-amber-600" },
  { icon: CalendarCheck, title: "Amenity Booking", desc: "Book clubhouse, gym, ground", color: "bg-rose-50 text-rose-600" },
  { icon: Users, title: "Family Management", desc: "Add family members and vehicles", color: "bg-cyan-50 text-cyan-600" },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Everything your society needs</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">One platform to manage your entire residential community — from notices to payments.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
