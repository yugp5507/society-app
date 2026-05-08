"use client";

import { useState } from "react";
import { PlusCircle, Home, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SocietiesClient({ initialSocieties }: { initialSocieties: any[] }) {
  const [societies, setSocieties] = useState(initialSocieties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  const [societyData, setSocietyData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    type: "Apartment",
    buildingsCount: 1,
  });

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullAddress = `${societyData.address}, ${societyData.state} (${societyData.type})`;
      const res = await fetch("/api/societies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          society: {
            name: societyData.name,
            address: fullAddress,
            city: societyData.city,
          },
          admin: adminData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create society");
      }
      
      const newSociety = await res.json();
      
      // Add to list and reset
      setSocieties([newSociety, ...societies]);
      setIsModalOpen(false);
      setStep(1);
      setSocietyData({ name: "", address: "", city: "", state: "", type: "Apartment", buildingsCount: 1 });
      setAdminData({ name: "", email: "", phone: "", password: "" });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error creating society");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Societies</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage onboarded societies across the platform.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create Society
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Society</th>
                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Location</th>
                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Admin</th>
                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Buildings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {societies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No Societies onboarded yet.
                  </td>
                </tr>
              ) : (
                societies.map((soc) => (
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
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {soc.city}
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5 ml-5 truncate max-w-[200px]">{soc.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      {soc.admin ? (
                        <div>
                          <div className="font-medium text-slate-800">{soc.admin.name}</div>
                          <div className="text-xs text-slate-500">{soc.admin.email}</div>
                        </div>
                      ) : (
                        <span className="text-amber-500 font-medium text-xs">No Admin Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {soc.buildings?.length || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg shadow-xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                  <div className={`h-0.5 w-8 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                </div>
                <p className="text-xs text-slate-500">{step === 1 ? 'Society Details' : 'Assign Admin'}</p>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setStep(1); }} 
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {step === 1 ? (
                <form onSubmit={handleNext} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Society Name</label>
                    <input
                      type="text"
                      required
                      value={societyData.name}
                      onChange={(e) => setSocietyData({ ...societyData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Green Valley Residency"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={societyData.city}
                        onChange={(e) => setSocietyData({ ...societyData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pune"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={societyData.state}
                        onChange={(e) => setSocietyData({ ...societyData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      required
                      value={societyData.address}
                      onChange={(e) => setSocietyData({ ...societyData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Society Type</label>
                      <select
                        value={societyData.type}
                        onChange={(e) => setSocietyData({ ...societyData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="Rowhouse">Rowhouse</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Total Buildings</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={societyData.buildingsCount}
                        onChange={(e) => setSocietyData({ ...societyData, buildingsCount: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Next: Assign Admin
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-emerald-100 mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                    Society details saved. Now create the admin account.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      value={adminData.name}
                      onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rahul Shah"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@society.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={adminData.phone}
                      onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? "Creating..." : "Create Society & Admin"}
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

