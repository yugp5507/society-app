"use client";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const AMENITY_ICONS: Record<string, string> = {
  "Clubhouse":"🏛️","Swimming Pool":"🏊","Gym":"💪","Badminton Court":"🏸",
  "Community Hall":"🏛️","Terrace Garden":"🌿","Party Lawn":"🎉","Cricket Ground":"🏏",
  "Tennis Court":"🎾","Yoga Room":"🧘","Library":"📚",
};

const STATUS_CFG: Record<string,{cls:string;label:string}> = {
  PENDING:  {cls:"bg-amber-100 text-amber-700 border-amber-200",  label:"⏳ Pending"},
  APPROVED: {cls:"bg-emerald-100 text-emerald-700 border-emerald-200",label:"✓ Approved"},
  REJECTED: {cls:"bg-red-100 text-red-700 border-red-200",        label:"✗ Rejected"},
  CANCELLED:{cls:"bg-slate-100 text-slate-500 border-slate-200",  label:"○ Cancelled"},
  COMPLETED:{cls:"bg-blue-100 text-blue-700 border-blue-200",     label:"★ Completed"},
};

// Mini calendar component
function MiniCalendar({ selectedDate, onSelect, advanceDays }: { selectedDate:string; onSelect:(d:string)=>void; advanceDays:number }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [month, setMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + advanceDays);

  const firstDay = new Date(month.y, month.m, 1).getDay();
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (number|null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonth(p => p.m === 0 ? {y:p.y-1,m:11} : {y:p.y,m:p.m-1})}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600">‹</button>
        <span className="font-bold text-slate-900 text-sm">{MONTHS[month.m]} {month.y}</span>
        <button onClick={() => setMonth(p => p.m === 11 ? {y:p.y+1,m:0} : {y:p.y,m:p.m+1})}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["S","M","T","W","T","F","S"].map((d,i) => (
          <div key={i} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const d = new Date(month.y, month.m, day);
          const iso = `${month.y}-${String(month.m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isPast = d < today;
          const isFuture = d > maxDate;
          const isToday = d.getTime() === today.getTime();
          const isSel = iso === selectedDate;
          const disabled = isPast || isFuture;
          return (
            <button key={i} disabled={disabled} onClick={() => onSelect(iso)}
              className={`h-9 w-full rounded-lg text-sm font-medium transition-colors
                ${isSel ? "bg-blue-600 text-white shadow-sm" :
                  isToday ? "border-2 border-blue-600 text-blue-600 font-bold" :
                  disabled ? "text-slate-300 cursor-not-allowed" :
                  "hover:bg-blue-50 text-slate-700"}`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step indicator
function StepBar({ step }: { step: number }) {
  const steps = ["Select Date","Choose Slot","Confirm","Done"];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-100 text-slate-400"}`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? "text-blue-600" : "text-slate-400"}`}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-blue-600" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

// Booking flow modal
function BookingModal({ amenity, onClose, onSuccess }: { amenity: any; onClose: ()=>void; onSuccess: ()=>void }) {
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isDayAvail, setIsDayAvail] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [purpose, setPurpose] = useState("");
  const [guests, setGuests] = useState("1");
  const [agreed, setAgreed] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadSlots = async (date: string) => {
    setSlotsLoading(true); setSlots([]); setSelectedSlot(null);
    try {
      const res = await fetch(`/api/bookings/slots?amenityId=${amenity.id}&date=${date}`);
      const d = await res.json();
      setSlots(d.slots ?? []);
      setIsDayAvail(d.isDayAvailable ?? true);
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  };

  const handleDateNext = () => { if (selectedDate) { loadSlots(selectedDate); setStep(1); } };
  const handleSlotNext = () => { if (selectedSlot) setStep(2); };

  const confirmBooking = async () => {
    if (!agreed) { setError("Please accept the terms."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amenityId: amenity.id, date: selectedDate,
          startTime: selectedSlot.start, endTime: selectedSlot.end,
          purpose, guestCount: parseInt(guests) || 1,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const { booking } = await res.json();
      setBooking(booking); setStep(3);
    } catch (err: any) { setError(err.message || "Booking failed"); }
    finally { setSaving(false); }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}) : "";

  return (
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
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{AMENITY_ICONS[amenity.name] ?? "🏛️"}</span>
            <div>
              <h2 className="font-bold text-slate-900">{amenity.name}</h2>
              <p className="text-xs text-slate-500">{amenity.isPaid ? `₹${Number(amenity.pricePerSlot).toFixed(0)} per slot` : "Free"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        <div className="p-6">
          {step < 3 && <StepBar step={step} />}

          {/* Step 0 – Pick date */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700 text-center">Select a date to book</p>
              <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} advanceDays={amenity.advanceBookDays ?? 7} />
              <button disabled={!selectedDate} onClick={handleDateNext}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                View Available Slots →
              </button>
            </div>
          )}

          {/* Step 1 – Slots */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setStep(0)} className="text-xs text-blue-600 hover:underline">← Back</button>
                <span className="text-sm font-semibold text-slate-700">{fmtDate(selectedDate)}</span>
              </div>
              {!isDayAvail && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">This amenity is closed on {new Date(selectedDate).toLocaleDateString("en-IN",{weekday:"long"})}s.</div>
              )}
              {slotsLoading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
              ) : (
                <>
                  <div className="flex gap-3 text-xs font-medium justify-center flex-wrap">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Available</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Booked</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block" /> Past/Closed</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, i) => (
                      <button key={i} disabled={!slot.available} onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition-all border
                          ${slot.status === "available" && selectedSlot?.start === slot.start ? "bg-blue-600 text-white border-blue-600 shadow-md" :
                            slot.status === "available" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                            slot.status === "booked" ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed" :
                            "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"}`}>
                        {slot.start}<br /><span className="opacity-70">→ {slot.end}</span>
                      </button>
                    ))}
                    {slots.length === 0 && isDayAvail && (
                      <div className="col-span-3 text-center py-8 text-slate-400 text-sm">No slots configured for this amenity.</div>
                    )}
                  </div>
                  <button disabled={!selectedSlot} onClick={handleSlotNext}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    Continue →
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 2 – Confirm */}
          {step === 2 && (() => {
            const guestCount = parseInt(guests) || 0;
            const isOverCapacity = guestCount > amenity.capacity;

            return (
              <div className="space-y-4">
                <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">← Back</button>
                {/* Summary card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <h3 className="font-bold text-slate-900">Booking Summary</h3>
                  {[
                    ["Amenity", amenity.name],
                    ["Date", fmtDate(selectedDate)],
                    ["Time", `${selectedSlot?.start} – ${selectedSlot?.end}`],
                    ["Price", amenity.isPaid ? `₹${Number(amenity.pricePerSlot).toFixed(0)}` : "Free"],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-semibold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Purpose of Booking</label>
                  <input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Birthday party, family gathering…"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Number of Guests</label>
                  <input type="number" min="1" max={amenity.capacity} value={guests} onChange={e => setGuests(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${isOverCapacity ? "border-red-500 focus:ring-red-500 bg-red-50 text-red-900" : "border-slate-200 focus:ring-blue-500"}`} />
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-xs text-slate-500 font-medium">Max capacity: {amenity.capacity} people</p>
                    <p className={`text-xs font-bold ${isOverCapacity ? "text-red-600" : "text-emerald-600"}`}>
                      {guestCount}/{amenity.capacity} guests
                    </p>
                  </div>
                  {isOverCapacity && (
                    <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 p-2 rounded-md border border-red-100 flex items-center gap-1.5">
                      ⚠️ Maximum capacity is {amenity.capacity} people. Please reduce guests.
                    </p>
                  )}
                </div>
                <label className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
                  <span className="text-xs text-slate-600">I agree to maintain cleanliness and follow society rules during the booking period.</span>
                </label>
                {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">⚠️ {error}</p>}
                <button onClick={confirmBooking} disabled={saving || !agreed || isOverCapacity}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors text-base">
                  {saving ? "Confirming…" : amenity.isPaid ? `Pay ₹${Number(amenity.pricePerSlot).toFixed(0)} & Confirm` : "Confirm Booking"}
                </button>
              </div>
            );
          })()}

          {/* Step 3 – Success */}
          {step === 3 && (
            <div className="text-center space-y-5 py-2">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center text-4xl mx-auto animate-bounce">✅</div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Booking Confirmed!</h2>
                <p className="text-slate-500 text-sm mt-1">Awaiting admin approval.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Booking ID</span><span className="font-mono text-xs font-bold text-slate-700">{booking?.id?.slice(-8).toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Amenity</span><span className="font-semibold">{booking?.amenity?.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-semibold">{fmtDate(selectedDate)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Slot</span><span className="font-semibold">{selectedSlot?.start} – {selectedSlot?.end}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { onSuccess(); onClose(); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResidentBookingsPage() {
  const [tab, setTab] = useState<"book"|"mybookings">("book");
  const [amenities, setAmenities] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loadingA, setLoadingA] = useState(true);
  const [loadingB, setLoadingB] = useState(true);
  const [activeAmenity, setActiveAmenity] = useState<any>(null);
  const [cancelling, setCancelling] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/amenities?active=true")
      .then(r => r.json()).then(d => setAmenities(d.amenities ?? []))
      .catch(() => {}).finally(() => setLoadingA(false));
  }, []);

  const loadBookings = () => {
    setLoadingB(true);
    fetch("/api/bookings")
      .then(r => r.json()).then(d => setMyBookings(d.bookings ?? []))
      .catch(() => {}).finally(() => setLoadingB(false));
  };
  useEffect(loadBookings, []);

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await fetch(`/api/bookings/${id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: "CANCELLED" }) });
      loadBookings();
    } catch { alert("Error cancelling"); }
    finally { setCancelling(null); }
  };

  const canCancel = (b: any) => {
    if (b.status !== "PENDING" && b.status !== "APPROVED") return false;
    const bookDate = new Date(b.date);
    const diff = bookDate.getTime() - Date.now();
    return diff > 24 * 60 * 60 * 1000;
  };

  const upcoming = myBookings.filter(b => ["PENDING","APPROVED"].includes(b.status));
  const past = myBookings.filter(b => ["COMPLETED","REJECTED"].includes(b.status));
  const cancelled = myBookings.filter(b => b.status === "CANCELLED");

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Amenity Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Book society amenities for personal use.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 max-w-xs">
        {(["book","mybookings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab===t ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "book" ? "🏛️ Book Amenity" : "📋 My Bookings"}
          </button>
        ))}
      </div>

      {tab === "book" && (
        loadingA ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
        ) : amenities.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-3">🏛️</div>
            <p className="font-medium">No amenities available</p>
            <p className="text-sm mt-1">Contact your society admin to add amenities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {amenities.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                {/* Icon banner */}
                <div className="h-24 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-5xl border-b border-slate-100">
                  {AMENITY_ICONS[a.name] ?? "🏛️"}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{a.name}</h3>
                      {a.location && <p className="text-xs text-slate-500 mt-0.5">📍 {a.location}</p>}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.isPaid ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {a.isPaid ? `₹${Number(a.pricePerSlot).toFixed(0)}` : "Free"}
                    </span>
                  </div>
                  {a.description && <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>}
                  <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
                    <span>👥 {a.capacity} people</span>
                    <span>⏰ {a.openTime}–{a.closeTime}</span>
                    <span>🕐 {a.slotDuration >= 60 ? `${a.slotDuration/60}h` : `${a.slotDuration}m`} slot</span>
                  </div>
                  <button onClick={() => setActiveAmenity(a)}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "mybookings" && (
        loadingB ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="space-y-6">
            {[
              { label: "Upcoming", items: upcoming, emptyMsg: "No upcoming bookings" },
              { label: "Past",     items: past,     emptyMsg: "No past bookings" },
              { label: "Cancelled",items: cancelled, emptyMsg: "No cancelled bookings" },
            ].map(({ label, items, emptyMsg }) => (
              <div key={label}>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{label}</h2>
                {items.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-slate-400 text-sm">{emptyMsg}</div>
                ) : (
                  <div className="space-y-3">
                    {items.map(b => {
                      const sc = STATUS_CFG[b.status] ?? STATUS_CFG.PENDING;
                      return (
                        <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                              {AMENITY_ICONS[b.amenity?.name] ?? "🏛️"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{b.amenity?.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{fmtDate(b.date)} · {b.startTime}–{b.endTime}</div>
                              {b.purpose && <div className="text-xs text-slate-400 mt-0.5">{b.purpose}</div>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                            {canCancel(b) && (
                              <button onClick={() => cancelBooking(b.id)} disabled={cancelling === b.id}
                                className="text-xs text-red-500 hover:text-red-700 hover:underline">
                                {cancelling === b.id ? "…" : "Cancel"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {activeAmenity && (
        <BookingModal amenity={activeAmenity} onClose={() => setActiveAmenity(null)} onSuccess={loadBookings} />
      )}
    </>
  );
}
