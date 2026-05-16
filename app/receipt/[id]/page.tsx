import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { CheckCircle, Printer, Download } from "lucide-react";
import { notFound } from "next/navigation";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      society: true,
      apartment: {
        include: {
          building: true
        }
      }
    }
  });

  if (!maintenance || maintenance.status !== "PAID") {
    return notFound();
  }

  const receiptNumber = `RCP-${maintenance.year}-${maintenance.id.slice(-4).toUpperCase()}`;
  const totalAmount = maintenance.amount + (maintenance.penaltyAmount || 0);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none">
        
        {/* Header */}
        <div className="bg-slate-900 p-10 text-white flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">SocietyPro</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Official Payment Receipt</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-black uppercase tracking-widest">
              <CheckCircle className="w-4 h-4" /> Payment Successful
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Issued By</p>
              <div className="space-y-1">
                <p className="font-black text-slate-900">{maintenance.society.name}</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{maintenance.society.address}, {maintenance.society.city}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Issued To</p>
              <div className="space-y-1">
                <p className="font-black text-slate-900">{maintenance.user.name}</p>
                <p className="text-sm text-slate-500 font-medium">{maintenance.apartment.building.name}, Flat {maintenance.apartment.number}</p>
              </div>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="bg-slate-50 rounded-2xl p-6 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt Number</p>
              <p className="text-sm font-black text-slate-900">{receiptNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Date</p>
              <p className="text-sm font-black text-slate-900">{maintenance.paidAt ? format(new Date(maintenance.paidAt), "dd MMM yyyy, hh:mm a") : 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
              <p className="text-sm font-black text-slate-900">Razorpay Online</p>
            </div>
          </div>

          {/* Table */}
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-6">
                    <p className="font-black text-slate-900">Monthly Maintenance</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{format(new Date(maintenance.year, maintenance.month - 1), "MMMM yyyy")}</p>
                  </td>
                  <td className="py-6 text-right font-black text-slate-900">₹{maintenance.amount.toLocaleString('en-IN')}</td>
                </tr>
                {maintenance.penaltyAmount && maintenance.penaltyAmount > 0 ? (
                  <tr>
                    <td className="py-6">
                      <p className="font-black text-slate-900">Late Payment Penalty</p>
                      <p className="text-xs text-slate-500 font-bold mt-1">Applied after {format(new Date(maintenance.dueDate), "dd MMM")}</p>
                    </td>
                    <td className="py-6 text-right font-black text-red-500">₹{maintenance.penaltyAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <td className="py-6 text-xl font-black text-slate-900">Total Amount Paid</td>
                  <td className="py-6 text-right text-2xl font-black text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="pt-10 border-t border-slate-100 text-center">
             <div className="mb-6">
                <p className="text-sm font-black text-slate-900 mb-1">Transaction Details</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order ID: {maintenance.razorpayOrderId} | Payment ID: {maintenance.razorpayPaymentId}</p>
             </div>
             <p className="text-slate-500 font-medium italic">"Thank you for your timely payment. It helps us keep the society running smoothly!"</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 p-6 flex justify-center gap-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
