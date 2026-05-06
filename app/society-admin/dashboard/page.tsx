type Notice = {
  id: string;
  title: string;
  date: string;
  category: string;
};

type Complaint = {
  id: string;
  title: string;
  resident: string;
  status: "Open" | "In Progress" | "Resolved";
};

const navItems: string[] = [
  "Dashboard",
  "Residents",
  "Buildings & Apartments",
  "Notice Board",
  "Complaints",
  "Amenity Booking",
  "Visitor Log",
  "Maintenance",
];

const stats = [
  { label: "Total Residents", value: "862" },
  { label: "Pending Complaints", value: "27" },
  { label: "Pending Bookings", value: "14" },
  { label: "Unpaid Maintenance", value: "INR 6.8L" },
];

const notices: Notice[] = [
  { id: "n1", title: "Water supply maintenance on Saturday", date: "May 08, 2026", category: "Utility" },
  { id: "n2", title: "Annual general meeting notice", date: "May 12, 2026", category: "General" },
  { id: "n3", title: "Parking stickers renewal", date: "May 15, 2026", category: "Parking" },
];

const complaints: Complaint[] = [
  { id: "c1", title: "Lift not working in Tower B", resident: "Amit Verma", status: "Open" },
  { id: "c2", title: "Basement seepage issue", resident: "Neha Joshi", status: "In Progress" },
  { id: "c3", title: "Streetlight malfunction near gate 2", resident: "Rakesh S.", status: "Resolved" },
];

export default function SocietyAdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[250px_1fr] md:p-6">
        <aside className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500">SocietyPro</p>
            <h1 className="text-xl font-bold text-[#1e3a5f]">Society Admin</h1>
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
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Society Operations Dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">
              Track residents, complaints, bookings, and maintenance in real-time.
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
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-800">{notice.title}</p>
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {notice.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{notice.date}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">Recent Complaints</h3>
              <ul className="mt-4 space-y-3">
                {complaints.map((complaint) => (
                  <li key={complaint.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-medium text-slate-800">{complaint.title}</p>
                    <p className="mt-1 text-sm text-slate-600">By {complaint.resident}</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        complaint.status === "Open"
                          ? "bg-red-100 text-red-700"
                          : complaint.status === "In Progress"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {complaint.status}
                    </span>
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
