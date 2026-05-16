"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Clock, User, Car, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

const PURPOSES = ["Meeting Resident", "Delivery", "Service/Repair", "Cab/Auto", "Guest", "Other"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    INSIDE: "bg-blue-100 text-blue-700 border-blue-200",
    LEFT:   "bg-slate-100 text-slate-600 border-slate-200",
    DENIED: "bg-red-100 text-red-700 border-red-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
  };
  const labels: Record<string, string> = { 
    INSIDE: "● Inside", 
    LEFT: "● Left", 
    DENIED: "● Denied", 
    APPROVED: "● Approved",
    PENDING: "⏳ Pending"
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${map[status] ?? map.LEFT}`}>
      {labels[status] ?? status}
    </span>
  );
}

function fmt(dt: string) {
  if (!dt) return "N/A";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function ResidentVisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [expected, setExpected] = useState<any[]>([]);
  const [tab, setTab] = useState<"visitors" | "preapprove">("visitors");
  const [loadingV, setLoadingV] = useState(true);
  const [loadingE, setLoadingE] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  const [form, setForm] = useState({
    name: "", phone: "", vehiclePlate: "", purpose: PURPOSES[0],
    expectedDate: "", expectedTime: "", apartmentNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const [vData, gData] = await Promise.all([
        fetch(`/api/visitors${filterDate ? `?date=${filterDate}` : "?today=true"}`).then(r => r.json()),
        fetch('/api/gate-entry/resident').then(r => r.json())
      ]);
      const vList = vData.visitors || [];
      const gList = gData.entries || [];
      
      let filteredGList = gList;
      if (filterDate) {
        const filterStart = new Date(filterDate).setHours(0,0,0,0);
        filteredGList = gList.filter((g: any) => new Date(g.entryTime).setHours(0,0,0,0) === filterStart);
      }
      
      // Remove duplicates if any (vList and gList might overlap)
      const merged = [...vList, ...filteredGList].sort((a, b) => new Date(b.entryTime || b.createdAt).getTime() - new Date(a.entryTime || a.createdAt).getTime());
      
      // Deduplicate by ID
      const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
      setVisitors(unique);
    } catch (e) {} finally {
      setLoadingV(false);
    }
  };

  const loadExpected = async () => {
    try {
      const d = await fetch("/api/visitors/expected").then(r => r.json());
      setExpected(d.expected ?? []);
    } catch (e) {} finally {
      setLoadingE(false);
    }
  };

  useEffect(() => {
    loadData();
    const int = setInterval(loadData, 10000); // Refresh every 10s for real-time status
    return () => clearInterval(int);
  }, [filterDate]);

  useEffect(() => {
    loadExpected();
  }, []);

  const handlePreApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const expectedDate = new Date(`${form.expectedDate}T${form.expectedTime || "00:00"}`).toISOString();
      const res = await fetch("/api/visitors/expected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, phone: form.phone,
          vehiclePlate: form.vehiclePlate, purpose: form.purpose,
          expectedDate, apartmentNumber: form.apartmentNumber,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      loadExpected();
      setForm({ name: "", phone: "", vehiclePlate: "", purpose: PURPOSES[0], expectedDate: "", expectedTime: "", apartmentNumber: "" });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message || "Error adding expected visitor");
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none";
  const lbl = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  const pendingVisitors = visitors.filter(v => v.status === "PENDING");
  const otherVisitors = visitors.filter(v => v.status !== "PENDING");

  const expectedToday = expected.filter(ev => {
    const today = new Date().setHours(0,0,0,0);
    return new Date(ev.expectedDate).setHours(0,0,0,0) === today && !ev.isVisited;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Visitor Management</h1>
          <p className="text-sm text-slate-500 font-medium">Track entries and pre-approve guests.</p>
        </div>
        <button
          onClick={() => { setTab("preapprove"); setShowForm(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Pre-approve Guest
        </button>
      </div>

      {/* Expected Today - Highlight Section */}
      {expectedToday.length > 0 && tab === "visitors" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="font-black text-emerald-900 uppercase tracking-wider">Expected Today</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expectedToday.map(ev => (
              <div key={ev.id} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">{ev.name.charAt(0)}</div>
                <div>
                  <div className="font-black text-slate-900 text-sm">{ev.name}</div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Expected {new Date(ev.expectedDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl max-w-sm">
        {(["visitors", "preapprove"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "visitors" ? "🚪 Visitors" : "📋 Planned"}
          </button>
        ))}
      </div>

      {tab === "visitors" ? (
        <div className="space-y-6">
          {/* Pending Requests */}
          {pendingVisitors.length > 0 && (
            <div className="animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest">Waiting for Approval</h2>
              </div>
              <div className="space-y-3">
                {pendingVisitors.map(v => <VisitorCard key={v.id} visitor={v} highlight />)}
              </div>
            </div>
          )}

          {/* Date filter */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Filter Entries:</label>
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {filterDate && (
              <button onClick={() => setFilterDate("")} className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                Clear
              </button>
            )}
          </div>

          {loadingV ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {otherVisitors.map(v => <VisitorCard key={v.id} visitor={v} />)}
              {visitors.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                  <div className="text-5xl mb-4">🏠</div>
                  <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No visitor records yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pre-approve form */}
          {showForm && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-8 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-slate-900 text-xl">Pre-approve Guest</h2>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:text-slate-600 transition-colors">✕</button>
              </div>
              <form onSubmit={handlePreApprove} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lbl}>Guest Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} placeholder="Enter name" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={lbl}>Expected Date *</label>
                    <input type="date" required value={form.expectedDate} onChange={e => setForm({ ...form, expectedDate: e.target.value })} className={inp} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={lbl}>Expected Time</label>
                    <input type="time" value={form.expectedTime} onChange={e => setForm({ ...form, expectedTime: e.target.value })} className={inp} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={lbl}>Purpose *</label>
                    <select required value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className={inp}>
                      {PURPOSES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={lbl}>Flat Number *</label>
                    <input required value={form.apartmentNumber} onChange={e => setForm({ ...form, apartmentNumber: e.target.value.toUpperCase() })} className={inp} placeholder="e.g. A-101" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-100 active:scale-95 transition-all">
                  {saving ? "Saving…" : "Confirm Pre-approval"}
                </button>
              </form>
            </div>
          )}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 font-black text-sm hover:border-blue-100 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-3 bg-white hover:bg-blue-50/30 group"
            >
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="uppercase tracking-widest">Plan a future visit</span>
            </button>
          )}

          {/* Expected list */}
          <div className="space-y-4">
            {expected.map(ev => (
              <div key={ev.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xl border border-slate-100">
                    {ev.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-lg leading-tight">{ev.name}</div>
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {fmt(ev.expectedDate)}
                      <span className="text-slate-200">|</span>
                      {ev.purpose}
                    </div>
                  </div>
                </div>
                <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest ${ev.isVisited ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                  {ev.isVisited ? "Visited" : "Pending"}
                </div>
              </div>
            ))}
            {expected.length === 0 && !showForm && (
              <div className="text-center py-20 text-slate-300">
                <p className="font-black uppercase tracking-widest text-sm">No planned visits found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VisitorCard({ visitor: v, highlight = false }: { visitor: any, highlight?: boolean }) {
  return (
    <div className={`bg-white border rounded-[2rem] p-6 shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md ${highlight ? 'border-amber-200 ring-4 ring-amber-50' : 'border-slate-100'}`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 border ${highlight ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
          {v.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-black text-slate-900 text-lg leading-tight truncate mb-1">{v.name}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              {v.status === 'PENDING' ? 'Requested ' + getTimeAgo(v.entryTime) : fmt(v.entryTime)}
            </div>
            <div className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
              <Info className="w-3.5 h-3.5" />
              {v.purpose}
            </div>
          </div>
          {v.vehiclePlate && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold">
              <Car className="w-3.5 h-3.5" /> {v.vehiclePlate}
            </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <StatusBadge status={v.status} />
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function getTimeAgo(dateStr: string) {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins/60)}h ago`;
}
