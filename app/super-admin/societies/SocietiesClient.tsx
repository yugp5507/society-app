"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Home, MapPin, Copy, CheckCircle2, Eye, EyeOff } from "lucide-react";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const selectCls = "w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelCls = "block text-sm font-medium text-slate-700 mb-1";

export default function SocietiesClient({ initialSocieties }: { initialSocieties: any[] }) {
  const [societies, setSocieties] = useState(initialSocieties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState<"new" | "existing">("new");
  const [existingUsers, setExistingUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successData, setSuccessData] = useState<{ society: any; credentials: any } | null>(null);
  const [copied, setCopied] = useState(false);

  const [societyData, setSocietyData] = useState({
    name: "", address: "", city: "", state: "", pincode: "",
    type: "Apartment", buildingsCount: 1,
  });

  const [adminData, setAdminData] = useState({
    name: "", email: "", phone: "", password: generatePassword(),
  });

  useEffect(() => {
    if (isModalOpen && adminMode === "existing") {
      fetch("/api/super-admin/societies")
        .then(r => r.json())
        .then(setExistingUsers)
        .catch(() => {});
    }
  }, [isModalOpen, adminMode]);

  const openModal = () => {
    setIsModalOpen(true);
    setStep(1);
    setAdminMode("new");
    setSuccessData(null);
    setCopied(false);
    setSocietyData({ name: "", address: "", city: "", state: "", pincode: "", type: "Apartment", buildingsCount: 1 });
    setAdminData({ name: "", email: "", phone: "", password: generatePassword() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        society: {
          name: societyData.name,
          address: `${societyData.address}, ${societyData.pincode}`,
          city: societyData.city,
          state: societyData.state,
          type: societyData.type,
        },
        adminMode,
        newAdmin: adminMode === "new" ? adminData : undefined,
        existingUserId: adminMode === "existing" ? selectedUserId : undefined,
      };

      const res = await fetch("/api/super-admin/societies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create society");
      }

      const { society, adminCredentials } = await res.json();
      setSocieties(prev => [society, ...prev]);
      setSuccessData({ society, credentials: adminCredentials });
    } catch (error: any) {
      alert(error.message || "Error creating society");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!successData) return;
    const c = successData.credentials;
    const text = `Society: ${successData.society.name}\nAdmin: ${c.name}\nEmail: ${c.email}${c.password ? `\nPassword: ${c.password}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Societies</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage onboarded societies across the platform.</p>
        </div>
        <button
          onClick={openModal}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Create Society
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {["Society", "Location", "Type", "Admin", "Buildings"].map(h => (
                  <th key={h} className="px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {societies.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No societies onboarded yet.</td></tr>
              ) : societies.map(soc => (
                <tr key={soc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Home className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-semibold text-slate-800">{soc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {soc.city}
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5 ml-5 truncate max-w-[180px]">{soc.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full border border-indigo-100">
                      {soc.type || "Apartment"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {soc.admin ? (
                      <div>
                        <div className="font-medium text-slate-800">{soc.admin.name}</div>
                        <div className="text-xs text-slate-500">{soc.admin.email}</div>
                      </div>
                    ) : (
                      <span className="text-amber-500 font-medium text-xs">No Admin</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{soc.buildings?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
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

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div>
                {!successData && (
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2].map(n => (
                      <div key={n} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= n ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>{n}</div>
                        {n < 2 && <div className={`h-0.5 w-8 ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  {successData ? "Society Created!" : step === 1 ? "Step 1: Society Details" : "Step 2: Assign Admin"}
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setSuccessData(null); setStep(1); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >✕</button>
            </div>

            <div className="p-6">
              {/* ── Success State ── */}
              {successData ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{successData.society.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{successData.society.city} · {successData.society.type || "Apartment"}</p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Admin Credentials</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name</span>
                        <span className="font-semibold text-slate-800">{successData.credentials.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email</span>
                        <span className="font-semibold text-slate-800">{successData.credentials.email}</span>
                      </div>
                      {successData.credentials.password && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Password</span>
                          <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{successData.credentials.password}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={copyCredentials}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm mb-3"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Admin Credentials"}
                  </button>
                  <button
                    onClick={() => { setIsModalOpen(false); setSuccessData(null); setStep(1); }}
                    className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : step === 1 ? (
                /* ── Step 1: Society Details ── */
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                  <div>
                    <label className={labelCls}>Society Name <span className="text-red-500">*</span></label>
                    <input required value={societyData.name} onChange={e => setSocietyData({ ...societyData, name: e.target.value })} className={inputCls} placeholder="Green Valley Residency" />
                  </div>
                  <div>
                    <label className={labelCls}>Society Type</label>
                    <select value={societyData.type} onChange={e => setSocietyData({ ...societyData, type: e.target.value })} className={selectCls}>
                      <option>Apartment</option>
                      <option>Rowhouse</option>
                      <option>Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Address <span className="text-red-500">*</span></label>
                    <input required value={societyData.address} onChange={e => setSocietyData({ ...societyData, address: e.target.value })} className={inputCls} placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>City <span className="text-red-500">*</span></label>
                      <input required value={societyData.city} onChange={e => setSocietyData({ ...societyData, city: e.target.value })} className={inputCls} placeholder="Pune" />
                    </div>
                    <div>
                      <label className={labelCls}>State <span className="text-red-500">*</span></label>
                      <input required value={societyData.state} onChange={e => setSocietyData({ ...societyData, state: e.target.value })} className={inputCls} placeholder="Maharashtra" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Pincode</label>
                      <input value={societyData.pincode} onChange={e => setSocietyData({ ...societyData, pincode: e.target.value })} className={inputCls} placeholder="411001" maxLength={6} />
                    </div>
                    <div>
                      <label className={labelCls}>Total Buildings</label>
                      <input type="number" min="1" value={societyData.buildingsCount} onChange={e => setSocietyData({ ...societyData, buildingsCount: parseInt(e.target.value) || 1 })} className={inputCls} />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors">
                      Next: Assign Admin →
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Step 2: Assign Admin ── */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Toggle */}
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                    {(["new", "existing"] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAdminMode(mode)}
                        className={`flex-1 py-2 text-sm font-semibold transition-colors ${adminMode === mode ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                      >
                        {mode === "new" ? "Create New Admin" : "Select Existing User"}
                      </button>
                    ))}
                  </div>

                  {adminMode === "new" ? (
                    <>
                      <div>
                        <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                        <input required value={adminData.name} onChange={e => setAdminData({ ...adminData, name: e.target.value })} className={inputCls} placeholder="Rahul Shah" />
                      </div>
                      <div>
                        <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                        <input type="email" required value={adminData.email} onChange={e => setAdminData({ ...adminData, email: e.target.value })} className={inputCls} placeholder="admin@society.com" />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input type="tel" value={adminData.phone} onChange={e => setAdminData({ ...adminData, phone: e.target.value })} className={inputCls} placeholder="9876543210" />
                      </div>
                      <div>
                        <label className={labelCls}>Password (auto-generated)</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={adminData.password}
                            onChange={e => setAdminData({ ...adminData, password: e.target.value })}
                            className={inputCls + " pr-10 font-mono"}
                          />
                          <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">This password will be shown to you after creation. Share it with the admin.</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className={labelCls}>Select User <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={selectedUserId}
                        onChange={e => setSelectedUserId(e.target.value)}
                        className={selectCls}
                      >
                        <option value="">— Choose a user —</option>
                        {existingUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                      {existingUsers.length === 0 && (
                        <p className="text-xs text-slate-400 mt-1">No eligible users found. Create a new admin instead.</p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                      {loading ? "Creating…" : "Create Society"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
