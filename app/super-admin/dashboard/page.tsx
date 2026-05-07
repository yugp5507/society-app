import Sidebar from "@/src/components/Sidebar";

type SocietyStatus = "Active" | "Inactive";

type Society = {
  id: string;
  name: string;
  city: string;
  residents: number;
  adminName: string;
  status: SocietyStatus;
};

type ActivityItem = {
  id: string;
  title: string;
  time: string;
};

const societies: Society[] = [
  { id: "1", name: "Green Valley Residency", city: "Pune", residents: 420, adminName: "Anil Mehta", status: "Active" },
  { id: "2", name: "Lakeview Heights", city: "Bengaluru", residents: 305, adminName: "Priya Nair", status: "Active" },
  { id: "3", name: "Sunrise Enclave", city: "Mumbai", residents: 510, adminName: "Rahul Shah", status: "Inactive" },
  { id: "4", name: "Maple Towers", city: "Hyderabad", residents: 280, adminName: "Sneha Reddy", status: "Active" },
];

const activities: ActivityItem[] = [
  { id: "a1", title: "New society Maple Towers onboarded", time: "10 mins ago" },
  { id: "a2", title: "Society admin added for Lakeview Heights", time: "1 hour ago" },
  { id: "a3", title: "Maintenance payout settled for Green Valley Residency", time: "3 hours ago" },
  { id: "a4", title: "Complaint escalation triggered for Sunrise Enclave", time: "Yesterday" },
];

const stats = [
  { label: "Total Societies", value: "124" },
  { label: "Total Residents", value: "28,540" },
  { label: "Total Revenue", value: "INR 2.4 Cr" },
  { label: "Active Complaints", value: "318" },
];

export default function SuperAdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[250px_1fr] md:p-6">
        <Sidebar variant="super-admin" />

        <main className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">Platform Overview</h2>
                <p className="text-sm text-slate-600">Monitor every society from one place.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                  Add New Society
                </button>
                <button className="rounded-lg border border-[#1e3a5f] px-4 py-2 text-sm font-semibold text-[#1e3a5f] hover:bg-slate-50">
                  Add Society Admin
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-[#1e3a5f]">{stat.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <article className="rounded-2xl bg-white p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">All Societies</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">City</th>
                      <th className="px-3 py-2 font-medium">Total Residents</th>
                      <th className="px-3 py-2 font-medium">Admin Name</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {societies.map((society) => (
                      <tr key={society.id} className="border-b border-slate-100">
                        <td className="px-3 py-3 font-medium text-slate-800">{society.name}</td>
                        <td className="px-3 py-3 text-slate-700">{society.city}</td>
                        <td className="px-3 py-3 text-slate-700">{society.residents}</td>
                        <td className="px-3 py-3 text-slate-700">{society.adminName}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              society.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {society.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">Recent Activity</h3>
              <ul className="mt-4 space-y-4">
                {activities.map((item) => (
                  <li key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.time}</p>
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
