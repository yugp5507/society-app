"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download, Flag } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    INSIDE: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "● Inside" },
    LEFT:   { cls: "bg-slate-100 text-slate-600 border-slate-200",       label: "● Left" },
    DENIED: { cls: "bg-red-100 text-red-700 border-red-200",             label: "● Denied" },
  };
  const s = map[status] ?? map.LEFT;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-xs text-slate-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

export default function SocietyAdminVisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterStatus, setFilterStatus] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDate) params.set("date", filterDate);
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);
    fetch(`/api/gate-entry/admin?${params.toString()}`)
      .then(r => r.json())
      .then(d => setVisitors(d.entries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterDate, filterStatus, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Stats
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayAll = visitors.filter(v => new Date(v.entryTime) >= todayStart);
  const insideNow = visitors.filter(v => v.status === "INSIDE").length;
  const deliveries = todayAll.filter(v => v.purpose === "Delivery").length;
  const cabs = todayAll.filter(v => v.purpose === "Cab/Auto").length;

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Flat No", "Purpose", "Vehicle", "Entry Time", "Exit Time", "Status"];
    const rows = visitors.map(v => [
      v.name, v.phone ?? "", v.flatNumber, v.purpose,
      v.vehiclePlate ?? "",
      new Date(v.entryTime).toLocaleString("en-IN"),
      v.exitTime ? new Date(v.exitTime).toLocaleString("en-IN") : "",
      v.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `visitor-log-${filterDate || "all"}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitor Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">All gate entries across your society.</p>
        </div>
        <button
          onClick={exportCSV}
          className="self-start sm:self-auto flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" value={todayAll.length} label="Total Today" color="bg-blue-50" />
        <StatCard icon="🟢" value={insideNow} label="Currently Inside" color="bg-emerald-50" />
        <StatCard icon="📦" value={deliveries} label="Deliveries Today" color="bg-amber-50" />
        <StatCard icon="🚕" value={cabs} label="Cabs Today" color="bg-purple-50" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search name or flat…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="INSIDE">Inside</option>
            <option value="LEFT">Left</option>
            <option value="DENIED">Denied</option>
          </select>
          <button
            onClick={() => { setSearch(""); setFilterDate(""); setFilterStatus(""); }}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-3">🚪</div>
            <p className="font-medium">No visitor records found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[780px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Visitor", "Phone", "Flat No", "Purpose", "Vehicle", "Entry", "Exit", "Status", "Flag"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visitors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{v.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{v.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">{v.flatNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{v.purpose}</td>
                    <td className="px-4 py-3">
                      {v.vehiclePlate ? (
                        <span className="font-mono text-xs bg-slate-900 text-white px-2 py-0.5 rounded">{v.vehiclePlate}</span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmt(v.entryTime)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {v.exitTime ? fmt(v.exitTime) : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        title="Flag as suspicious"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          Showing {visitors.length} record{visitors.length !== 1 ? "s" : ""}
        </div>
      </div>
    </>
  );
}
