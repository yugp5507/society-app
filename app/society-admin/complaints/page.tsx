"use client";

import { useEffect, useMemo, useState } from "react";

type ComplaintStatusFilter = "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED";
type CategoryFilter =
  | "ALL"
  | "Plumbing"
  | "Electrical"
  | "Cleanliness"
  | "Security"
  | "Parking"
  | "Lift"
  | "Other";

type Complaint = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  residentName: string;
  apartmentNumber: string;
  createdAt: string;
  adminResponse?: string | null;
};

const categories: CategoryFilter[] = [
  "ALL",
  "Plumbing",
  "Electrical",
  "Cleanliness",
  "Security",
  "Parking",
  "Lift",
  "Other",
];

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

function getNextStatus(status: Complaint["status"]): "OPEN" | "IN_PROGRESS" | "RESOLVED" {
  if (status === "OPEN") return "IN_PROGRESS";
  if (status === "IN_PROGRESS") return "RESOLVED";
  return "RESOLVED";
}

export default function SocietyAdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const statusMatch = statusFilter === "ALL" || item.status === statusFilter;
      const categoryMatch = categoryFilter === "ALL" || item.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [categoryFilter, complaints, statusFilter]);

  async function loadComplaints() {
    const response = await fetch("/api/complaints", { cache: "no-store" });
    const data = (await response.json()) as { complaints?: Complaint[]; message?: string };

    if (!response.ok) {
      setError(data.message ?? "Failed to load complaints");
      setLoading(false);
      return;
    }

    const fetched = data.complaints ?? [];
    setComplaints(fetched);
    setResponses(
      fetched.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.adminResponse ?? "";
        return acc;
      }, {})
    );
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadComplaints();
  }, []);

  async function updateComplaint(complaint: Complaint) {
    if (complaint.status === "RESOLVED") return;

    setSavingId(complaint.id);
    setError("");
    setLoading(true);
    const response = await fetch(`/api/complaints/${complaint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: getNextStatus(complaint.status),
        adminResponse: responses[complaint.id] || undefined,
      }),
    });

    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(data.message ?? "Failed to update complaint");
      setSavingId(null);
      return;
    }

    setSavingId(null);
    await loadComplaints();
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-2xl bg-white p-5 shadow-lg">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Complaints Management</h1>
          <p className="text-sm text-slate-600">Review and resolve resident complaints efficiently.</p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ComplaintStatusFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e3a5f]"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e3a5f]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "ALL" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <section className="space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-white p-5 shadow-lg text-sm text-slate-600">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="rounded-2xl bg-white p-5 shadow-lg text-sm text-slate-600">No complaints found.</div>
          ) : (
            filteredComplaints.map((complaint) => (
              <article key={complaint.id} className="rounded-2xl bg-white p-5 shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{complaint.title}</p>
                    <p className="text-sm text-slate-600">
                      {complaint.category} - {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Resident: <span className="font-medium">{complaint.residentName}</span> | Apartment:{" "}
                      <span className="font-medium">{complaint.apartmentNumber}</span>
                    </p>
                  </div>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(complaint.status)}`}>
                    {getStatusLabel(complaint.status)}
                  </span>
                </div>

                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{complaint.description}</p>

                <div className="mt-3 grid gap-3">
                  <textarea
                    value={responses[complaint.id] ?? ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [complaint.id]: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Add admin response/comment"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a5f]"
                  />
                  <button
                    onClick={() => updateComplaint(complaint)}
                    disabled={complaint.status === "RESOLVED" || savingId === complaint.id}
                    className="w-full rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {savingId === complaint.id
                      ? "Updating..."
                      : complaint.status === "OPEN"
                        ? "Move to In Progress"
                        : complaint.status === "IN_PROGRESS"
                          ? "Mark as Resolved"
                          : "Resolved"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
