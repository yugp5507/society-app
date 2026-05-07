"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import Sidebar from "@/src/components/Sidebar";

type ComplaintStatusFilter = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED";

type Complaint = {
  id: string;
  title: string;
  category: string;
  description: string;
  photo?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  adminResponse?: string | null;
};

type CreateFormState = {
  title: string;
  category: "Plumbing" | "Electrical" | "Cleanliness" | "Security" | "Parking" | "Lift" | "Other";
  description: string;
  photo: File | null;
};

const categories = ["Plumbing", "Electrical", "Cleanliness", "Security", "Parking", "Lift", "Other"] as const;

function getBadgeClass(status: Complaint["status"]) {
  if (status === "OPEN") return "bg-red-100 text-red-700";
  if (status === "IN_PROGRESS") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function getStatusLabel(status: Complaint["status"]) {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "RESOLVED") return "Resolved";
  return "Open";
}

export default function ResidentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateFormState>({
    title: "",
    category: "Plumbing",
    description: "",
    photo: null,
  });

  const filteredComplaints = useMemo(() => {
    if (statusFilter === "ALL") return complaints;
    return complaints.filter((item) => item.status === statusFilter);
  }, [complaints, statusFilter]);

  async function loadComplaints() {
    const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
    const response = await fetch(`/api/complaints${query}`, { cache: "no-store" });
    const data = (await response.json()) as { complaints?: Complaint[]; message?: string };

    if (!response.ok) {
      setError(data.message ?? "Failed to load complaints");
      setLoading(false);
      return;
    }

    setComplaints(data.complaints ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("description", form.description);
    if (form.photo) formData.append("photo", form.photo);

    const response = await fetch("/api/complaints", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(data.message ?? "Could not submit complaint");
      setSubmitting(false);
      return;
    }

    setForm({ title: "", category: "Plumbing", description: "", photo: null });
    setShowCreate(false);
    setSubmitting(false);
    setLoading(true);
    await loadComplaints();
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[250px_1fr]">
        <Sidebar variant="resident" />

        <main className="space-y-5">
        <section className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">My Complaints</h1>
              <p className="text-sm text-slate-600">Track and manage your raised issues.</p>
            </div>
            <button
              onClick={() => setShowCreate((prev) => !prev)}
              className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Raise New Complaint
            </button>
          </div>
        </section>

        {showCreate ? (
          <section className="rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Create Complaint</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Complaint title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                required
              />
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value as CreateFormState["category"],
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue in detail"
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, photo: e.target.files?.[0] ?? null }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#1e3a5f] px-4 py-2.5 font-semibold text-white hover:opacity-95 disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setLoading(true);
                  setStatusFilter(item);
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  statusFilter === item ? "bg-[#1e3a5f] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {item === "IN_PROGRESS" ? "In Progress" : item === "ALL" ? "All" : item[0] + item.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {error ? (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-600">Loading complaints...</p>
          ) : filteredComplaints.length === 0 ? (
            <p className="text-sm text-slate-600">No complaints found.</p>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((complaint) => (
                <article key={complaint.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{complaint.title}</p>
                      <p className="text-sm text-slate-600">
                        {complaint.category} - {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(complaint.status)}`}>
                      {getStatusLabel(complaint.status)}
                    </span>
                  </div>
                  <button
                    className="mt-3 text-sm font-medium text-[#1e3a5f] hover:underline"
                    onClick={() => setExpandedId((prev) => (prev === complaint.id ? null : complaint.id))}
                  >
                    {expandedId === complaint.id ? "Hide details" : "View full details"}
                  </button>

                  {expandedId === complaint.id ? (
                    <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <p>{complaint.description}</p>
                      {complaint.photo ? (
                        <a href={complaint.photo} target="_blank" className="font-medium text-[#1e3a5f] underline" rel="noreferrer">
                          View attached photo
                        </a>
                      ) : null}
                      {complaint.adminResponse ? (
                        <p>
                          <span className="font-semibold">Admin response:</span> {complaint.adminResponse}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
        </main>
      </div>
    </div>
  );
}
