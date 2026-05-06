type Booking = {
  id: string;
  amenity: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending";
};

type Notice = {
  id: string;
  title: string;
  date: string;
};

const navItems: string[] = [
  "Dashboard",
  "My Family",
  "My Vehicles",
  "Book Amenity",
  "Notice Board",
  "My Complaints",
  "Visitor Entry",
  "Pay Maintenance",
];

const stats = [
  { label: "Family Members", value: "4" },
  { label: "Vehicles", value: "2" },
  { label: "Pending Complaints", value: "1" },
  { label: "Maintenance Due", value: "INR 3,250" },
];

const notices: Notice[] = [
  { id: "n1", title: "Clubhouse closed for deep cleaning on Sunday", date: "May 09, 2026" },
  { id: "n2", title: "Power backup testing this Friday, 11 AM", date: "May 10, 2026" },
  { id: "n3", title: "Security drill for all towers", date: "May 14, 2026" },
];

const bookings: Booking[] = [
  { id: "b1", amenity: "Community Hall", date: "May 11, 2026", time: "6:00 PM - 8:00 PM", status: "Confirmed" },
  { id: "b2", amenity: "Badminton Court", date: "May 13, 2026", time: "7:00 AM - 8:00 AM", status: "Pending" },
  { id: "b3", amenity: "Swimming Pool", date: "May 16, 2026", time: "5:00 PM - 6:00 PM", status: "Confirmed" },
];

export default function ResidentDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[250px_1fr] md:p-6">
        <aside className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500">SocietyPro</p>
            <h1 className="text-xl font-bold text-[#1e3a5f]">Resident Panel</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  item === "Dashboard"
                    ? "bg-[#1e3a5f] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">My Home Dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep track of family, bookings, notices, and dues.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-[#1e3a5f]">{stat.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-2xl bg-white p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">Recent Notices</h3>
              <ul className="mt-4 space-y-3">
                {notices.map((notice) => (
                  <li key={notice.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-800">{notice.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{notice.date}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">My Upcoming Bookings</h3>
              <ul className="mt-4 space-y-3">
                {bookings.map((booking) => (
                  <li key={booking.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{booking.amenity}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.date} - {booking.time}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          booking.status === "Confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
