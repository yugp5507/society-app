"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { PlusCircle, Search, Trash2, Edit2, ShieldAlert, Key, Printer, Download, Copy, CheckCircle2, XCircle } from "lucide-react";

export default function GuardsPage() {
  const [tab, setTab] = useState<"guards" | "qr">("guards");
  const [guards, setGuards] = useState<any[]>([]);
  const [gateQRs, setGateQRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showGuardModal, setShowGuardModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [editingGuard, setEditingGuard] = useState<any>(null);

  const [guardForm, setGuardForm] = useState({ name: "", email: "", phone: "", password: "", gateAssignment: "Main Gate", shift: "Morning (6 AM - 2 PM)", isActive: true });
  const [qrForm, setQrForm] = useState({ gateName: "" });
  const [saving, setSaving] = useState(false);
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gRes, qRes] = await Promise.all([
        fetch("/api/guards"),
        fetch("/api/qr")
      ]);
      const gData = await gRes.json();
      const qData = await qRes.json();
      setGuards(gData.guards || []);
      setGateQRs(qData.qrs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveGuard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingGuard ? `/api/guards/${editingGuard.id}` : "/api/guards";
      const method = editingGuard ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guardForm),
      });
      
      if (!res.ok) throw new Error("Failed to save");
      
      if (!editingGuard) {
        setLastCreatedCredentials({ email: guardForm.email, password: guardForm.password });
      }

      await loadData();
      if (editingGuard) {
        setShowGuardModal(false);
        setEditingGuard(null);
      }
      setGuardForm({ name: "", email: "", phone: "", password: "", gateAssignment: "Main Gate", shift: "Morning (6 AM - 2 PM)", isActive: true });
    } catch (err) {
      alert("Error saving guard");
    } finally {
      setSaving(false);
    }
  };

  const toggleGuardStatus = async (guard: any) => {
    try {
      await fetch(`/api/guards/${guard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...guard, isActive: !guard.isActive }),
      });
      await loadData();
    } catch (err) {
      alert("Error toggling status");
    }
  };

  const deleteGuard = async (id: string) => {
    if (!confirm("Remove this guard?")) return;
    try {
      await fetch(`/api/guards/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      alert("Error deleting");
    }
  };

  const saveQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qrForm),
      });
      if (!res.ok) throw new Error("Failed to save");
      await loadData();
      setShowQRModal(false);
      setQrForm({ gateName: "" });
    } catch (err) {
      alert("Error generating QR");
    } finally {
      setSaving(false);
    }
  };

  const toggleQRStatus = async (qr: any) => {
    try {
      await fetch(`/api/qr/${qr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !qr.isActive }),
      });
      await loadData();
    } catch (err) {
      alert("Error toggling status");
    }
  };

  const regenerateQR = async (id: string) => {
    if (!confirm("Regenerate token? Old QR will become invalid!")) return;
    try {
      await fetch(`/api/qr/${id}/regenerate`, { method: "PATCH" });
      await loadData();
    } catch (err) {
      alert("Error regenerating");
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    let p = "";
    for (let i = 0; i < 8; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    setGuardForm({ ...guardForm, password: p });
  };

  const printQR = (qr: any) => {
    const url = `${window.location.origin}/gate-entry?token=${qr.token}`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Print QR - ${qr.gateName}</title>
          <style>
            @media print { @page { size: A4; margin: 0; } body { margin: 0; } }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; background: #fff; padding: 40px; }
            .container { border: 15px solid #1e293b; padding: 60px 40px; max-width: 700px; margin: 0 auto; border-radius: 40px; min-height: 90vh; display: flex; flex-direction: column; justify-content: space-between; }
            h1 { font-size: 48px; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
            .subtitle { font-size: 28px; color: #475569; margin: 20px 0 40px 0; font-weight: 600; }
            .gate { font-size: 32px; background: #1e293b; padding: 15px 30px; border-radius: 20px; margin-bottom: 50px; color: #fff; font-weight: 800; display: inline-block; }
            .qr-wrapper { padding: 30px; background: white; border: 4px solid #e2e8f0; display: inline-block; border-radius: 30px; margin-bottom: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .instructions { font-size: 26px; font-weight: 800; color: #1e293b; margin-bottom: 5px; }
            .hindi { font-size: 28px; color: #334155; font-weight: 700; margin-bottom: 50px; }
            .footer { border-top: 2px solid #f1f5f9; padding-top: 30px; margin-top: auto; }
            .logo { font-size: 28px; font-weight: 900; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div>
              <h1>${qr.society?.name || "Society"}</h1>
              <div class="subtitle">Visitor Entry | विज़िटर एंट्री</div>
            </div>
            <div>
              <div class="gate">${qr.gateName}</div>
              <br/>
              <div class="qr-wrapper">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}" alt="QR" width="400" height="400" />
              </div>
            </div>
            <div class="footer">
              <div class="instructions">Scan to register your visit</div>
              <div class="hindi">अपनी विज़िट दर्ज करने के लिए स्कैन करें</div>
              <div class="logo">🏢 SocietyPro</div>
            </div>
          </div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); };</script>
        </body>
      </html>
    `);
  };

  const copyCredentials = () => {
    if (!lastCreatedCredentials) return;
    const text = `Guard Login Credentials:\nEmail: ${lastCreatedCredentials.email}\nPassword: ${lastCreatedCredentials.password}`;
    navigator.clipboard.writeText(text);
    alert("Credentials copied to clipboard!");
  };

  const inp = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-900";
  const lbl = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage security guards and gate QR codes.</p>
        </div>
        <div className="flex gap-2">
          {tab === "guards" ? (
            <button 
              onClick={() => {
                setEditingGuard(null);
                setGuardForm({ name: "", email: "", phone: "", password: "", gateAssignment: "Main Gate", shift: "Morning (6 AM - 2 PM)", isActive: true });
                setLastCreatedCredentials(null);
                setShowGuardModal(true);
              }} 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Add Guard
            </button>
          ) : (
            <button onClick={() => setShowQRModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm text-sm">
              <PlusCircle className="w-4 h-4" /> Generate Gate QR
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => setTab("guards")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "guards" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          👮 Guards
        </button>
        <button
          onClick={() => setTab("qr")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "qr" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          ⬛ Gate QR Codes
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : tab === "guards" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {guards.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">No guards registered</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Guard Details</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Gate & Shift</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {guards.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{g.name}</div>
                            <div className="text-xs text-slate-500">{g.email}</div>
                            <div className="text-xs text-slate-400">{g.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-700">{g.gateAssignment || "Main Gate"}</div>
                        <div className="text-xs text-slate-500">{g.shift || "Morning Shift"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => toggleGuardStatus(g)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${g.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${g.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {g.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => {
                              setEditingGuard(g);
                              setGuardForm({ ...g, password: "" });
                              setLastCreatedCredentials(null);
                              setShowGuardModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteGuard(g.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateQRs.map(qr => {
            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/gate-entry?token=${qr.token}`;
            return (
              <div key={qr.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center group hover:shadow-md transition-shadow">
                <div className="w-full flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{qr.gateName}</h3>
                  <button 
                    onClick={() => toggleQRStatus(qr)}
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${qr.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {qr.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="bg-white p-4 border-2 border-slate-100 rounded-2xl mb-6 group-hover:border-blue-200 transition-colors">
                  <QRCode value={url} size={160} />
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button onClick={() => printQR(qr)} className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button onClick={() => regenerateQR(qr.id)} className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                    Regenerate
                  </button>
                </div>
              </div>
            );
          })}
          {gateQRs.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border-2 border-slate-100 border-dashed">
              <p className="font-medium">No Gate QR Codes generated yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showGuardModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="font-black text-xl text-slate-900">{editingGuard ? "Edit Security Guard" : "Add Security Guard"}</h2>
                <p className="text-xs text-slate-500 font-medium">Set up gate access and shift timings</p>
              </div>
              <button onClick={() => setShowGuardModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors">✕</button>
            </div>

            <div className="overflow-y-auto p-8">
              {lastCreatedCredentials && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="text-blue-800 font-bold text-sm mb-2">Guard Created Successfully!</p>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 mb-3 font-mono text-sm">
                    <div>Email: <span className="font-bold text-slate-900">{lastCreatedCredentials.email}</span></div>
                    <div>Pass: <span className="font-bold text-slate-900">{lastCreatedCredentials.password}</span></div>
                  </div>
                  <button onClick={copyCredentials} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                    <Copy className="w-3.5 h-3.5" /> Copy Credentials
                  </button>
                </div>
              )}

              <form onSubmit={saveGuard} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lbl}>Full Name *</label>
                    <input required value={guardForm.name} onChange={e => setGuardForm({...guardForm, name: e.target.value})} className={inp} placeholder="Ramesh Singh" />
                  </div>
                  <div>
                    <label className={lbl}>Email Address *</label>
                    <input type="email" required value={guardForm.email} onChange={e => setGuardForm({...guardForm, email: e.target.value})} className={inp} placeholder="ramesh@society.com" />
                  </div>
                  <div>
                    <label className={lbl}>Phone Number *</label>
                    <input type="tel" required value={guardForm.phone} onChange={e => setGuardForm({...guardForm, phone: e.target.value})} className={inp} placeholder="9876543210" />
                  </div>
                </div>

                {!editingGuard && (
                  <div>
                    <label className={lbl}>Access Password *</label>
                    <div className="flex gap-2">
                      <input required value={guardForm.password} onChange={e => setGuardForm({...guardForm, password: e.target.value})} className={inp} placeholder="Enter or Generate" />
                      <button type="button" onClick={generatePassword} className="px-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Auto</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Gate Assignment</label>
                    <select value={guardForm.gateAssignment} onChange={e => setGuardForm({...guardForm, gateAssignment: e.target.value})} className={inp}>
                      {["Main Gate", "Back Gate", "East Gate", "West Gate", "Parking Gate"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Shift Timing</label>
                    <select value={guardForm.shift} onChange={e => setGuardForm({...guardForm, shift: e.target.value})} className={inp}>
                      {["Morning (6 AM - 2 PM)", "Evening (2 PM - 10 PM)", "Night (10 PM - 6 AM)", "24 Hours"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="active" 
                    checked={guardForm.isActive} 
                    onChange={e => setGuardForm({...guardForm, isActive: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-bold text-slate-700">Guard Account is Active</label>
                </div>

                <button type="submit" disabled={saving} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-95">
                  {saving ? "Processing..." : editingGuard ? "Update Guard" : "Create Guard Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="font-black text-xl text-slate-900">New Gate QR</h2>
              <button onClick={() => setShowQRModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={saveQR} className="p-8 space-y-6">
              <div>
                <label className={lbl}>Gate Location / Name *</label>
                <input required value={qrForm.gateName} onChange={e => setQrForm({...qrForm, gateName: e.target.value})} className={inp} placeholder="e.g. South Entry Gate" />
                <p className="mt-2 text-xs text-slate-400 font-medium">This name will appear on the printed QR poster.</p>
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-95">
                {saving ? "Generating..." : "Generate Poster QR"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

