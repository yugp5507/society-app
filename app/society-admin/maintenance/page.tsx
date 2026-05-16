"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PlusCircle, 
  Search, 
  IndianRupee, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  Bell,
  Settings as SettingsIcon,
  LayoutDashboard,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = [2024, 2025, 2026];

function StatCard({ icon, value, label, sub, color, trend }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-xl`}>{icon}</div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{sub}</div>}
    </div>
  );
}

const STATUS_MAP: Record<string, { cls: string, label: string, icon: any }> = {
  "PAID": { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Paid", icon: CheckCircle },
  "PENDING": { cls: "bg-amber-50 text-amber-700 border-amber-100", label: "Pending", icon: Clock },
  "OVERDUE": { cls: "bg-red-50 text-red-700 border-red-100", label: "Overdue", icon: AlertTriangle },
  "PARTIAL": { cls: "bg-blue-50 text-blue-700 border-blue-100", label: "Partial", icon: Clock },
};

export default function SocietyAdminMaintenancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [bills, setBills] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: "2500",
    dueDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 15), "yyyy-MM-dd"),
    penaltyAmount: "100",
    notes: "Monthly Maintenance Bill"
  });
  
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load buildings for filter
      const bRes = await fetch("/api/buildings");
      const bData = await bRes.json();
      setBuildings(bData.buildings || []);

      const params = new URLSearchParams();
      if (filterMonth) params.set("month", filterMonth);
      if (filterYear) params.set("year", filterYear);
      if (filterStatus) params.set("status", filterStatus);
      if (filterBuilding) params.set("buildingId", filterBuilding);
      
      const res = await fetch(`/api/maintenance/all?${params.toString()}`);
      const data = await res.json();
      setBills(data.maintenance ?? []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterStatus, filterBuilding]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/maintenance/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      loadData();
      setShowGenModal(false);
    } catch (err: any) {
      alert(err.message || "Error generating bills");
    } finally {
      setGenerating(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Resident", "Flat", "Period", "Amount", "Status", "Paid Date"];
    const rows = bills.map(b => [
      b.user?.name,
      `${b.apartment?.building?.name}-${b.apartment?.number}`,
      `${MONTHS[b.month - 1]} ${b.year}`,
      b.amount + (b.penaltyAmount || 0),
      b.status,
      b.paidAt ? format(new Date(b.paidAt), "dd MMM yyyy") : "N/A"
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `maintenance_${filterMonth}_${filterYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = bills.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(q) ||
      b.apartment?.number?.toLowerCase().includes(q)
    );
  });

  // Overview Stats
  const totalCollected = bills.filter(b => b.status === "PAID").reduce((sum, b) => sum + b.amount + (b.penaltyAmount || 0), 0);
  const pendingCount = bills.filter(b => b.status === "PENDING").length;
  const overdueCount = bills.filter(b => b.status === "OVERDUE").length;
  const totalOutstanding = bills.filter(b => b.status !== "PAID").reduce((sum, b) => sum + b.amount + (b.penaltyAmount || 0), 0);
  const collectionRate = bills.length > 0 ? Math.round((bills.filter(b => b.status === "PAID").length / bills.length) * 100) : 0;

  const inp = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 text-sm";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Maintenance</h1>
          <p className="text-slate-500 font-medium">Manage society collections and resident payments</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <PlusCircle className="w-5 h-5" /> Generate Bills
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit border border-slate-200">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "payments", label: "All Payments", icon: CreditCard },
          { id: "settings", label: "Settings", icon: SettingsIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-4 mb-4">
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={`${inp} w-40 font-bold border-2 border-slate-200 rounded-xl`}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={`${inp} w-32 font-bold border-2 border-slate-200 rounded-xl`}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={<IndianRupee className="w-6 h-6 text-emerald-600" />} 
              value={`₹${totalCollected.toLocaleString('en-IN')}`} 
              label="Collected this month" 
              color="bg-emerald-100" 
              trend={12}
            />
            <StatCard 
              icon={<Clock className="w-6 h-6 text-amber-600" />} 
              value={pendingCount} 
              label="Pending Payments" 
              color="bg-amber-100" 
            />
            <StatCard 
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />} 
              value={overdueCount} 
              label="Overdue Payments" 
              color="bg-red-100" 
            />
            <StatCard 
              icon={<CreditCard className="w-6 h-6 text-blue-600" />} 
              value={`₹${totalOutstanding.toLocaleString('en-IN')}`} 
              label="Total Outstanding" 
              color="bg-blue-100" 
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Collection Progress</h3>
                <p className="text-sm text-slate-500 font-medium">Monthly target vs actual collection</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-blue-600">{collectionRate}%</span>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Collected</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-8 border border-slate-100 p-0.5">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-sm shadow-blue-200" 
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Target</div>
                <div className="text-xl font-black text-slate-900">₹{(totalCollected + totalOutstanding).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Actual Paid</div>
                <div className="text-xl font-black text-emerald-600">₹{totalCollected.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pending</div>
                <div className="text-xl font-black text-amber-500">₹{totalOutstanding.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Avg per Flat</div>
                <div className="text-xl font-black text-slate-900">₹{bills.length > 0 ? Math.round((totalCollected + totalOutstanding) / bills.length).toLocaleString('en-IN') : 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    placeholder="Search resident name or flat number..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-all" 
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Building:</span>
                  <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Buildings</option>
                    {buildings.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                   <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterBuilding(""); }} className="text-xs font-bold text-blue-600 hover:text-blue-700">Clear Filters</button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-32 text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="font-bold text-lg text-slate-900">No payment records found</p>
                  <p className="text-sm font-medium mt-1">Try adjusting your filters or search query</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resident</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flat</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Paid Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(b => {
                      const statusInfo = STATUS_MAP[b.status] || STATUS_MAP["PENDING"];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr key={b.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{b.user?.name}</div>
                            <div className="text-slate-400 text-[10px] font-bold mt-0.5">{b.user?.email}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black">
                              {b.apartment?.building?.name}-{b.apartment?.number}
                            </div>
                          </td>
                          <td className="px-6 py-5 font-black text-slate-900">
                            ₹{(b.amount + (b.penaltyAmount || 0)).toLocaleString('en-IN')}
                            {b.penaltyAmount > 0 && <span className="block text-[9px] text-red-500 mt-0.5">+₹{b.penaltyAmount} penalty</span>}
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-xs font-bold text-slate-600">{format(new Date(b.dueDate), "dd MMM yyyy")}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border ${statusInfo.cls} uppercase tracking-wider`}>
                              <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-xs font-bold text-slate-600">
                              {b.paidAt ? format(new Date(b.paidAt), "dd MMM yyyy") : "—"}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(b.status === "PENDING" || b.status === "OVERDUE") && (
                                <button className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all tooltip" title="Send Reminder">
                                  <Bell className="w-4 h-4" />
                                </button>
                              )}
                              {b.status === "PAID" && (
                                <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all" title="View Receipt">
                                  <FileText className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-blue-600" /> Maintenance Configuration
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Default Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" defaultValue="2500" className={`${inp} pl-10 h-12 font-bold border-2 border-slate-100 rounded-2xl`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Default Due Day</label>
                    <select defaultValue="10" className={`${inp} h-12 font-bold border-2 border-slate-100 rounded-2xl px-4`}>
                      {[...Array(28)].map((_, i) => <option key={i+1} value={i+1}>{i+1}th of every month</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Late Penalty Type</label>
                    <select defaultValue="fixed" className={`${inp} h-12 font-bold border-2 border-slate-100 rounded-2xl px-4`}>
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Penalty Value</label>
                    <input type="number" defaultValue="100" className={`${inp} h-12 font-bold border-2 border-slate-100 rounded-2xl px-4`} />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <div>
                      <div className="text-sm font-black text-slate-900">Auto-generate bills</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Generate bills automatically on 1st of every month</div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-blue-600 cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <div>
                      <div className="text-sm font-black text-slate-900">SMS Reminders</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Send SMS alert when bill is generated</div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-slate-300 cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bills Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Generate Bills</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Bulk Creation</p>
              </div>
              <button onClick={() => setShowGenModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all font-bold text-lg">✕</button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-8 space-y-6">
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                  This will generate maintenance records for all occupied apartments in the society for the selected period. Residents will be notified via email/SMS.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Month</label>
                  <select value={genForm.month} onChange={e => setGenForm({ ...genForm, month: parseInt(e.target.value) })} className={`${inp} h-12 font-bold border-2 border-slate-100 rounded-2xl px-4`}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Year</label>
                  <select value={genForm.year} onChange={e => setGenForm({ ...genForm, year: parseInt(e.target.value) })} className={`${inp} h-12 font-bold border-2 border-slate-100 rounded-2xl px-4`}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" required value={genForm.amount} onChange={e => setGenForm({ ...genForm, amount: e.target.value })} className={`${inp} pl-10 h-12 font-bold border-2 border-slate-100 rounded-2xl`} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Due Date</label>
                  <input type="date" required value={genForm.dueDate} onChange={e => setGenForm({ ...genForm, dueDate: e.target.value })} className={`${inp} h-12 font-bold border-2 border-slate-100 rounded-2xl px-4`} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Late Penalty (₹)</label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" value={genForm.penaltyAmount} onChange={e => setGenForm({ ...genForm, penaltyAmount: e.target.value })} className={`${inp} pl-10 h-12 font-bold border-2 border-slate-100 rounded-2xl`} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowGenModal(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button 
                  type="submit" 
                  disabled={generating} 
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <ChevronRight className="w-5 h-5" />}
                  {generating ? "Generating..." : "Generate Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
