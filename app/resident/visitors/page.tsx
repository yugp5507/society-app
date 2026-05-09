"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Clock, User, Car } from "lucide-react";

const PURPOSES = ["Meeting Resident", "Delivery", "Service/Repair", "Cab/Auto", "Guest", "Other"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    INSIDE: "bg-blue-100 text-blue-700 border-blue-200",
    LEFT:   "bg-slate-100 text-slate-600 border-slate-200",
    DENIED: "bg-red-100 text-red-700 border-red-200",
    APPROVED: "bg-green-100 text-green-700 border-green-200",
  };
  const labels: Record<string, string> = { INSIDE: "● Inside", LEFT: "● Left", DENIED: "● Denied", APPROVED: "● Approved" };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] ?? map.LEFT}`}>
      {labels[status] ?? status}
    </span>
  );
}

function fmt(dt: string) {
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

  useEffect(() => {
    Promise.all([
      fetch(`/api/visitors${filterDate ? `?date=${filterDate}` : "?today=true"}`).then(r => r.json()),
      fetch('/api/gate-entry/resident').then(r => r.json())
    ])
      .then(([vData, gData]) => {
        const vList = vData.visitors || [];
        const gList = gData.entries || [];
        
        // Filter gList based on date if filterDate is present, else today if today=true
        let filteredGList = gList;
        if (filterDate) {
          const filterStart = new Date(filterDate).setHours(0,0,0,0);
          filteredGList = gList.filter((g: any) => new Date(g.entryTime).setHours(0,0,0,0) === filterStart);
        } else {
          const today = new Date().setHours(0,0,0,0);
          filteredGList = gList.filter((g: any) => new Date(g.entryTime).setHours(0,0,0,0) === today);
        }
        
        const merged = [...vList, ...filteredGList].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
        setVisitors(merged);
      })
      .catch(() => {})
      .finally(() => setLoadingV(false));
  }, [filterDate]);

  useEffect(() => {
    fetch("/api/visitors/expected")
      .then(r => r.json())
      .then(d => setExpected(d.expected ?? []))
      .catch(() => {})
      .finally(() => setLoadingE(false));
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
      const { expectedVisitor } = await res.json();
      setExpected(prev => [expectedVisitor, ...prev]);
      setForm({ name: "", phone: "", vehiclePlate: "", purpose: PURPOSES[0], expectedDate: "", expectedTime: "", apartmentNumber: "" });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message || "Error adding expected visitor");
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900";
  const lbl = "block text-xs font-semibold text-slate-600 mb-1";

  const todayVisitors = visitors.filter(v => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(v.entryTime) >= today;
  });
  const olderVisitors = visitors.filter(v => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(v.entryTime) < today;
  });

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitor Entry</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and pre-approve visitors for your flat.</p>
        </div>
        <button
          onClick={() => { setTab("preapprove"); setShowForm(true); }}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Pre-approve Visitor
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 max-w-sm">
        {(["visitors", "preapprove"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t === "visitors" ? "🚪 My Visitors" : "📋 Pre-approved"}
          </button>
        ))}
      </div>

      {tab === "visitors" ? (
        <>
          {/* Date filter */}
          <div className="flex items-center gap-3 mb-5">
            <label className="text-sm font-medium text-slate-600">Filter by date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filterDate && (
              <button onClick={() => setFilterDate("")} className="text-xs text-blue-600 hover:underline">
                Show Today
              </button>
            )}
          </div>

          {loadingV ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {!filterDate && todayVisitors.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today</h2>
                  <div className="space-y-3">
                    {todayVisitors.map(v => <VisitorCard key={v.id} visitor={v} />)}
                  </div>
                </div>
              )}

              {olderVisitors.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Earlier</h2>
                  <div className="space-y-3">
                    {olderVisitors.map(v => <VisitorCard key={v.id} visitor={v} />)}
                  </div>
                </div>
              )}

              {visitors.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-3">🚪</div>
                  <p className="font-medium">No visitor records found</p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {/* Pre-approve form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-slate-900 text-lg">Add Expected Visitor</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>
              <form onSubmit={handlePreApprove} className="space-y-4">
                {(() => {
                  const plateRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/;
                  const isPlateValid = !form.vehiclePlate || plateRegex.test(form.vehiclePlate.replace(/\s/g, ''));
                  const formSubmitDisabled = saving || !form.name || !form.apartmentNumber || !form.expectedDate || !isPlateValid;

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className={lbl}>Visitor Name *</label>
                          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} placeholder="Rahul Sharma" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className={lbl}>Phone</label>
                          <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="9876543210" />
                        </div>
                        <div>
                          <label className={lbl}>Expected Date *</label>
                          <input type="date" required value={form.expectedDate} onChange={e => setForm({ ...form, expectedDate: e.target.value })} className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Expected Time</label>
                          <input type="time" value={form.expectedTime} onChange={e => setForm({ ...form, expectedTime: e.target.value })} className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Purpose *</label>
                          <select required value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className={inp}>
                            {PURPOSES.map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Your Flat No. *</label>
                          <input required value={form.apartmentNumber} onChange={e => setForm({ ...form, apartmentNumber: e.target.value.toUpperCase() })} className={inp} placeholder="A-101" />
                        </div>
                        <div className="col-span-2">
                          <label className={lbl}>Vehicle Number (optional)</label>
                          <input 
                            value={form.vehiclePlate} 
                            onChange={e => setForm({ ...form, vehiclePlate: e.target.value.toUpperCase().replace(/\s/g, '') })} 
                            className={`${inp} font-mono uppercase ${!isPlateValid ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50 text-red-900' : ''}`} 
                            placeholder="GJ05AB1234" 
                          />
                          {!isPlateValid && (
                            <p className="text-xs text-red-600 mt-1.5 font-medium">
                              Invalid format. Must be like GJ05AB1234.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                          Cancel
                        </button>
                        <button type="submit" disabled={formSubmitDisabled} className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                          {saving ? "Saving…" : "Pre-approve Visitor"}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </form>
            </div>
          )}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-5 py-3 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Expected Visitor
            </button>
          )}

          {/* Expected visitors list */}
          {loadingE ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : expected.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-medium">No pre-approved visitors yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expected.map(ev => (
                <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
                      {ev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{ev.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {fmt(ev.expectedDate)}
                        <span className="text-slate-300">·</span>
                        {ev.purpose}
                      </div>
                      {ev.phone && <div className="text-xs text-slate-400 mt-0.5">📞 {ev.phone}</div>}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${ev.isVisited ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {ev.isVisited ? "✓ Visited" : "⏳ Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function VisitorCard({ visitor: v }: { visitor: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
          {v.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{v.name}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {v.status === 'APPROVED' ? `Expected: ${fmt(v.expectedDate)}` : fmt(v.entryTime)}
            {v.exitTime && <><span className="text-slate-300">→</span>{fmt(v.exitTime)}</>}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2">
            <span>🎯 {v.purpose}</span>
            {v.phone && <span><User className="w-3 h-3 inline" /> {v.phone}</span>}
            {v.vehiclePlate && <span><Car className="w-3 h-3 inline" /> {v.vehiclePlate}</span>}
          </div>
        </div>
      </div>
      <StatusBadge status={v.status} />
    </div>
  );
}
