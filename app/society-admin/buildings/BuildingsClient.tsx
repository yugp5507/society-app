"use client";

import { useState } from "react";
import { PlusCircle, Building2, Home, Link as LinkIcon, UserPlus } from "lucide-react";

export default function BuildingsClient({ initialBuildings, societyId }: { initialBuildings: any[], societyId: string }) {
  const [buildings, setBuildings] = useState(initialBuildings);
  const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isApartmentModalOpen, setIsApartmentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [buildingData, setBuildingData] = useState({ name: "", type: "Tower" });
  const [apartmentData, setApartmentData] = useState({ number: "", floor: 1, type: "2BHK" });
  const [inviteLink, setInviteLink] = useState<{ [aptId: string]: string }>({});

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${buildingData.type} ${buildingData.name}`.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create building");
      const newBuilding = await res.json();
      setBuildings([newBuilding, ...buildings]);
      setIsBuildingModalOpen(false);
      setBuildingData({ name: "", type: "Tower" });
    } catch (error) {
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
          number: `${apartmentData.number} (${apartmentData.type})`,
          floor: apartmentData.floor,
        }),
      });
      if (!res.ok) throw new Error("Failed to create apartment");
      const newApartment = await res.json();
      const updatedBuildings = buildings.map(b =>
        b.id === selectedBuilding.id ? { ...b, apartments: [...b.apartments, newApartment] } : b
      );
      setBuildings(updatedBuildings);
      setSelectedBuilding(updatedBuildings.find(b => b.id === selectedBuilding.id));
      setIsApartmentModalOpen(false);
      setApartmentData({ number: "", floor: 1, type: "2BHK" });
    } catch (error) {
      alert("Error creating apartment");
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = async (apartmentId: string) => {
    try {
      const res = await fetch(`/api/apartments/${apartmentId}/invite`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate invite link");
      const { link, token } = await res.json();
      setInviteLink(prev => ({ ...prev, [apartmentId]: link }));
      const updatedBuildings = buildings.map(b => ({
        ...b,
        apartments: b.apartments.map((a: any) =>
          a.id === apartmentId ? { ...a, inviteTokens: [token] } : a
        )
      }));
      setBuildings(updatedBuildings);
      if (selectedBuilding) setSelectedBuilding(updatedBuildings.find(b => b.id === selectedBuilding.id));
    } catch (error) {
      alert("Error generating invite link");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const selectCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Buildings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Set up buildings and generate resident invites.</p>
        </div>
        <button
          onClick={() => setIsBuildingModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Add Building
        </button>
      </div>

      {/* Responsive 2-column layout: stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6">

        {/* Buildings List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[50vh] lg:max-h-[calc(100vh-220px)]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              All Buildings ({buildings.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5 custom-scrollbar">
            {buildings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No buildings added yet.</p>
              </div>
            ) : (
              buildings.map(building => (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuilding(building)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                    selectedBuilding?.id === building.id
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <h3 className={`font-bold text-sm ${selectedBuilding?.id === building.id ? "text-blue-800" : "text-slate-800"}`}>
                      {building.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{building.apartments.length} Apartments</p>
                  </div>
                  <Building2 className={`w-4 h-4 flex-shrink-0 ${selectedBuilding?.id === building.id ? "text-blue-500" : "text-slate-300"}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Apartments Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px] lg:max-h-[calc(100vh-220px)]">
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
                  <PlusCircle className="w-3.5 h-3.5" /> Add Flat
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
                {selectedBuilding.apartments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Home className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-slate-500 font-medium">No apartments yet</p>
                    <button onClick={() => setIsApartmentModalOpen(true)} className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                      <PlusCircle className="w-4 h-4" /> Add First Flat
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {selectedBuilding.apartments.map((apt: any) => {
                      const isOccupied = !!apt.resident;
                      const validToken = apt.inviteTokens?.[0];
                      const link = inviteLink[apt.id] || (validToken && typeof window !== "undefined" ? `${window.location.origin}/join?token=${validToken.token}` : null);
                      return (
                        <div key={apt.id} className="border border-slate-200 rounded-xl p-4 flex flex-col hover:border-slate-300 hover:shadow-sm transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-800">{apt.number}</h3>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Fl {apt.floor}</span>
                              </div>
                              <p className="text-xs font-semibold mt-1">
                                {isOccupied ? (
                                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Occupied</span>
                                ) : (
                                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Vacant</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="mt-auto pt-3 border-t border-slate-100">
                            {!isOccupied ? (
                              link ? (
                                <button onClick={() => copyToClipboard(link)} className="w-full flex justify-center items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                  <LinkIcon className="w-3.5 h-3.5" /> Copy Invite Link
                                </button>
                              ) : (
                                <button onClick={() => generateInviteLink(apt.id)} className="w-full flex justify-center items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors">
                                  <UserPlus className="w-3.5 h-3.5 text-slate-400" /> Generate Invite
                                </button>
                              )
                            ) : (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Resident</span>
                                <span className="font-medium text-slate-700 truncate ml-2">{apt.resident?.name || 'N/A'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-3 p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-200" />
              <p className="text-sm">Select a building to view apartments</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Building Modal ── */}
      {isBuildingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-sm shadow-xl rounded-t-2xl">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Add Building</h3>
              <button onClick={() => setIsBuildingModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleCreateBuilding} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select value={buildingData.type} onChange={(e) => setBuildingData({ ...buildingData, type: e.target.value })} className={selectCls}>
                    <option>Tower</option><option>Block</option><option>Wing</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Name / Number</label>
                  <input required value={buildingData.name} onChange={(e) => setBuildingData({ ...buildingData, name: e.target.value })} placeholder="A, B, or 1" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsBuildingModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Apartment Modal ── */}
      {isApartmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-sm shadow-xl rounded-t-2xl">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 truncate">Add Flat — {selectedBuilding?.name}</h3>
              <button onClick={() => setIsApartmentModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0">✕</button>
            </div>
            <form onSubmit={handleCreateApartment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Flat Number</label>
                <input required value={apartmentData.number} onChange={(e) => setApartmentData({ ...apartmentData, number: e.target.value })} placeholder="e.g. 101, A-101" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Floor</label>
                  <input type="number" required value={apartmentData.floor} onChange={(e) => setApartmentData({ ...apartmentData, floor: parseInt(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select value={apartmentData.type} onChange={(e) => setApartmentData({ ...apartmentData, type: e.target.value })} className={selectCls}>
                    <option>1BHK</option><option>2BHK</option><option>3BHK</option><option>4BHK+</option><option>Rowhouse</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsApartmentModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Adding…" : "Add Flat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
