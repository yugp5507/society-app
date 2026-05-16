"use client";

import { useState, useEffect } from "react";
import { 
  IndianRupee, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  CreditCard,
  Calendar,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function ResidentMaintenancePage() {
  const { data: session } = useSession();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadBills = () => {
    setLoading(true);
    fetch("/api/maintenance")
      .then(r => r.json())
      .then(d => setBills(d.maintenance ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadBills, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (maintenanceId: string) => {
    setPaying(maintenanceId);
    
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert('Razorpay failed to load');
      setPaying(null);
      return;
    }

    try {
      // Create order
      const orderRes = await fetch('/api/maintenance/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceId }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok) throw new Error(order.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SocietyPro',
        description: `Maintenance Bill - ${MONTHS[bills.find(b => b.id === maintenanceId).month - 1]} ${bills.find(b => b.id === maintenanceId).year}`,
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch('/api/maintenance/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              maintenanceId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          
          if (verifyRes.ok) {
            setPaymentSuccess(true);
            loadBills();
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => setPaying(null)
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setPaying(null);
    }
  };

  const pendingBills = bills.filter(b => b.status === "PENDING" || b.status === "OVERDUE");
  const paidBills = bills.filter(b => b.status === "PAID");
  
  // Current active bill (most recent pending/overdue)
  const currentBill = pendingBills.length > 0 ? pendingBills[0] : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Maintenance</h1>
          <p className="text-slate-500 font-medium">View and pay your society dues securely</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100">
          <ShieldCheck className="w-4 h-4" /> Secured by Razorpay
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Active Bill Card */}
            {currentBill ? (
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CreditCard className="w-32 h-32 rotate-12" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <Calendar className="w-4 h-4 text-blue-200" />
                         <span className="text-blue-100 text-xs font-bold uppercase tracking-widest">Due for {MONTHS[currentBill.month - 1]} {currentBill.year}</span>
                      </div>
                      <h2 className="text-5xl font-black tracking-tight flex items-baseline">
                        <span className="text-2xl font-bold mr-1 opacity-80">₹</span>
                        {(currentBill.amount + (currentBill.penaltyAmount || 0)).toLocaleString('en-IN')}
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-wider">
                          Due: {format(new Date(currentBill.dueDate), "dd MMM yyyy")}
                        </span>
                        {currentBill.status === 'OVERDUE' && (
                          <span className="px-3 py-1 bg-red-500 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handlePayment(currentBill.id)}
                      disabled={paying === currentBill.id}
                      className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-70 flex items-center justify-center gap-2 group-hover:scale-105"
                    >
                      {paying === currentBill.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      ) : (
                        <>Pay Now <ChevronRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50/50">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base Amount</p>
                    <p className="text-lg font-black text-slate-900">₹{currentBill.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Late Penalty</p>
                    <p className={`text-lg font-black ${currentBill.penaltyAmount > 0 ? 'text-red-500' : 'text-slate-900'}`}>₹{currentBill.penaltyAmount?.toLocaleString('en-IN') || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Flat Number</p>
                    <p className="text-lg font-black text-slate-900">{currentBill.apartment?.number}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center">
                 <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900">You're All Caught Up!</h2>
                 <p className="text-slate-500 font-medium mt-2">No pending maintenance bills found for your account.</p>
              </div>
            )}

            {/* Other Pending Bills */}
            {pendingBills.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Other Pending Dues</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pendingBills.slice(1).map(b => (
                    <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-300 transition-all">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{MONTHS[b.month - 1]} {b.year}</div>
                        <div className="text-lg font-black text-slate-900">₹{(b.amount + (b.penaltyAmount || 0)).toLocaleString('en-IN')}</div>
                      </div>
                      <button 
                        onClick={() => handlePayment(b.id)}
                        disabled={paying === b.id}
                        className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"
                      >
                         <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - History */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
              Recent History
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{paidBills.length} Paid</span>
            </h3>
            
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              {paidBills.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                   <FileText className="w-10 h-10 mx-auto mb-4 opacity-20" />
                   <p className="text-xs font-bold uppercase tracking-widest">No history</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {paidBills.map(b => (
                    <div key={b.id} className="p-5 hover:bg-slate-50 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-black text-slate-900">{MONTHS[b.month - 1]} {b.year}</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <CheckCircle className="w-3 h-3" /> Paid {format(new Date(b.paidAt), "dd MMM")}
                          </p>
                        </div>
                        <p className="text-sm font-black text-slate-900">₹{(b.amount + (b.penaltyAmount || 0)).toLocaleString('en-IN')}</p>
                      </div>
                      <a 
                        href={`/receipt/${b.id}`}
                        target="_blank"
                        className="w-full py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Receipt
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-200">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
               </div>
               <h4 className="font-black text-sm mb-2">Need help?</h4>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">If you find any discrepancy in your bill or have payment issues, please contact the society admin.</p>
               <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1 hover:gap-2 transition-all">
                 Contact Admin <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>

        </div>
      )}

      {/* Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
               <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Successful!</h2>
            <p className="text-slate-500 font-medium mt-3 mb-8">Your maintenance dues have been cleared. A receipt has been generated for your records.</p>
            <button 
              onClick={() => setPaymentSuccess(false)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Great, thank you!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
