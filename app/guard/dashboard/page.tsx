"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Clock, Phone, MapPin, Search, CheckCircle2, XCircle, ChevronDown, ChevronUp, User, Car } from "lucide-react";

export default function GuardDashboard() {
  const { data: session } = useSession();
  const [time, setTime] = useState(new Date());

  const [pending, setPending] = useState<any[]>([]);
  const [inside, setInside] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [preApproved, setPreApproved] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", buildingId: "", apartmentId: "", purpose: "👥 Meeting Resident", vehicleNumber: "", idType: "None", idNumber: "", duration: "1 to 3 hours"
  });

  const [ownerInfo, setOwnerInfo] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [pendRes, inRes, preRes, logRes] = await Promise.all([
        fetch("/api/guard/pending"),
        fetch("/api/guard/inside"),
        fetch("/api/guard/preapproved"),
        fetch("/api/guard/log")
      ]);
      const pend = await pendRes.json();
      const ins = await inRes.json();
      const pre = await preRes.json();
      const lg = await logRes.json();

      setPending(pend.entries || []);
      setInside(ins.entries || []);
      setPreApproved(pre.entries || []);
      setLog(lg.entries || []);
      
      const bRes = await fetch("/api/guard/buildings");
      const bData = await bRes.json();
      setBuildings(bData.buildings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadFlats = async (buildingId: string) => {
    setForm(prev => ({ ...prev, buildingId, apartmentId: "" }));
    setOwnerInfo(null);
    if (!buildingId) return;
    const res = await fetch(`/api/gate-entry/flats?buildingId=${buildingId}`);
    const data = await res.json();
    setFlats(data.flats || []);
  };

  const loadOwner = async (apartmentId: string) => {
    setForm(prev => ({ ...prev, apartmentId }));
    if (!apartmentId) {
      setOwnerInfo(null);
      return;
    }
    const res = await fetch(`/api/gate-entry/flat-owner?apartmentId=${apartmentId}`);
    const data = await res.json();
    if (data.owner) setOwnerInfo(data.owner);
    else setOwnerInfo({ name: "Resident", phone: "Not Available" });
  };

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("manual");
    try {
      const res = await fetch("/api/guard/manual-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      await loadData();
      setShowManualForm(false);
      setForm({ name: "", phone: "", buildingId: "", apartmentId: "", purpose: "👥 Meeting Resident", vehicleNumber: "", idType: "None", idNumber: "", duration: "1 to 3 hours" });
    } catch (err) {
      alert("Error logging entry");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (id: string, action: "allow" | "deny" | "exit") => {
    setActionLoading(id);
    try {
      await fetch(`/api/guard/${id}/${action}`, { method: "PATCH" });
      await loadData();
    } catch (err) {
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    return `${Math.floor(mins/60)} hrs ago`;
  };

  const getDurationString = (entryTime: string) => {
    const diff = new Date().getTime() - new Date(entryTime).getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
  };

  if (loading && pending.length === 0) return <div className="p-10 text-center">Loading Guard Dashboard...</div>;

  return (
    <div className="bg-slate-100 min-h-screen pb-20 font-sans">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="font-bold text-lg leading-tight">{session?.user?.name || "Security Guard"}</div>
            <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-green-400">{log.length}</div>
            <div className="text-slate-400 text-xs">Today</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* PENDING APPROVALS */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">PENDING APPROVAL</h2>
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">{pending.length}</span>
            </div>
            
            {pending.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border-2 border-red-100 overflow-hidden">
                <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-red-600 uppercase">Wait Time: {getTimeAgo(p.createdAt)}</span>
                  <span className="text-xs font-bold bg-white text-slate-600 px-2 py-1 rounded-md shadow-sm border border-slate-200">{p.entryMethod}</span>
                </div>
                <div className="p-4">
                  <div className="text-xl font-black text-slate-900 mb-1">{p.visitorName}</div>
                  <a href={`tel:${p.visitorPhone}`} className="text-blue-600 font-bold text-sm flex items-center gap-1.5 mb-4 inline-flex px-3 py-1 bg-blue-50 rounded-lg">
                    <Phone className="w-4 h-4" /> {p.visitorPhone}
                  </a>

                  <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 font-bold">GOING TO</div>
                      <div className="font-bold text-slate-900 text-sm">Flat {p.apartment.number}</div>
                      <div className="text-xs text-slate-500 truncate">{p.apartment.building.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold">PURPOSE</div>
                      <div className="font-bold text-slate-900 text-sm truncate">{p.purpose}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAction(p.id, "deny")}
                      disabled={actionLoading === p.id}
                      className="flex-1 py-3 bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 text-lg flex justify-center items-center gap-2"
                    >
                      <XCircle className="w-6 h-6" /> Deny
                    </button>
                    <button 
                      onClick={() => handleAction(p.id, "allow")}
                      disabled={actionLoading === p.id}
                      className="flex-[2] py-3 bg-green-600 text-white font-bold rounded-xl shadow-md text-lg flex justify-center items-center gap-2"
                    >
                      <CheckCircle2 className="w-6 h-6" /> Allow
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MANUAL ENTRY FORM */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button 
            onClick={() => setShowManualForm(!showManualForm)}
            className="w-full p-4 flex justify-between items-center bg-slate-50"
          >
            <div className="font-bold text-slate-900">📝 Manual Entry</div>
            {showManualForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showManualForm && (
            <form onSubmit={submitManual} className="p-4 space-y-4 border-t border-slate-100">
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Name</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Phone</label><input required type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Building</label><select required value={form.buildingId} onChange={e=>loadFlats(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"><option value="">Select</option>{buildings.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Flat</label><select required value={form.apartmentId} onChange={e=>loadOwner(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" disabled={!form.buildingId}><option value="">Select</option>{flats.map(f=><option key={f.id} value={f.id}>{f.number}</option>)}</select></div>
              </div>
              {ownerInfo && (
                <div className="bg-blue-50 p-2 rounded-lg text-sm text-blue-800 font-medium">Visiting: {ownerInfo.name}</div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Purpose</label>
                <select value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {["👥 Meeting Resident", "📦 Delivery / Courier", "🔧 Service / Repair", "🚗 Cab / Auto / Taxi", "👨‍👩‍👧 Guest / Relative", "🏥 Medical / Emergency", "📋 Official Work", "🔄 Other"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button disabled={actionLoading === "manual"} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl text-lg mt-2">
                Log Approved Entry
              </button>
            </form>
          )}
        </div>

        {/* INSIDE NOW */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Currently Inside ({inside.length})</h2>
          <div className="space-y-3">
            {inside.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{p.visitorName}</div>
                  <div className="text-xs text-slate-500 mt-0.5"><span className="font-bold text-blue-600">{p.apartment.number}</span> • In: {getDurationString(p.entryTime)}</div>
                </div>
                <button 
                  onClick={() => handleAction(p.id, "exit")}
                  disabled={actionLoading === p.id}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 whitespace-nowrap"
                >
                  Mark Exit
                </button>
              </div>
            ))}
            {inside.length === 0 && <div className="text-center py-6 text-slate-400 text-sm font-medium">No visitors inside</div>}
          </div>
        </div>

        {/* PRE APPROVED */}
        {preApproved.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Pre-Approved Expected</h2>
            <div className="space-y-3">
              {preApproved.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-green-500 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{p.visitorName}</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium"><span className="text-slate-800">{p.apartment.number}</span> • {p.purpose}</div>
                  </div>
                  <button 
                    onClick={() => handleAction(p.id, "allow")}
                    disabled={actionLoading === p.id}
                    className="px-4 py-2 bg-green-100 text-green-700 font-bold text-sm rounded-lg whitespace-nowrap"
                  >
                    Mark Arrived
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
