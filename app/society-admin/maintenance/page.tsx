"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Search, IndianRupee, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

const STATUS_MAP: Record<string, { cls: string, label: string, icon: any }> = {
  "PAID": { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Paid", icon: CheckCircle },
  "PENDING": { cls: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending", icon: Clock },
  "OVERDUE": { cls: "bg-red-100 text-red-700 border-red-200", label: "Overdue", icon: AlertTriangle },
};

export default function SocietyAdminMaintenancePage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: ""
  });
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadBills = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterMonth) params.set("month", filterMonth);
    if (filterYear) params.set("year", filterYear);
    if (filterStatus) params.set("status", filterStatus);
    
    fetch(`/api/maintenance?${params.toString()}`)
      .then(r => r.json())
      .then(d => setBills(d.maintenance ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterMonth, filterYear, filterStatus]);

  useEffect(loadBills, [loadBills]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      loadBills();
      setShowGenModal(false);
    } catch (err: any) {
      alert(err.message || "Error generating bills");
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async (id: string) => {
    if (!confirm("Mark this bill as paid?")) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (!res.ok) throw new Error();
      loadBills();
    } catch { alert("Error updating status"); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bill record?")) return;
    setUpdating(id);
    try {
      await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      setBills(prev => prev.filter(b => b.id !== id));
    } catch { alert("Error deleting"); }
    finally { setUpdating(null); }
  };

  const filtered = bills.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.apartments?.[0]?.number?.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalCollected = bills.filter(b => b.status === "PAID").reduce((sum, b) => sum + Number(b.amount), 0);
  const pendingCount = bills.filter(b => b.status === "PENDING").length;
  const overdueCount = bills.filter(b => b.status === "OVERDUE").length;

  const inp = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate and track monthly maintenance bills.</p>
        </div>
        <button onClick={() => setShowGenModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm">
          <PlusCircle className="w-4 h-4" /> Generate Bills
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<IndianRupee className="w-6 h-6 text-emerald-600" />} value={`₹${totalCollected.toLocaleString('en-IN')}`} label="Total Collected" color="bg-emerald-100" />
        <StatCard icon={<Clock className="w-6 h-6 text-amber-600" />} value={pendingCount} label="Pending Bills" color="bg-amber-100" />
        <StatCard icon={<AlertTriangle className="w-6 h-6 text-red-600" />} value={overdueCount} label="Overdue Bills" color="bg-red-100" />
        <StatCard icon={<FileText className="w-6 h-6 text-blue-600" />} value={bills.length} label="Total Records" color="bg-blue-100" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Search resident or flat..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={inp + " w-auto text-sm"}>
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={inp + " w-auto text-sm"}>
          <option value="">All Years</option>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inp + " w-auto text-sm"}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setFilterMonth(""); setFilterYear(""); setFilterStatus(""); }} className="text-xs text-slate-400 hover:text-slate-600 px-2">Clear</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <IndianRupee className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">No maintenance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Resident", "Flat", "Period", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(b => {
                  const statusInfo = STATUS_MAP[b.status] || STATUS_MAP["PENDING"];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{b.user?.name}</div>
                        <div className="text-slate-500 text-xs">{b.user?.phone || "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">{b.user?.apartments?.[0]?.number || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{MONTHS[b.month - 1]} {b.year}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">₹{Number(b.amount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusInfo.cls}`}>
                          <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {b.status !== "PAID" && (
                            <button onClick={() => markPaid(b.id)} disabled={updating === b.id} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50">
                              Mark Paid
                            </button>
                          )}
                          <button onClick={() => handleDelete(b.id)} disabled={updating === b.id} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGenModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            zIndex: 1001,
            position: 'relative',
          }}>
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 text-lg">Generate Bills</h2>
              <button onClick={() => setShowGenModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleGenerate} className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800 mb-2">
                This will create a maintenance bill for <strong>all residents</strong> in the society who don't already have one for the selected month.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Month</label>
                  <select value={genForm.month} onChange={e => setGenForm({ ...genForm, month: parseInt(e.target.value) })} className={inp}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Year</label>
                  <select value={genForm.year} onChange={e => setGenForm({ ...genForm, year: parseInt(e.target.value) })} className={inp}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount per Flat (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" required min="1" value={genForm.amount} onChange={e => setGenForm({ ...genForm, amount: e.target.value })} className={inp + " pl-9"} placeholder="2500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGenModal(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={generating || !genForm.amount} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {generating ? "Generating..." : "Generate All"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
