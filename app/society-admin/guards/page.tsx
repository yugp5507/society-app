"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { PlusCircle, Search, Trash2, Edit2, ShieldAlert, Key, Printer, Download } from "lucide-react";

export default function GuardsPage() {
  const [tab, setTab] = useState<"guards" | "qr">("guards");
  const [guards, setGuards] = useState<any[]>([]);
  const [gateQRs, setGateQRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showGuardModal, setShowGuardModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const [guardForm, setGuardForm] = useState({ name: "", email: "", phone: "", password: "", gate: "Main Gate", shift: "Morning (6 AM - 2 PM)" });
  const [qrForm, setQrForm] = useState({ gateName: "" });
  const [saving, setSaving] = useState(false);

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
      const res = await fetch("/api/guards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guardForm),
      });
      if (!res.ok) throw new Error("Failed to save");
      await loadData();
      setShowGuardModal(false);
      setGuardForm({ name: "", email: "", phone: "", password: "", gate: "Main Gate", shift: "Morning (6 AM - 2 PM)" });
    } catch (err) {
      alert("Error saving guard");
    } finally {
      setSaving(false);
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
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .container { border: 4px solid #1e293b; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 24px; }
            h1 { font-size: 36px; margin: 0 0 10px 0; color: #0f172a; }
            .subtitle { font-size: 24px; color: #475569; margin-bottom: 40px; font-weight: bold; }
            .gate { font-size: 28px; background: #f1f5f9; padding: 12px; border-radius: 12px; margin-bottom: 40px; color: #1e293b; font-weight: bold; }
            .qr-wrapper { padding: 20px; background: white; border: 2px solid #e2e8f0; display: inline-block; border-radius: 16px; margin-bottom: 30px; }
            .instructions { font-size: 22px; font-weight: bold; color: #334155; margin-bottom: 10px; }
            .hindi { font-size: 24px; color: #1e293b; font-weight: bold; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: 900; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${qr.society?.name || "Society"}</h1>
            <div class="subtitle">Visitor Entry | विज़िटर एंट्री</div>
            <div class="gate">${qr.gateName}</div>
            <div class="qr-wrapper">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}" alt="QR" width="300" height="300" />
            </div>
            <div class="instructions">Scan to register your visit</div>
            <div class="hindi">अपनी विज़िट दर्ज करने के लिए स्कैन करें</div>
            <div class="logo">🏢 SocietyPro</div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
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
            <button onClick={() => setShowGuardModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm text-sm">
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
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Guard Details</th>
                    <th className="px-5 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Gate & Shift</th>
                    <th className="px-5 py-4 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {guards.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{g.name}</div>
                            <div className="text-xs text-slate-500">{g.phone || g.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-700">{g.gateAssignment || "Not Assigned"}</div>
                        <div className="text-xs text-slate-500">{g.shift || "—"}</div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => deleteGuard(g.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <div key={qr.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-lg text-slate-900 mb-4">{qr.gateName}</h3>
                <div className="bg-white p-4 border-2 border-slate-100 rounded-2xl mb-4">
                  <QRCode value={url} size={150} />
                </div>
                <div className="flex gap-2 w-full mt-auto">
                  <button onClick={() => printQR(qr)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button onClick={() => regenerateQR(qr.id)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50">
                    Regenerate
                  </button>
                </div>
              </div>
            );
          })}
          {gateQRs.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
              <p className="font-medium">No Gate QR Codes generated</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showGuardModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1001, position: 'relative' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md">
              <h2 className="font-bold text-lg">Add Security Guard</h2>
              <button onClick={() => setShowGuardModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={saveGuard} className="p-6 space-y-4">
              <div><label className={lbl}>Full Name *</label><input required value={guardForm.name} onChange={e => setGuardForm({...guardForm, name: e.target.value})} className={inp} placeholder="Ramesh Singh" /></div>
              <div><label className={lbl}>Email *</label><input type="email" required value={guardForm.email} onChange={e => setGuardForm({...guardForm, email: e.target.value})} className={inp} placeholder="guard@society.com" /></div>
              <div><label className={lbl}>Phone *</label><input type="tel" required value={guardForm.phone} onChange={e => setGuardForm({...guardForm, phone: e.target.value})} className={inp} placeholder="9876543210" /></div>
              <div>
                <label className={lbl}>Password *</label>
                <div className="flex gap-2">
                  <input required value={guardForm.password} onChange={e => setGuardForm({...guardForm, password: e.target.value})} className={inp} placeholder="Password" />
                  <button type="button" onClick={generatePassword} className="px-4 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200">Auto</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Gate Assignment</label>
                  <select value={guardForm.gate} onChange={e => setGuardForm({...guardForm, gate: e.target.value})} className={inp}>
                    {["Main Gate", "Back Gate", "East Gate", "West Gate", "Parking Gate"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Shift</label>
                  <select value={guardForm.shift} onChange={e => setGuardForm({...guardForm, shift: e.target.value})} className={inp}>
                    {["Morning (6 AM - 2 PM)", "Evening (2 PM - 10 PM)", "Night (10 PM - 6 AM)", "24 Hours"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Saving..." : "Add Guard"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showQRModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '400px', zIndex: 1001, position: 'relative' }}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-lg">Generate Gate QR</h2>
              <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={saveQR} className="p-6 space-y-4">
              <div>
                <label className={lbl}>Gate Name *</label>
                <input required value={qrForm.gateName} onChange={e => setQrForm({...qrForm, gateName: e.target.value})} className={inp} placeholder="Main Gate" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Generating..." : "Generate QR Code"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
