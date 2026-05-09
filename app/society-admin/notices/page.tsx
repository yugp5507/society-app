"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, Megaphone, Calendar, FileText, AlertTriangle } from "lucide-react";

const CATEGORIES = ["General", "Maintenance", "Event", "Urgent", "Meeting"];

const CATEGORY_STYLES: Record<string, { bg: string, text: string, icon: any }> = {
  "General": { bg: "bg-blue-100", text: "text-blue-700", icon: FileText },
  "Maintenance": { bg: "bg-amber-100", text: "text-amber-700", icon: Megaphone },
  "Event": { bg: "bg-purple-100", text: "text-purple-700", icon: Calendar },
  "Urgent": { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
  "Meeting": { bg: "bg-emerald-100", text: "text-emerald-700", icon: Calendar },
};

const emptyForm = { title: "", content: "", category: "General" };

export default function SocietyAdminNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadNotices = () => {
    setLoading(true);
    fetch("/api/notices")
      .then(r => r.json())
      .then(d => setNotices(d.notices ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadNotices, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (n: any) => { setEditing(n); setForm({ title: n.title, content: n.content, category: n.category }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/notices/${editing.id}` : "/api/notices";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      loadNotices();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Error saving notice");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/notices/${id}`, { method: "DELETE" });
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch { alert("Error deleting notice"); }
    finally { setDeleting(null); }
  };

  const inp = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900";

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
          <p className="text-sm text-slate-500 mt-0.5">Publish announcements and circulars for residents.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm">
          <PlusCircle className="w-4 h-4" /> Create Notice
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : notices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-6xl mb-4 text-slate-300">📢</div>
          <p className="text-slate-600 font-semibold text-lg">No notices published</p>
          <p className="text-slate-400 text-sm mt-1">Create your first notice to keep residents informed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {notices.map(n => {
            const style = CATEGORY_STYLES[n.category] || CATEGORY_STYLES["General"];
            const Icon = style.icon;
            return (
              <div key={n.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                      <Icon className="w-3 h-3" /> {n.category}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{n.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">{n.content}</p>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">By {n.creator?.name || "Admin"}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(n)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 text-lg">{editing ? "Edit Notice" : "Create Notice"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} placeholder="Notice title..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                <textarea required rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={inp + " resize-none"} placeholder="Write the notice details here..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update Notice" : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
