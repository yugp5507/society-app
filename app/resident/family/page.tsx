"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Relation =
  | "Spouse"
  | "Son"
  | "Daughter"
  | "Father"
  | "Mother"
  | "Brother"
  | "Sister"
  | "Other";

type FamilyMember = {
  id: string;
  name: string;
  relation: Relation;
  phone: string | null;
  dateOfBirth: string | null;
};

type ToastType = "success" | "error";
type ToastState = { type: ToastType; message: string } | null;

const relations: Relation[] = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Other",
];

function avatarColors(relation: Relation) {
  if (relation === "Spouse") return "bg-blue-600 text-white";
  if (relation === "Son" || relation === "Daughter") return "bg-green-600 text-white";
  if (relation === "Father" || relation === "Mother") return "bg-purple-600 text-white";
  if (relation === "Brother" || relation === "Sister") return "bg-orange-500 text-white";
  return "bg-slate-600 text-white";
}

function firstLetter(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

function dateToInputValue(dob: string | null) {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

type FormState = {
  name: string;
  relation: Relation;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD or ""
};

export default function ResidentFamilyPage() {
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [toast, setToast] = useState<ToastState>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    relation: "Spouse",
    phone: "",
    dateOfBirth: "",
  });

  const formDisabled = useMemo(() => submitting || !form.name || !form.phone, [form.name, form.phone, submitting]);

  async function loadFamily() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/family", { cache: "no-store" });
    const data = (await response.json()) as { familyMembers?: FamilyMember[]; message?: string };
    if (!response.ok) {
      setError(data.message ?? "Failed to load family members");
      setLoading(false);
      return;
    }
    setFamily(data.familyMembers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFamily();
  }, []);

  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function openAddModal() {
    setEditId(null);
    setForm({ name: "", relation: "Spouse", phone: "", dateOfBirth: "" });
    setModalOpen(true);
  }

  function openEditModal(member: FamilyMember) {
    setEditId(member.id);
    setForm({
      name: member.name,
      relation: member.relation,
      phone: member.phone ?? "",
      dateOfBirth: dateToInputValue(member.dateOfBirth),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      relation: form.relation,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth ? form.dateOfBirth : null,
    };

    const url = editId ? `/api/family/${editId}` : "/api/family";
    const method = editId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { message?: string; familyMember?: FamilyMember };

    if (!response.ok) {
      setSubmitting(false);
      showToast("error", data.message ?? "Action failed");
      return;
    }

    setModalOpen(false);
    setSubmitting(false);
    showToast("success", editId ? "Family member updated" : "Family member added");
    await loadFamily();
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this family member?");
    if (!ok) return;

    setDeletingId(id);
    setError("");

    const response = await fetch(`/api/family/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setDeletingId(null);
      showToast("error", data.message ?? "Could not delete");
      return;
    }

    setDeletingId(null);
    showToast("success", "Family member deleted");
    await loadFamily();
  }

  return (
    <>
      <main className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">My Family</h1>
              <p className="text-sm text-slate-600">Manage family members linked to your apartment.</p>
            </div>
            <button
              onClick={openAddModal}
              className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Add Family Member
            </button>
          </div>
        </section>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        {toast ? (
          <div
            className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
            role="status"
          >
            {toast.message}
          </div>
        ) : null}

        {loading ? (
          <section className="rounded-2xl bg-white p-5 shadow-lg">
            <p className="text-sm text-slate-600">Loading family members...</p>
          </section>
        ) : family.length === 0 ? (
          <section className="rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              F
              </div>
              <p className="text-sm font-medium text-slate-800">No family members added yet.</p>
              <p className="text-xs text-slate-600">Add spouse, children, parents, or siblings to keep your profile updated.</p>
              <button
                onClick={openAddModal}
                className="mt-2 rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                Add Family Member
              </button>
            </div>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {family.map((member) => (
              <article key={member.id} className="rounded-2xl bg-white p-5 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${avatarColors(member.relation)}`}>
                      <span className="text-lg font-bold">{firstLetter(member.name)}</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-600">{member.relation}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Phone:</span> {member.phone ?? "N/A"}
                  </p>
                  {member.dateOfBirth ? (
                    <p>
                      <span className="font-medium text-slate-900">DOB:</span>{" "}
                      {new Date(member.dateOfBirth).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => openEditModal(member)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#1e3a5f] hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    disabled={deletingId === member.id}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deletingId === member.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
        </main>
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#1e3a5f]">
                {editId ? "Edit Family Member" : "Add Family Member"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="memberName">
                  Full Name
                </label>
                <input
                  id="memberName"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  placeholder="e.g., Neha Joshi"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="relation">
                  Relation
                </label>
                <select
                  id="relation"
                  value={form.relation}
                  onChange={(e) => setForm((prev) => ({ ...prev, relation: e.target.value as Relation }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  required
                >
                  {relations.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  placeholder="10-digit mobile number"
                  inputMode="tel"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="dob">
                  Date of Birth <span className="text-xs font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                />
              </div>

              <button
                type="submit"
                disabled={formDisabled}
                className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-[#1e3a5f] px-4 py-2.5 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (editId ? "Saving..." : "Adding...") : editId ? "Save Changes" : "Add Member"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

