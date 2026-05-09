"use client";

import { useState } from "react";
import { PlusCircle, Building2, Home, Link as LinkIcon, UserPlus, Copy, Check } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const selectCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelCls = "block text-xs font-medium text-slate-700 mb-1";

function StatusBadge({ apartment }: { apartment: any }) {
  const occupied = !!apartment.resident;
  const invited = !occupied && apartment.inviteTokens?.length > 0;

  if (occupied) return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">● Occupied</span>;
  if (invited) return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">● Invited</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">● Vacant</span>;
}

export default function BuildingsClient({ initialBuildings, societyId }: { initialBuildings: any[], societyId: string }) {
  const [buildings, setBuildings] = useState(initialBuildings);
  const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isApartmentModalOpen, setIsApartmentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inviteLinks, setInviteLinks] = useState<Record<string, string>>({});

  const [buildingData, setBuildingData] = useState({
    name: "", buildingType: "Tower", totalFloors: "", totalApartments: "",
  });

  const [apartmentData, setApartmentData] = useState({
    number: "", floor: "1", type: "2BHK", ownerName: "", ownerPhone: "",
  });

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullName = `${buildingData.buildingType} ${buildingData.name}`.trim();
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          buildingType: buildingData.buildingType,
          totalFloors: parseInt(buildingData.totalFloors) || 0,
          totalApartments: parseInt(buildingData.totalApartments) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to create building");
      const newBuilding = await res.json();
      setBuildings(prev => [...prev, newBuilding]);
      setIsBuildingModalOpen(false);
      setBuildingData({ name: "", buildingType: "Tower", totalFloors: "", totalApartments: "" });
    } catch {
      alert("Error creating building");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/buildings/${selectedBuilding.id}/apartments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: apartmentData.number,
          floor: parseInt(apartmentData.floor) || 0,
          type: apartmentData.type,
          ownerName: apartmentData.ownerName || undefined,
          ownerPhone: apartmentData.ownerPhone || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create apartment");
      const newApt = await res.json();
      const updated = buildings.map(b =>
        b.id === selectedBuilding.id ? { ...b, apartments: [...b.apartments, newApt] } : b
      );
      setBuildings(updated);
      setSelectedBuilding(updated.find(b => b.id === selectedBuilding.id));
      setIsApartmentModalOpen(false);
      setApartmentData({ number: "", floor: "1", type: "2BHK", ownerName: "", ownerPhone: "" });
    } catch {
      alert("Error creating apartment");
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = async (apartmentId: string) => {
    try {
      const res = await fetch(`/api/apartments/${apartmentId}/invite`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { link, token } = await res.json();
      setInviteLinks(prev => ({ ...prev, [apartmentId]: link }));
      const updated = buildings.map(b => ({
        ...b,
        apartments: b.apartments.map((a: any) =>
          a.id === apartmentId ? { ...a, inviteTokens: [token] } : a
        ),
      }));
      setBuildings(updated);
      if (selectedBuilding) setSelectedBuilding(updated.find((b: any) => b.id === selectedBuilding.id));
    } catch {
      alert("Error generating invite link");
    }
  };

  const copyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLink = (apt: any) => {
    if (inviteLinks[apt.id]) return inviteLinks[apt.id];
    const t = apt.inviteTokens?.[0];
    if (t && typeof window !== "undefined") return `${window.location.origin}/join?token=${t.token}`;
    return null;
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buildings & Apartments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage buildings, flats and generate resident invite links.</p>
        </div>
        <button
          onClick={() => setIsBuildingModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Add Building
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6">

        {/* Left: Buildings list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[50vh] lg:max-h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-slate-400" /> All Buildings ({buildings.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
            {buildings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No buildings added yet.</p>
              </div>
            ) : buildings.map(b => {
              const occupied = b.apartments.filter((a: any) => a.resident).length;
              const active = selectedBuilding?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBuilding(b)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${active ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-sm ${active ? "text-blue-800" : "text-slate-800"}`}>{b.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{b.apartments.length} flats · {occupied} occupied</p>
                    </div>
                    <Building2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${active ? "text-blue-400" : "text-slate-300"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Apartments table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px] lg:max-h-[calc(100vh-200px)]">
          {selectedBuilding ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{selectedBuilding.name} — Apartments</span>
                </h2>
                <button
                  onClick={() => setIsApartmentModalOpen(true)}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Apartment
                </button>
              </div>

              <div className="overflow-auto flex-1">
                {selectedBuilding.apartments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center p-6">
                    <Home className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-slate-500 font-medium text-sm">No apartments yet</p>
                    <button onClick={() => setIsApartmentModalOpen(true)} className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                      <PlusCircle className="w-4 h-4" /> Add First Apartment
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                      <tr>
                        {["Flat No", "Floor", "Type", "Owner", "Status", "Invite"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedBuilding.apartments.map((apt: any) => {
                        const link = getLink(apt);
                        const isOccupied = !!apt.resident;
                        // Parse flat number and type from stored string "101 (2BHK)"
                        const match = apt.number.match(/^(.+?)\s*\((.+?)\)$/);
                        const flatNo = match ? match[1] : apt.number;
                        const flatType = match ? match[2] : "—";
                        return (
                          <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800">{flatNo}</td>
                            <td className="px-4 py-3 text-slate-600">Floor {apt.floor}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{flatType}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {isOccupied ? (
                                <div>
                                  <div className="font-medium text-slate-800 text-xs">{apt.resident.name}</div>
                                  {apt.resident.phone && <div className="text-slate-400 text-xs">{apt.resident.phone}</div>}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3"><StatusBadge apartment={apt} /></td>
                            <td className="px-4 py-3">
                              {isOccupied ? (
                                <span className="text-xs text-slate-400">—</span>
                              ) : link ? (
                                <button
                                  onClick={() => copyLink(link, apt.id)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  {copiedId === apt.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copiedId === apt.id ? "Copied!" : "Copy Link"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => generateInviteLink(apt.id)}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                  <LinkIcon className="w-3 h-3" /> Generate
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-3 p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-200" />
              <p className="text-sm">Select a building from the left to view apartments</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Building Modal ── */}
      {isBuildingModalOpen && (
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
              <h3 className="font-bold text-slate-800">Add Building</h3>
              <button onClick={() => setIsBuildingModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleCreateBuilding} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className={labelCls}>Type</label>
                  <select value={buildingData.buildingType} onChange={e => setBuildingData({ ...buildingData, buildingType: e.target.value })} className={selectCls}>
                    <option>Tower</option>
                    <option>Wing</option>
                    <option>Block</option>
                    <option>Row</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Name / Number</label>
                  <input required value={buildingData.name} onChange={e => setBuildingData({ ...buildingData, name: e.target.value })} placeholder="A, B, or 1" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Total Floors</label>
                  <input type="number" min="1" value={buildingData.totalFloors} onChange={e => setBuildingData({ ...buildingData, totalFloors: e.target.value })} placeholder="12" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Total Apartments</label>
                  <input type="number" min="1" value={buildingData.totalApartments} onChange={e => setBuildingData({ ...buildingData, totalApartments: e.target.value })} placeholder="48" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsBuildingModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Creating…" : "Create Building"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Apartment Modal ── */}
      {isApartmentModalOpen && (
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
              <h3 className="font-bold text-slate-800 truncate">Add Apartment — {selectedBuilding?.name}</h3>
              <button onClick={() => setIsApartmentModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0">✕</button>
            </div>
            <form onSubmit={handleCreateApartment} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Apartment Number <span className="text-red-500">*</span></label>
                <input required value={apartmentData.number} onChange={e => setApartmentData({ ...apartmentData, number: e.target.value })} placeholder="e.g. 101, A-201" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Floor <span className="text-red-500">*</span></label>
                  <input type="number" required min="0" value={apartmentData.floor} onChange={e => setApartmentData({ ...apartmentData, floor: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={apartmentData.type} onChange={e => setApartmentData({ ...apartmentData, type: e.target.value })} className={selectCls}>
                    <option>Studio</option>
                    <option>1BHK</option>
                    <option>2BHK</option>
                    <option>3BHK</option>
                    <option>4BHK</option>
                    <option>Rowhouse</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Owner Name <span className="text-slate-400">(optional)</span></label>
                <input value={apartmentData.ownerName} onChange={e => setApartmentData({ ...apartmentData, ownerName: e.target.value })} placeholder="Rahul Sharma" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Owner Phone <span className="text-slate-400">(optional)</span></label>
                <input type="tel" value={apartmentData.ownerPhone} onChange={e => setApartmentData({ ...apartmentData, ownerPhone: e.target.value })} placeholder="9876543210" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsApartmentModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Adding…" : "Add Apartment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
