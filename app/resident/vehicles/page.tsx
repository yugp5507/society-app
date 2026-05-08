"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Car, Bike, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";

type VehicleType = "Car" | "Motorcycle" | "Scooter" | "Cycle";
type VehicleColor = "Red" | "White" | "Black" | "Silver" | "Blue" | "Other";

type Vehicle = {
  id: string;
  plateNumber: string;
  type: VehicleType;
  brand: string | null;
  color: VehicleColor | null;
  createdAt: string;
};

type ToastType = "success" | "error";
type ToastState = { type: ToastType; message: string } | null;

const vehicleTypes: VehicleType[] = ["Car", "Motorcycle", "Scooter", "Cycle"];
const vehicleColors: VehicleColor[] = ["White", "Black", "Silver", "Red", "Blue", "Other"];

const colorStyles: Record<string, string> = {
  Red: "bg-red-500",
  White: "bg-white border border-slate-300",
  Black: "bg-slate-900",
  Silver: "bg-slate-300",
  Blue: "bg-blue-500",
  Other: "bg-slate-400",
};

export default function ResidentVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [toast, setToast] = useState<ToastState>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    plateNumber: "",
    type: "Car" as VehicleType,
    brand: "",
    color: "White" as VehicleColor,
  });

  const formDisabled = useMemo(
    () => submitting || !form.plateNumber.trim(),
    [form.plateNumber, submitting]
  );

  async function loadVehicles() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/vehicles", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "Failed to load vehicles");
      } else {
        setVehicles(data.vehicles ?? []);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function openAddModal() {
    setEditId(null);
    setForm({ plateNumber: "", type: "Car", brand: "", color: "White" });
    setModalOpen(true);
  }

  function openEditModal(v: Vehicle) {
    setEditId(v.id);
    setForm({
      plateNumber: v.plateNumber,
      type: v.type,
      brand: v.brand ?? "",
      color: v.color ?? "White",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      plateNumber: form.plateNumber,
      type: form.type,
      brand: form.brand.trim() || null,
      color: form.color,
    };

    const url = editId ? `/api/vehicles/${editId}` : "/api/vehicles";
    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitting(false);
        showToast("error", data.message ?? "Action failed");
        return;
      }

      setModalOpen(false);
      setSubmitting(false);
      showToast("success", editId ? "Vehicle updated" : "Vehicle added");
      await loadVehicles();
    } catch (err) {
      setSubmitting(false);
      showToast("error", "An unexpected error occurred");
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this vehicle?");
    if (!ok) return;

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setDeletingId(null);
        showToast("error", data.message ?? "Could not delete");
        return;
      }

      setDeletingId(null);
      showToast("success", "Vehicle deleted");
      await loadVehicles();
    } catch (err) {
      setDeletingId(null);
      showToast("error", "An unexpected error occurred");
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Vehicles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vehicles registered to your apartment.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </section>

      {/* ── Feedback ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <section className="rounded-xl bg-white p-12 border border-slate-200 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No vehicles found</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            You haven't registered any vehicles yet. Add your car or two-wheeler to ensure smooth access at the gate.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((v) => {
            const Icon = v.type === "Car" ? Car : Bike;
            return (
              <article
                key={v.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    {v.color && (
                      <div
                        title={`Color: ${v.color}`}
                        className={`w-4 h-4 rounded-full shadow-sm ring-1 ring-slate-200 ${colorStyles[v.color]}`}
                      />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {v.brand || "Unknown Model"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{v.type}</p>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <div className="bg-[#FFD700] px-4 py-1.5 rounded-[4px] border-2 border-black/80 shadow-sm w-full text-center tracking-widest relative overflow-hidden">
                      {/* Optional IND styling detail */}
                      <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-center items-center">
                        <div className="w-1.5 h-1.5 rounded-full border border-black/20 mb-[1px]"></div>
                        <span className="text-[6px] font-bold text-blue-800 leading-none">IND</span>
                      </div>
                      <span className="text-base font-bold text-black uppercase block pl-2">
                        {v.plateNumber}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(v)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editId ? "Edit Vehicle" : "Add Vehicle"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {vehicleTypes.map((t) => {
                    const active = form.type === t;
                    const Icon = t === "Car" ? Car : Bike;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          active
                            ? "bg-blue-50 border-blue-600 text-blue-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" /> {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="brand">
                  Brand & Model <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="brand"
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g., Honda City, Activa 6G"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="plate">
                  Plate Number
                </label>
                <input
                  id="plate"
                  type="text"
                  value={form.plateNumber}
                  onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g., GJ05AB1234"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-shadow font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {vehicleColors.map((c) => {
                    const active = form.color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        title={c}
                        className={`w-8 h-8 rounded-full shadow-sm relative transition-transform hover:scale-110 ${colorStyles[c]} ${
                          active ? "ring-2 ring-offset-2 ring-blue-600" : "ring-1 ring-slate-200"
                        }`}
                      >
                        {/* Optionally add a checkmark for the active state */}
                        {active && c === "White" && (
                          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-slate-900" />
                        )}
                        {active && c !== "White" && (
                          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formDisabled}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
