"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, Clock, Users, MapPin, IndianRupee } from "lucide-react";

const AMENITY_ICONS: Record<string, string> = {
  "Clubhouse": "🏛️", "Swimming Pool": "🏊", "Gym": "💪",
  "Badminton Court": "🏸", "Community Hall": "🏛️", "Terrace Garden": "🌿",
  "Party Lawn": "🎉", "Cricket Ground": "🏏", "Tennis Court": "🎾",
  "Yoga Room": "🧘", "Library": "📚",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOT_OPTS = [
  { label: "30 mins", value: 30 }, { label: "1 Hour", value: 60 },
  { label: "2 Hours", value: 120 }, { label: "Half Day (4hrs)", value: 240 },
  { label: "Full Day (8hrs)", value: 480 },
];
const AMENITY_NAMES = ["Clubhouse", "Swimming Pool", "Gym", "Badminton Court",
  "Community Hall", "Terrace Garden", "Party Lawn", "Cricket Ground", "Tennis Court", "Yoga Room", "Library"];

const emptyForm = {
  name: "Clubhouse", description: "", capacity: "20", location: "",
  availableDays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  openTime: "06:00", closeTime: "22:00", slotDuration: "60",
  advanceBookDays: "7", isPaid: false, pricePerSlot: "", status: "ACTIVE",
};

const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900";
const lbl = "block text-xs font-semibold text-slate-600 mb-1";

export default function SocietyAdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/amenities")
      .then(r => r.json())
      .then(d => setAmenities(d.amenities ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowModal(true); };
  const openEdit = (a: any) => {
    setEditing(a);
    setForm({
      name: a.name, description: a.description ?? "", capacity: String(a.capacity),
      location: a.location ?? "", availableDays: a.availableDays.split(","),
      openTime: a.openTime, closeTime: a.closeTime, slotDuration: String(a.slotDuration),
      advanceBookDays: String(a.advanceBookDays), isPaid: a.isPaid,
      pricePerSlot: a.pricePerSlot ? String(a.pricePerSlot) : "", status: a.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      const url = editing ? `/api/amenities/${editing.id}` : "/api/amenities";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      load();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this amenity? All bookings will also be deleted.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/amenities/${id}`, { method: "DELETE" });
      setAmenities(prev => prev.filter(a => a.id !== id));
    } catch { alert("Error deleting"); }
    finally { setDeleting(null); }
  };

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day],
    }));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Amenities</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage bookable amenities in your society.</p>
        </div>
        <button onClick={openAdd} className="self-start sm:self-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm">
          <PlusCircle className="w-4 h-4" /> Add Amenity
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : amenities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-6xl mb-4">🏛️</div>
          <p className="text-slate-600 font-semibold text-lg">No amenities yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first amenity to start accepting bookings.</p>
          <button onClick={openAdd} className="mt-5 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 text-sm">
            <PlusCircle className="w-4 h-4" /> Add First Amenity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {amenities.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Card header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {AMENITY_ICONS[a.name] ?? "🏛️"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{a.name}</h3>
                      {a.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {a.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${a.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {a.status === "ACTIVE" ? "● Active" : "○ Inactive"}
                  </span>
                </div>
                {a.description && <p className="text-sm text-slate-500 mt-3 line-clamp-2">{a.description}</p>}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                <div className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-0.5"><Users className="w-3 h-3" /> Capacity</div>
                  <div className="font-bold text-slate-900 text-sm">{a.capacity}</div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-0.5"><Clock className="w-3 h-3" /> Slot</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {a.slotDuration >= 60 ? `${a.slotDuration / 60}h` : `${a.slotDuration}m`}
                  </div>
                </div>
                <div className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-0.5"><IndianRupee className="w-3 h-3" /> Price</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {a.isPaid ? `₹${Number(a.pricePerSlot).toFixed(0)}` : "Free"}
                  </div>
                </div>
              </div>

              {/* Timing + Days */}
              <div className="px-5 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>⏰ {a.openTime} – {a.closeTime}</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {DAYS.map(d => (
                      <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${a.availableDays.includes(d) ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 flex gap-2">
                <button onClick={() => openEdit(a)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {deleting === a.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
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
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-bold text-slate-900">{editing ? "Edit Amenity" : "Add Amenity"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className={lbl}>Amenity Name</label>
                <select value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp}>
                  {AMENITY_NAMES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className={lbl}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inp + " resize-none"} rows={2} placeholder="Brief description…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Capacity (people)</label>
                  <input type="number" min="1" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Location in Society</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inp} placeholder="Near Gate 2…" />
                </div>
              </div>

              {/* Available Days */}
              <div>
                <label className={lbl}>Available Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${form.availableDays.includes(d) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Opening Time</label>
                  <input type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Closing Time</label>
                  <input type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} className={inp} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Slot Duration</label>
                  <select value={form.slotDuration} onChange={e => setForm({ ...form, slotDuration: e.target.value })} className={inp}>
                    {SLOT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Advance Booking (days)</label>
                  <input type="number" min="0" max="60" value={form.advanceBookDays} onChange={e => setForm({ ...form, advanceBookDays: e.target.value })} className={inp} />
                </div>
              </div>

              {/* Paid? */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPaid} onChange={e => setForm({ ...form, isPaid: e.target.checked })} className="h-4 w-4 rounded" />
                  <span className="text-sm font-semibold text-slate-700">Paid Amenity</span>
                </label>
                {form.isPaid && (
                  <div className="flex items-center gap-2 flex-1">
                    <IndianRupee className="w-4 h-4 text-slate-500" />
                    <input type="number" min="0" value={form.pricePerSlot} onChange={e => setForm({ ...form, pricePerSlot: e.target.value })} placeholder="500" className={inp} />
                    <span className="text-xs text-slate-500 whitespace-nowrap">per slot</span>
                  </div>
                )}
              </div>

              <div>
                <label className={lbl}>Status</label>
                <div className="flex gap-3">
                  {["ACTIVE", "INACTIVE"].map(s => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${form.status === s ? (s === "ACTIVE" ? "bg-emerald-600 text-white" : "bg-slate-600 text-white") : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {s === "ACTIVE" ? "● Active" : "○ Inactive"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Update Amenity" : "Create Amenity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
