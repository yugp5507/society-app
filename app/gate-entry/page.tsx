"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Camera, Check, Clock } from "lucide-react";

function GateEntryForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateInfo, setGateInfo] = useState<any>(null);

  const [buildings, setBuildings] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);

  const [form, setForm] = useState({
    buildingId: "", apartmentId: "",
    name: "", phone: "", purpose: "👥 Meeting Resident",
    vehicleNumber: "", duration: "1 to 3 hours", photo: ""
  });

  const [entryId, setEntryId] = useState("");
  const [status, setStatus] = useState("PENDING");

  const PURPOSES = [
    "👥 Meeting Resident", "📦 Delivery / Courier", "🔧 Service / Repair",
    "🚗 Cab / Auto / Taxi", "👨‍👩‍👧 Guest / Relative", "🏥 Medical / Emergency",
    "📋 Official Work", "🔄 Other"
  ];
  const DURATIONS = ["Less than 1 hour", "1 to 3 hours", "More than 3 hours", "Overnight Stay"];

  useEffect(() => {
    if (!token) {
      setError("No token provided");
      setLoading(false);
      return;
    }

    fetch(`/api/gate-entry/validate?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setGateInfo(d.gate);
          setBuildings(d.buildings || []);
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [token]);

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

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.apartmentId) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/gate-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, societyId: gateInfo.societyId, method: "QR_SCAN" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setEntryId(data.entry.id);
      setStep(3);
    } catch (err: any) {
      alert(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 3 || !entryId) return;
    const int = setInterval(async () => {
      try {
        const res = await fetch(`/api/gate-entry/status?id=${entryId}`);
        const data = await res.json();
        if (data.status) {
          setStatus(data.status);
          if (data.status !== "PENDING") clearInterval(int);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(int);
  }, [step, entryId]);

  if (loading && step === 1) return <div className="p-10 text-center">Loading...</div>;
  if (error) return (
    <div className="p-10 text-center flex flex-col items-center text-red-600">
      <AlertCircle className="w-16 h-16 mb-4" />
      <h2 className="text-xl font-bold">{error}</h2>
    </div>
  );

  const inp = "w-full p-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none";
  const lbl = "block font-bold text-slate-700 mb-2";

  return (
    <div className="min-h-screen bg-slate-100 font-sans sm:p-4">
      <div className="bg-white min-h-screen sm:min-h-[auto] sm:max-w-md mx-auto sm:rounded-3xl sm:shadow-xl overflow-hidden flex flex-col relative pb-20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-black mb-1">Welcome to</h1>
          <h2 className="text-xl font-semibold text-blue-100">{gateInfo?.society?.name}</h2>
          <div className="bg-white/20 mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            {gateInfo?.gateName}
          </div>
        </div>

        {/* Steps */}
        {step < 3 && (
          <div className="flex px-6 pt-6 pb-2">
            <div className={`flex-1 h-2 rounded-l-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-2 rounded-r-full ml-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
        )}

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Step 1: Select Destination</h3>
                <p className="text-slate-500 mt-1">आप कहाँ जा रहे हैं? (Where are you visiting?)</p>
              </div>

              <div>
                <label className={lbl}>Select Building/Tower</label>
                <select className={inp} value={form.buildingId} onChange={e => loadFlats(e.target.value)}>
                  <option value="">— Select —</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {form.buildingId && (
                <div>
                  <label className={lbl}>Select Flat/Apartment</label>
                  <select className={inp} value={form.apartmentId} onChange={e => loadOwner(e.target.value)}>
                    <option value="">— Select —</option>
                    {flats.map(f => <option key={f.id} value={f.id}>{f.number}</option>)}
                  </select>
                </div>
              )}

              {ownerInfo && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                  <div className="text-xs font-bold text-blue-500 uppercase mb-1">Visiting</div>
                  <div className="font-bold text-lg text-blue-900">{ownerInfo.name}</div>
                  <div className="text-blue-700 font-medium">Phone: {ownerInfo.phone.substring(0, 2)}XXXXXX{ownerInfo.phone.substring(8)}</div>
                </div>
              )}

              <button 
                onClick={() => setStep(2)} 
                disabled={!form.apartmentId}
                className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={submitForm} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-6">
                <button type="button" onClick={() => setStep(1)} className="text-blue-600 font-bold mb-2">← Back</button>
                <h3 className="text-xl font-bold text-slate-900">Step 2: Your Details</h3>
                <p className="text-slate-500 mt-1">अपनी जानकारी भरें (Fill your details)</p>
              </div>

              <div>
                <label className={lbl}>Full Name *</label>
                <input required className={inp} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Rahul Sharma" />
              </div>

              <div>
                <label className={lbl}>Mobile Number *</label>
                <input required type="tel" className={inp} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
              </div>

              <div>
                <label className={lbl}>Purpose of Visit</label>
                <select className={inp} value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})}>
                  {PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className={lbl}>Vehicle Number (Optional)</label>
                <input 
                  className={`${inp} font-mono uppercase`} 
                  value={form.vehicleNumber} 
                  onChange={e => setForm({...form, vehicleNumber: e.target.value.toUpperCase().replace(/\s/g, '')})} 
                  placeholder="MH01AB1234" 
                />
              </div>

              <div>
                <label className={lbl}>Expected Duration</label>
                <select className={inp} value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}>
                  {DURATIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Photo Upload Placeholder (For future implementation, just UI for now) */}
              <div>
                <label className={lbl}>Selfie (Optional)</label>
                <button type="button" className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50">
                  <Camera className="w-6 h-6" /> Take Photo
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-8 py-4 bg-green-600 text-white rounded-xl font-bold text-xl shadow-lg hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? "Submitting..." : <><Check className="w-6 h-6" /> Submit Request</>}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-10 animate-in zoom-in duration-500">
              {status === "PENDING" && (
                <>
                  <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-12 h-12 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Please Wait</h2>
                  <p className="text-slate-600 font-medium text-lg mb-8">Guard will verify your entry shortly.</p>
                </>
              )}
              {(status === "APPROVED" || status === "INSIDE") && (
                <>
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-14 h-14" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Entry Approved!</h2>
                  <p className="text-slate-600 font-medium text-lg mb-8">Welcome to {gateInfo?.society?.name}.</p>
                </>
              )}
              {status === "DENIED" && (
                <>
                  <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-14 h-14" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Entry Denied</h2>
                  <p className="text-slate-600 font-medium text-lg mb-8">Please speak with the security guard.</p>
                </>
              )}

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left">
                <div className="text-sm text-slate-500 mb-1 font-bold">ENTRY TICKET</div>
                <div className="font-mono text-lg font-black text-slate-900 mb-4">{entryId.substring(entryId.length - 8).toUpperCase()}</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 font-bold">VISITOR</div>
                    <div className="font-semibold text-slate-900">{form.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">FLAT</div>
                    <div className="font-semibold text-slate-900">{flats.find(f => f.id === form.apartmentId)?.number}</div>
                  </div>
                </div>
              </div>

              {status === "PENDING" && (
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  Auto-refreshing status...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GateEntryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <GateEntryForm />
    </Suspense>
  );
}
