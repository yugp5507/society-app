"use client";

import { useState, useEffect } from "react";
import { Megaphone, Calendar, FileText, AlertTriangle } from "lucide-react";

const CATEGORY_STYLES: Record<string, { bg: string, text: string, icon: any }> = {
  "General": { bg: "bg-blue-100", text: "text-blue-700", icon: FileText },
  "Maintenance": { bg: "bg-amber-100", text: "text-amber-700", icon: Megaphone },
  "Event": { bg: "bg-purple-100", text: "text-purple-700", icon: Calendar },
  "Urgent": { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
  "Meeting": { bg: "bg-emerald-100", text: "text-emerald-700", icon: Calendar },
};

export default function ResidentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    setLoading(true);
    fetch("/api/notices")
      .then(r => r.json())
      .then(d => setNotices(d.notices ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(notices.map(n => n.category)))];
  
  const filteredNotices = selectedCategory === "All" 
    ? notices 
    : notices.filter(n => n.category === selectedCategory);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
        <p className="text-sm text-slate-500 mt-0.5">Stay updated with the latest society announcements.</p>
      </div>

      {notices.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c 
                  ? "bg-slate-800 text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-6xl mb-4 text-slate-300">📢</div>
          <p className="text-slate-600 font-semibold text-lg">No notices found</p>
          <p className="text-slate-400 text-sm mt-1">There are no announcements at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {filteredNotices.map(n => {
            const style = CATEGORY_STYLES[n.category] || CATEGORY_STYLES["General"];
            const Icon = style.icon;
            return (
              <div key={n.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                {/* Date indicator on left for desktop */}
                <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-slate-50 border-r border-slate-100 min-w-[100px]">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString("en-IN", { month: 'short' })}</span>
                  <span className="text-3xl font-black text-slate-700 leading-none">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: '2-digit' })}</span>
                </div>
                
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                      <Icon className="w-3 h-3" /> {n.category}
                    </span>
                    <span className="text-xs text-slate-400 sm:hidden">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{n.title}</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{n.content}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Published by {n.creator?.name || "Admin"}</span>
                    <span className="hidden sm:inline">{new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
