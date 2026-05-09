"use client";

import { useState, useEffect } from "react";

const PURPOSES = ["Meeting Resident", "Delivery", "Service/Repair", "Cab/Auto", "Guest", "Other"];

function NumberPlate({ value, onChange, isValid = true }: { value: string; onChange: (v: string) => void, isValid?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch", borderRadius: "8px",
      overflow: "hidden", border: `3px solid ${isValid ? '#1a1a1a' : '#EF4444'}`, width: "100%",
      boxShadow: "0 2px 8px rgba(0,0,0,0.25)", background: isValid ? "#fff" : "#FEF2F2",
    }}>
      {/* IND strip */}
      <div style={{
        background: "#003580", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "6px 10px", flexShrink: 0,
      }}>
        <span style={{ fontSize: "10px", color: "#FFD700", fontWeight: 800, letterSpacing: "1px" }}>🇮🇳</span>
        <span style={{ fontSize: "9px", color: "#fff", fontWeight: 800, marginTop: "2px", letterSpacing: "1px" }}>IND</span>
      </div>
      {/* Plate input */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value.toUpperCase().replace(/\s/g, ''))}
        placeholder="MH 12 AB 1234"
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          fontFamily: "'Courier New', monospace", fontWeight: 800,
          fontSize: "22px", letterSpacing: "4px", color: isValid ? "#1a1a1a" : "#7F1D1D",
          padding: "10px 16px", textTransform: "uppercase",
        }}
        maxLength={13}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    APPROVED: { bg: "#DCFCE7", color: "#166534", label: "🟢 Pre-approved" },
    INSIDE: { bg: "#DBEAFE", color: "#1E40AF", label: "🔵 Inside" },
    LEFT:   { bg: "#F1F5F9", color: "#475569", label: "⚫ Left" },
    DENIED: { bg: "#FEE2E2", color: "#991B1B", label: "🔴 Denied" },
  };
  const s = cfg[status] ?? cfg.INSIDE;
  return (
    <span style={{
      background: s.bg, color: s.color, fontWeight: 700, fontSize: "13px",
      padding: "4px 12px", borderRadius: "20px", whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function VisitorPass({ visitor, onClose }: { visitor: any; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "420px",
        width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center",
      }}>
        <div style={{
          width: "72px", height: "72px", background: "#D1FAE5", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "36px", margin: "0 auto 16px",
        }}>✅</div>
        <div style={{
          background: "#059669", color: "white", fontWeight: 900,
          fontSize: "22px", borderRadius: "10px", padding: "8px 24px",
          marginBottom: "20px", letterSpacing: "2px",
        }}>ENTRY ALLOWED</div>

        <div style={{
          background: "#F8FAFC", borderRadius: "12px", padding: "20px", textAlign: "left",
          border: "1px solid #E2E8F0", marginBottom: "20px",
        }}>
          {[
            ["Visitor", visitor.name],
            ["Phone", visitor.phone || "—"],
            ["Flat No", visitor.flatNumber],
            ["Purpose", visitor.purpose],
            ["Vehicle", visitor.vehiclePlate || "—"],
            ["Entry Time", new Date(visitor.entryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "#64748B", fontSize: "14px" }}>{k}</span>
              <span style={{ fontWeight: 700, fontSize: "14px", color: "#0F172A" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => window.print()}
            style={{
              flex: 1, padding: "14px", background: "#1E293B", color: "white",
              border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "16px", cursor: "pointer",
            }}
          >🖨️ Print</button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "14px", background: "#2563EB", color: "white",
              border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "16px", cursor: "pointer",
            }}
          >✓ Done</button>
        </div>
      </div>
    </div>
  );
}

export default function GatePage() {
  const [societyId, setSocietyId] = useState("");
  const [societies, setSocieties] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "", phone: "", vehiclePlate: "", purpose: PURPOSES[0], flatNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [todayVisitors, setTodayVisitors] = useState<any[]>([]);
  const [preApprovedVisitors, setPreApprovedVisitors] = useState<any[]>([]);
  const [passVisitor, setPassVisitor] = useState<any>(null);
  const [exitLoading, setExitLoading] = useState<string | null>(null);
  const [arriveLoading, setArriveLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load societies for selector
  useEffect(() => {
    fetch("/api/societies/list")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setSocieties(d.societies ?? []))
      .catch(() => {});
  }, []);

  const loadToday = (sid: string) => {
    if (!sid) return;
    fetch(`/api/visitors?societyId=${sid}&today=true`)
      .then(r => r.json())
      .then(d => setTodayVisitors(d.visitors ?? []))
      .catch(() => {});
      
    fetch(`/api/visitors/expected?societyId=${sid}&today=true`)
      .then(r => r.json())
      .then(d => setPreApprovedVisitors(d.expected ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    if (societyId) loadToday(societyId);
  }, [societyId]);

  const handleEntry = async (status: "INSIDE" | "DENIED") => {
    if (!form.name || !form.phone || !form.flatNumber || !societyId) {
      alert("Please fill Visitor Name, Phone and Flat Number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, societyId, status }),
      });
      if (!res.ok) throw new Error("Failed");
      const { visitor } = await res.json();
      setTodayVisitors(prev => [visitor, ...prev]);
      if (status === "INSIDE") setPassVisitor(visitor);
      setForm({ name: "", phone: "", vehiclePlate: "", purpose: PURPOSES[0], flatNumber: "" });
    } catch {
      alert("Error logging visitor");
    } finally {
      setLoading(false);
    }
  };

  const markExit = async (id: string) => {
    setExitLoading(id);
    try {
      const res = await fetch(`/api/visitors/${id}/exit`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const { visitor } = await res.json();
      setTodayVisitors(prev => prev.map(v => v.id === id ? visitor : v));
    } catch {
      alert("Error marking exit");
    } finally {
      setExitLoading(null);
    }
  };

  const markArrived = async (id: string) => {
    setArriveLoading(id);
    try {
      const res = await fetch(`/api/visitors/${id}/arrive`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const { visitor } = await res.json();
      setTodayVisitors(prev => [visitor, ...prev]);
      setPreApprovedVisitors(prev => prev.filter(v => v.id !== id));
      setPassVisitor(visitor);
    } catch {
      alert("Error marking arrival");
    } finally {
      setArriveLoading(null);
    }
  };

  const inp = {
    width: "100%", padding: "16px 18px", fontSize: "18px", borderRadius: "12px",
    border: "2px solid #CBD5E1", outline: "none", background: "#fff",
    fontWeight: 500, color: "#0F172A", boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  };
  const lbl = {
    display: "block", fontWeight: 700, fontSize: "16px", color: "#374151", marginBottom: "8px",
  };

  const insideCount = todayVisitors.filter(v => v.status === "INSIDE").length;
  const totalToday = todayVisitors.length;

  const plateRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/;
  const isPlateValid = !form.vehiclePlate || plateRegex.test(form.vehiclePlate);

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
        padding: "20px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "52px", height: "52px", background: "rgba(255,255,255,0.2)",
            borderRadius: "14px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "28px",
          }}>🏢</div>
          <div>
            <div style={{ color: "white", fontWeight: 900, fontSize: "22px" }}>SocietyPro</div>
            <div style={{ color: "#93C5FD", fontSize: "14px", fontWeight: 500 }}>Gate Entry System</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#4ADE80", fontWeight: 900, fontSize: "28px" }}>{insideCount}</div>
            <div style={{ color: "#86EFAC", fontSize: "12px" }}>Inside</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "white", fontWeight: 900, fontSize: "28px" }}>{totalToday}</div>
            <div style={{ color: "#93C5FD", fontSize: "12px" }}>Today</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        {/* Society Selector */}
        {!societyId && (
          <div style={{
            background: "#1E293B", borderRadius: "20px", padding: "32px",
            marginBottom: "24px", border: "1px solid #334155",
          }}>
            <p style={{ color: "#94A3B8", fontSize: "18px", marginBottom: "16px", fontWeight: 600 }}>
              Select Society to Continue
            </p>
            <select
              value={societyId}
              onChange={e => setSocietyId(e.target.value)}
              style={{ ...inp, background: "#0F172A", color: "#F1F5F9", border: "2px solid #334155" }}
            >
              <option value="">— Choose Society —</option>
              {societies.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
            </select>
            {societies.length === 0 && (
              <p style={{ color: "#64748B", marginTop: "12px", fontSize: "14px" }}>
                Could not load societies. Enter society ID manually below.
              </p>
            )}
            {societies.length === 0 && (
              <input
                placeholder="Paste Society ID here…"
                style={{ ...inp, marginTop: "12px", background: "#0F172A", color: "#F1F5F9", border: "2px solid #334155" }}
                onChange={e => setSocietyId(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Pre-approved Visitors Section */}
        {preApprovedVisitors.length > 0 && (
          <div style={{
            background: "#1E293B", borderRadius: "20px", padding: "28px",
            marginBottom: "24px", border: "1px solid #334155",
          }}>
            <h2 style={{ color: "white", fontSize: "22px", fontWeight: 800, marginBottom: "20px" }}>
              📋 Pre-approved Visitors Today
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
              {preApprovedVisitors.map(v => (
                <div key={v.id} style={{
                  background: "#0F172A", padding: "16px", borderRadius: "12px", border: "1px solid #334155",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>{v.name} <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: "14px" }}>({v.purpose})</span></div>
                    <div style={{ color: "#93C5FD", fontSize: "14px", marginTop: "4px", fontWeight: 600 }}>Flat: {v.flatNumber}</div>
                  </div>
                  <button
                    onClick={() => markArrived(v.id)}
                    disabled={arriveLoading === v.id}
                    style={{
                      padding: "10px 20px", background: "#16A34A", color: "white",
                      border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {arriveLoading === v.id ? "…" : "Mark Arrived"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entry Form */}
        <div style={{
          background: "#1E293B", borderRadius: "20px", padding: "28px",
          marginBottom: "24px", border: "1px solid #334155",
        }}>
          <h2 style={{ color: "white", fontSize: "22px", fontWeight: 800, marginBottom: "24px" }}>
            🚗 Log Visitor Entry
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ ...lbl, color: "#CBD5E1" }}>Visitor Name *</label>
              <input
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name" style={inp} onFocus={e => (e.target.style.borderColor = "#2563EB")}
                onBlur={e => (e.target.style.borderColor = "#CBD5E1")}
              />
            </div>

            <div>
              <label style={{ ...lbl, color: "#CBD5E1" }}>Phone Number *</label>
              <input
                type="tel" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="98765 43210" style={inp}
                onFocus={e => (e.target.style.borderColor = "#2563EB")}
                onBlur={e => (e.target.style.borderColor = "#CBD5E1")}
              />
            </div>

            <div>
              <label style={{ ...lbl, color: "#CBD5E1" }}>Visiting Flat No. *</label>
              <input
                value={form.flatNumber}
                onChange={e => setForm({ ...form, flatNumber: e.target.value.toUpperCase() })}
                placeholder="A-101 or 301" style={inp}
                onFocus={e => (e.target.style.borderColor = "#2563EB")}
                onBlur={e => (e.target.style.borderColor = "#CBD5E1")}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ ...lbl, color: "#CBD5E1" }}>Purpose of Visit</label>
              <select
                value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
                style={{ ...inp, appearance: "auto" }}
              >
                {PURPOSES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ ...lbl, color: "#CBD5E1" }}>Vehicle Number (Optional)</label>
              <NumberPlate value={form.vehiclePlate} onChange={v => setForm({ ...form, vehiclePlate: v })} isValid={isPlateValid} />
              {!isPlateValid && <p style={{color: '#EF4444', fontSize: '12px', marginTop: '6px', fontWeight: 600}}>Invalid format. Must be like GJ05AB1234.</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
            <button
              onClick={() => handleEntry("DENIED")}
              disabled={loading || !isPlateValid}
              style={{
                padding: "20px", background: (loading || !isPlateValid) ? "#7F1D1D" : "#DC2626",
                color: "white", border: "none", borderRadius: "14px",
                fontWeight: 900, fontSize: "20px", cursor: (loading || !isPlateValid) ? "not-allowed" : "pointer",
                transition: "all 0.15s", boxShadow: "0 4px 15px rgba(220,38,38,0.4)",
              }}
            >
              🚫 Deny Entry
            </button>
            <button
              onClick={() => handleEntry("INSIDE")}
              disabled={loading || !isPlateValid}
              style={{
                padding: "20px", background: (loading || !isPlateValid) ? "#14532D" : "#16A34A",
                color: "white", border: "none", borderRadius: "14px",
                fontWeight: 900, fontSize: "20px", cursor: (loading || !isPlateValid) ? "not-allowed" : "pointer",
                transition: "all 0.15s", boxShadow: "0 4px 15px rgba(22,163,74,0.4)",
              }}
            >
              ✅ Allow Entry
            </button>
          </div>
        </div>

        {/* Today's Entries Table */}
        <div style={{
          background: "#1E293B", borderRadius: "20px", overflow: "hidden",
          border: "1px solid #334155",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: "20px", margin: 0 }}>
              📋 Today's Entries
              {societyId && (
                <button
                  onClick={() => loadToday(societyId)}
                  style={{
                    marginLeft: "12px", background: "#334155", border: "none",
                    color: "#94A3B8", padding: "4px 12px", borderRadius: "8px",
                    fontSize: "13px", cursor: "pointer",
                  }}
                >↻ Refresh</button>
              )}
            </h2>
            <input 
              placeholder="Search by name or flat..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #334155", background: "#0F172A", color: "white", outline: "none", width: "250px" }}
            />
          </div>

          {(() => {
            const filteredToday = todayVisitors.filter(v => 
              !searchQuery || 
              v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              v.flatNumber.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredToday.length === 0) {
              return (
                <div style={{ padding: "48px", textAlign: "center", color: "#475569" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚪</div>
                  <p style={{ fontSize: "18px" }}>No entries found</p>
                </div>
              );
            }

            return (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
                <thead>
                  <tr style={{ background: "#0F172A" }}>
                    {["Visitor", "Flat No", "Purpose", "Entry", "Exit", "Status", "Action"].map(h => (
                      <th key={h} style={{
                        padding: "12px 16px", textAlign: "left", fontSize: "12px",
                        fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredToday.map(v => (
                    <tr key={v.id} style={{ borderBottom: "1px solid #1E293B" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>{v.name}</div>
                        {v.phone && <div style={{ color: "#64748B", fontSize: "13px" }}>{v.phone}</div>}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#93C5FD", fontWeight: 700 }}>{v.flatNumber}</td>
                      <td style={{ padding: "14px 16px", color: "#CBD5E1", fontSize: "14px" }}>{v.purpose}</td>
                      <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: "13px" }}>
                        {new Date(v.entryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#64748B", fontSize: "13px" }}>
                        {v.exitTime ? new Date(v.exitTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}><StatusBadge status={v.status} /></td>
                      <td style={{ padding: "14px 16px" }}>
                        {v.status === "INSIDE" && (
                          <button
                            onClick={() => markExit(v.id)}
                            disabled={exitLoading === v.id}
                            style={{
                              background: "#334155", color: "#F1F5F9", border: "none",
                              padding: "8px 16px", borderRadius: "8px", fontWeight: 700,
                              fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
                            }}
                          >
                            {exitLoading === v.id ? "…" : "Mark Exit"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          })()}
        </div>
      </div>

      {/* Visitor Pass Modal */}
      {passVisitor && (
        <VisitorPass visitor={passVisitor} onClose={() => setPassVisitor(null)} />
      )}
    </div>
  );
}
