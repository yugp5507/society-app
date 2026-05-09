"use client";

import { useState, useEffect } from "react";
import { IndianRupee, CheckCircle, Clock, AlertTriangle, FileText, Download } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function ResidentMaintenancePage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  const loadBills = () => {
    setLoading(true);
    fetch("/api/maintenance")
      .then(r => r.json())
      .then(d => setBills(d.maintenance ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadBills, []);

  const handlePay = async (id: string) => {
    // In a real app, this would open Razorpay/Stripe checkout
    setPaying(id);
    
    // Simulating payment delay
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/maintenance/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PAID" }),
        });
        if (!res.ok) throw new Error();
        
        // Show success and reload
        alert("Payment successful! Receipt generated.");
        loadBills();
      } catch { 
        alert("Error processing payment"); 
      } finally { 
        setPaying(null); 
      }
    }, 1500);
  };

  const pendingBills = bills.filter(b => b.status === "PENDING" || b.status === "OVERDUE");
  const paidBills = bills.filter(b => b.status === "PAID");
  
  const totalDue = pendingBills.reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Maintenance Bills</h1>
        <p className="text-sm text-slate-500 mt-0.5">View and pay your society maintenance dues.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : bills.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-6xl mb-4 text-slate-300">🧾</div>
          <p className="text-slate-600 font-semibold text-lg">No bills found</p>
          <p className="text-slate-400 text-sm mt-1">You don't have any maintenance bills yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main content - Pending Bills */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Total Due Card */}
            {totalDue > 0 && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-blue-100 font-medium mb-1">Total Outstanding Due</p>
                  <h2 className="text-4xl font-black flex items-center tracking-tight">
                    <IndianRupee className="w-8 h-8 opacity-80 mr-1" />
                    {totalDue.toLocaleString('en-IN')}
                  </h2>
                </div>
                {/* Could add a 'Pay All' button here in the future */}
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Pending Dues ({pendingBills.length})
              </h2>
              
              {pendingBills.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center text-emerald-700">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-50" />
                  <p className="font-semibold">All clear!</p>
                  <p className="text-sm">You have no pending maintenance bills.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBills.map(b => (
                    <div key={b.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row gap-4 justify-between ${b.status === 'OVERDUE' ? 'border-red-200' : 'border-slate-200'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${b.status === 'OVERDUE' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                          📅
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 text-lg">{MONTHS[b.month - 1]} {b.year}</h3>
                            {b.status === 'OVERDUE' && (
                              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm flex items-center">
                            Maintenance Bill
                          </p>
                          <div className="mt-2 font-black text-xl text-slate-800 flex items-center">
                            <IndianRupee className="w-5 h-5" /> {Number(b.amount).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center sm:items-end justify-end mt-2 sm:mt-0">
                        <button 
                          onClick={() => handlePay(b.id)} 
                          disabled={paying === b.id}
                          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {paying === b.id ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                          ) : "Pay Now"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Payment History */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" /> Payment History
            </h2>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {paidBills.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No payment history available.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {paidBills.map(b => (
                    <div key={b.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{MONTHS[b.month - 1]} {b.year}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Paid {b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-IN') : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 text-sm">₹{Number(b.amount).toLocaleString('en-IN')}</span>
                        <button className="text-slate-300 hover:text-blue-600 transition-colors p-1" title="Download Receipt">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </>
  );
}
