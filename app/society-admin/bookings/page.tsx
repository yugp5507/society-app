"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Check, X, IndianRupee, Calendar } from "lucide-react";

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  PENDING:   { cls: "bg-amber-100 text-amber-700 border-amber-200",   label: "⏳ Pending" },
  APPROVED:  { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "✓ Approved" },
  REJECTED:  { cls: "bg-red-100 text-red-700 border-red-200",         label: "✗ Rejected" },
  CANCELLED: { cls: "bg-slate-100 text-slate-500 border-slate-200",   label: "○ Cancelled" },
  COMPLETED: { cls: "bg-blue-100 text-blue-700 border-blue-200",      label: "★ Completed" },
};

const PAY_CFG: Record<string, { cls: string; label: string }> = {
  NOT_REQUIRED: { cls: "bg-slate-100 text-slate-500",  label: "Free" },
  PENDING:      { cls: "bg-amber-100 text-amber-700",  label: "Unpaid" },
  PAID:         { cls: "bg-emerald-100 text-emerald-700", label: "Paid" },
  REFUNDED:     { cls: "bg-blue-100 text-blue-700",    label: "Refunded" },
};

function StatCard({ icon, value, label, sub, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-xl mb-3`}>{icon}</div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function SocietyAdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterMonth) params.set("month", filterMonth);
    fetch(`/api/bookings?${params}`)
      .then(r => r.json())
      .then(d => setBookings(d.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterStatus, filterMonth]);

  useEffect(load, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const { booking } = await res.json();
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...booking } : b));
      if (selected?.id === id) setSelected((prev: any) => ({ ...prev, ...booking }));
    } catch { alert("Error updating booking"); }
    finally { setUpdating(null); }
  };

  const filtered = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(q) ||
      b.amenity?.name?.toLowerCase().includes(q) ||
      b.user?.apartments?.[0]?.number?.toLowerCase().includes(q)
    );
  });

  // Stats
  const pending = bookings.filter(b => b.status === "PENDING").length;
  const thisMonthAll = bookings.length;
  const revenue = bookings
    .filter(b => b.paymentStatus === "PAID")
    .reduce((s, b) => s + Number(b.amountPaid || 0), 0);
  const amenityCount: Record<string, number> = {};
  bookings.forEach(b => { amenityCount[b.amenity?.name] = (amenityCount[b.amenity?.name] || 0) + 1; });
  const mostBooked = Object.entries(amenityCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Approve, reject, and manage all amenity bookings.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📅" value={thisMonthAll} label="Total This Month" color="bg-blue-50" />
        <StatCard icon="⏳" value={pending} label="Pending Approvals" color="bg-amber-50" sub={pending > 0 ? "Action needed" : undefined} />
        <StatCard icon="💰" value={`₹${revenue.toFixed(0)}`} label="Revenue Collected" color="bg-emerald-50" />
        <StatCard icon="🏆" value={mostBooked} label="Most Booked" color="bg-purple-50" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Search resident, amenity…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setFilterStatus(""); }} className="text-xs text-slate-400 hover:text-slate-600 px-2">Clear</button>
      </div>

      {/* Two-column: table + detail */}
      <div className="flex gap-5 min-h-0">
        {/* Table */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${selected ? "flex-[2]" : "flex-1"}`}>
          {loading ? (
            <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Resident", "Amenity", "Date & Slot", "Guests", "Payment", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(b => {
                    const sc = STATUS_CFG[b.status] ?? STATUS_CFG.PENDING;
                    const pc = PAY_CFG[b.paymentStatus] ?? PAY_CFG.NOT_REQUIRED;
                    return (
                      <tr key={b.id} onClick={() => setSelected(b)}
                        className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${selected?.id === b.id ? "bg-blue-50" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 text-xs">{b.user?.name}</div>
                          <div className="text-slate-400 text-xs">{b.user?.apartments?.[0]?.number ?? "—"}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 text-xs">{b.amenity?.name}</td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-medium text-slate-900">{new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                          <div className="text-slate-400">{b.startTime}–{b.endTime}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{b.guestCount}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.cls}`}>{pc.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          {b.status === "PENDING" && (
                            <div className="flex gap-1">
                              <button onClick={e => { e.stopPropagation(); updateStatus(b.id, "APPROVED"); }}
                                disabled={updating === b.id}
                                className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); updateStatus(b.id, "REJECTED"); }}
                                disabled={updating === b.id}
                                className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          {(b.status === "APPROVED") && (
                            <button onClick={e => { e.stopPropagation(); updateStatus(b.id, "CANCELLED"); }}
                              className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 border border-slate-200 rounded-lg hover:border-red-200 transition-colors">
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 self-start sticky top-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Booking Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              {[
                ["Amenity", selected.amenity?.name],
                ["Resident", selected.user?.name],
                ["Flat", selected.user?.apartments?.[0]?.number ?? "—"],
                ["Date", new Date(selected.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })],
                ["Slot", `${selected.startTime} – ${selected.endTime}`],
                ["Guests", selected.guestCount],
                ["Purpose", selected.purpose ?? "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-900 text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">Payment</span>
              <div className="text-right">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAY_CFG[selected.paymentStatus]?.cls}`}>
                  {PAY_CFG[selected.paymentStatus]?.label}
                </span>
                {selected.amenity?.isPaid && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 justify-end">
                    <IndianRupee className="w-3 h-3" /> {Number(selected.amenity.pricePerSlot ?? 0).toFixed(0)}
                  </div>
                )}
              </div>
            </div>

            {selected.status === "PENDING" && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => updateStatus(selected.id, "APPROVED")} disabled={updating === selected.id}
                  className="py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50">
                  ✓ Approve
                </button>
                <button onClick={() => updateStatus(selected.id, "REJECTED")} disabled={updating === selected.id}
                  className="py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                  ✗ Reject
                </button>
              </div>
            )}
            {selected.status === "APPROVED" && (
              <button onClick={() => updateStatus(selected.id, "CANCELLED")} disabled={updating === selected.id}
                className="py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
                Cancel Booking
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
