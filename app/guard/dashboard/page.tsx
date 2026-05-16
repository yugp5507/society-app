"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Clock, Phone, MapPin, Search, CheckCircle2, XCircle, ChevronDown, ChevronUp, User, Car, Shield, History, Info, Users, ExternalLink, PlusCircle } from "lucide-react";

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
  const [logFilter, setLogFilter] = useState("ALL");

  const [form, setForm] = useState({
    name: "", phone: "", buildingId: "", apartmentId: "", purpose: "👥 Meeting Resident", vehicleNumber: "", idType: "None", idNumber: "", duration: "1 to 3 hours"
  });

  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [denyReason, setDenyReason] = useState({ id: "", reason: "" });
  const [showDenyModal, setShowDenyModal] = useState(false);

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
    if (action === "deny" && !showDenyModal) {
      setDenyReason({ id, reason: "" });
      setShowDenyModal(true);
      return;
    }

    setActionLoading(id);
    try {
      await fetch(`/api/guard/${id}/${action}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action === "deny" ? JSON.stringify({ reason: denyReason.reason }) : undefined
      });
      await loadData();
      if (action === "deny") setShowDenyModal(false);
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
    if (!entryTime) return "—";
    const diff = new Date().getTime() - new Date(entryTime).getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
  };

  const filteredLog = log.filter(l => {
    if (logFilter !== "ALL" && l.status !== logFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.visitorName.toLowerCase().includes(q) || l.apartment?.number?.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading && pending.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
      <p className="text-slate-500 font-bold">Loading Guard Panel...</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-5 sticky top-0 z-10 shadow-xl rounded-b-[2rem]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-900/50">🛡️</div>
            <div>
              <div className="font-black text-lg leading-tight">{session?.user?.name || "Security Guard"}</div>
              <div className="text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-green-400 leading-none">{log.length}</div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Entries Today</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 p-2 rounded-xl text-center backdrop-blur-sm border border-white/5">
            <div className="text-lg font-black">{inside.length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Inside</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl text-center backdrop-blur-sm border border-white/5">
            <div className="text-lg font-black text-amber-400">{pending.length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Wait</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl text-center backdrop-blur-sm border border-white/5">
            <div className="text-lg font-black text-red-400">{log.filter(l => l.status === "DENIED").length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Denied</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-8 mt-2">
        
        {/* SECTION A - PENDING APPROVALS */}
        {pending.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <h2 className="text-xl font-black text-slate-900">PENDING REQUESTS</h2>
              </div>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black tracking-widest">{pending.length} NEW</span>
            </div>
            
            {pending.map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border-2 border-amber-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Waiting {getTimeAgo(p.createdAt)}</span>
                  </div>
                  <span className="text-[10px] font-black bg-white text-slate-500 px-2 py-0.5 rounded-lg border border-amber-100 uppercase tracking-widest">{p.entryMethod.replace('_', ' ')}</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-black text-slate-900 mb-1">{p.visitorName}</div>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${p.visitorPhone}`} className="text-blue-600 font-black text-sm flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                          <Phone className="w-4 h-4" /> {p.visitorPhone}
                        </a>
                        {p.vehicleNumber && (
                          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5">
                            <Car className="w-4 h-4" /> {p.vehicleNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Destination</div>
                      <div className="font-black text-slate-900 text-lg leading-tight">Flat {p.apartment.number}</div>
                      <div className="text-xs text-slate-500 font-bold">{p.apartment.building.name}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Purpose</div>
                      <div className="font-black text-slate-900 text-sm leading-tight">{p.purpose}</div>
                      <div className="text-xs text-slate-500 font-bold">{p.duration || "N/A"}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAction(p.id, "deny")}
                      disabled={actionLoading === p.id}
                      className="flex-1 py-4 bg-red-50 text-red-600 font-black rounded-2xl border border-red-100 text-lg flex justify-center items-center gap-2 active:scale-95 transition-all"
                    >
                      <XCircle className="w-6 h-6" /> DENY
                    </button>
                    <button 
                      onClick={() => handleAction(p.id, "allow")}
                      disabled={actionLoading === p.id}
                      className="flex-[2] py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 text-lg flex justify-center items-center gap-2 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-6 h-6" /> ALLOW ENTRY
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION B - MANUAL ENTRY FORM */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <button 
            onClick={() => setShowManualForm(!showManualForm)}
            className={`w-full p-6 flex justify-between items-center transition-colors ${showManualForm ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${showManualForm ? 'bg-white/10' : 'bg-slate-100'}`}>
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-black text-lg">Manual Entry</div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${showManualForm ? 'text-slate-400' : 'text-slate-500'}`}>Log visitor without phone</div>
              </div>
            </div>
            {showManualForm ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {showManualForm && (
            <form onSubmit={submitManual} className="p-6 space-y-4 bg-white animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Visitor Name</label>
                  <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter Full Name" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                  <input required type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10-digit mobile" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Building</label>
                  <select required value={form.buildingId} onChange={e=>loadFlats(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                    <option value="">Select</option>
                    {buildings.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Flat No.</label>
                  <select required value={form.apartmentId} onChange={e=>loadOwner(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none" disabled={!form.buildingId}>
                    <option value="">Select</option>
                    {flats.map(f=><option key={f.id} value={f.id}>{f.number}</option>)}
                  </select>
                </div>
              </div>
              
              {ownerInfo && (
                <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3 border border-blue-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-black shadow-sm border border-blue-50">{ownerInfo.name.charAt(0)}</div>
                  <div>
                    <div className="text-[10px] text-blue-400 font-black uppercase tracking-wider">Visiting Resident</div>
                    <div className="font-black text-blue-900">{ownerInfo.name}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Purpose</label>
                <select value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                  {["👥 Meeting Resident", "📦 Delivery / Courier", "🔧 Service / Repair", "🚗 Cab / Auto / Taxi", "👨‍👩‍👧 Guest / Relative", "🏥 Medical / Emergency", "📋 Official Work", "🔄 Other"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vehicle (Optional)</label>
                  <input value={form.vehicleNumber} onChange={e=>setForm({...form,vehicleNumber:e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="GJ01AB1234" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ID Proof</label>
                  <select value={form.idType} onChange={e=>setForm({...form,idType:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                    {["None", "Aadhar Card", "PAN Card", "Driving License", "Voter ID", "Passport"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button disabled={actionLoading === "manual"} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-xl mt-4 shadow-xl shadow-blue-100 active:scale-95 transition-all">
                {actionLoading === "manual" ? "Logging..." : "Log Approved Entry"}
              </button>
            </form>
          )}
        </div>

        {/* SECTION C - INSIDE NOW */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">VISITORS INSIDE</h2>
            <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">{inside.length} PEOPLE</div>
          </div>
          
          <div className="space-y-4">
            {inside.map(p => {
              const durationMins = Math.floor((new Date().getTime() - new Date(p.entryTime).getTime()) / 60000);
              const isOverdue = durationMins > 180; // Example: 3 hours

              return (
                <div key={p.id} className={`bg-white p-5 rounded-[2rem] shadow-sm border ${isOverdue ? 'border-red-100' : 'border-slate-200'} flex items-center justify-between gap-4 group hover:shadow-md transition-shadow`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-black text-slate-900 text-lg truncate leading-none">{p.visitorName}</div>
                      {isOverdue && <span className="bg-red-500 w-2 h-2 rounded-full animate-ping" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">Flat {p.apartment.number}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getDurationString(p.entryTime)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAction(p.id, "exit")}
                    disabled={actionLoading === p.id}
                    className="px-6 py-3 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200"
                  >
                    MARK EXIT
                  </button>
                </div>
              );
            })}
            {inside.length === 0 && (
              <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No visitors currently inside</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION D - PRE APPROVED */}
        {preApproved.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black text-slate-900 mb-4">PRE-APPROVED TODAY</h2>
            <div className="space-y-4">
              {preApproved.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-[2rem] shadow-sm border-l-8 border-l-green-500 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 text-lg truncate mb-1">{p.visitorName}</div>
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{p.apartment.number}</span>
                      <span>{p.purpose}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAction(p.id, "allow")}
                    disabled={actionLoading === p.id}
                    className="px-6 py-3 bg-green-100 text-green-700 font-black text-sm rounded-2xl hover:bg-green-200 active:scale-95 transition-all"
                  >
                    ARRIVED
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION E - TODAY'S FULL LOG */}
        <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-4">ACTIVITY LOG</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {["ALL", "INSIDE", "LEFT", "DENIED"].map(f => (
                <button 
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${logFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="mt-4 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name or flat..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
          
          <div className="divide-y divide-slate-50">
            {filteredLog.slice(0, 10).map(l => (
              <div key={l.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${l.status === 'INSIDE' ? 'bg-emerald-100 text-emerald-600' : l.status === 'LEFT' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                    {l.status.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{l.visitorName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {l.apartment?.number} • {new Date(l.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
                <div className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${l.status === 'INSIDE' ? 'bg-emerald-50 text-emerald-600' : l.status === 'LEFT' ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-600'}`}>
                  {l.status}
                </div>
              </div>
            ))}
            {filteredLog.length === 0 && (
              <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No entries found</div>
            )}
            {filteredLog.length > 10 && (
              <div className="p-4 text-center bg-slate-50 text-blue-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-slate-100">
                View All Activity
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Deny Reason Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Deny Entry</h3>
              <p className="text-slate-500 text-center font-medium mb-8">Please provide a reason for denying entry to this visitor.</p>
              
              <div className="space-y-3">
                {["Not allowed by resident", "Suspicious behavior", "Wrong flat number", "Other"].map(r => (
                  <button 
                    key={r}
                    onClick={() => setDenyReason({...denyReason, reason: r})}
                    className={`w-full p-4 rounded-2xl font-bold text-left transition-all border-2 ${denyReason.reason === r ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowDenyModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl active:scale-95 transition-all">CANCEL</button>
                <button 
                  onClick={() => handleAction(denyReason.id, "deny")}
                  disabled={!denyReason.reason || actionLoading === denyReason.id}
                  className="flex-[2] py-4 bg-red-600 text-white font-black rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-red-100"
                >
                  CONFIRM DENY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar for quick actions (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 px-6 flex justify-between items-center sm:hidden shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-20">
        <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="flex flex-col items-center gap-1">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="text-[10px] font-black text-blue-600 uppercase">Panel</span>
        </button>
        <button onClick={() => setShowManualForm(true)} className="flex flex-col items-center gap-1">
          <PlusCircle className="w-6 h-6 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">Entry</span>
        </button>
        <button onClick={() => {}} className="flex flex-col items-center gap-1">
          <History className="w-6 h-6 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">Log</span>
        </button>
        <button onClick={() => {}} className="flex flex-col items-center gap-1">
          <User className="w-6 h-6 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
}
