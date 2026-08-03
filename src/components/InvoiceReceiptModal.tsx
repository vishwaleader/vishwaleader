import React from 'react';
import { X, Printer, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberData: any;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  onClose,
  memberData,
}) => {
  if (!isOpen || !memberData) return null;

  const totalAmount = Number(memberData.totalAmount) || 0;
  const amountPaid = Number(memberData.amountPaid) || 0;
  const remainingBalance = memberData.remainingBalance !== undefined 
    ? Number(memberData.remainingBalance) 
    : Math.max(0, totalAmount - amountPaid);
  
  const paymentStatus = memberData.paymentStatus || (remainingBalance <= 0 && amountPaid > 0 ? 'Paid' : amountPaid > 0 ? 'Partially Paid' : 'Unpaid');
  const invoiceNumber = `INV-${(memberData.paymentOrderId || memberData.paymentId || 'VL2026').substring(0, 8).toUpperCase()}`;
  const receiptDate = memberData.paidAt 
    ? new Date(memberData.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden relative print:shadow-none print:border-none print:max-w-full print:rounded-none">
        
        {/* Top Header Controls (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm uppercase tracking-wider">Official Tax Invoice & Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs font-bold gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-400" /> Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 md:p-10 space-y-8 print:p-8" id="printable-invoice">
          
          {/* Corporate Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <img
                src="/assets/images/vishwaleader-logo-hd.png"
                alt="Vishwa Leader"
                className="h-12 w-auto object-contain mb-2"
              />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Vishwa Leader Techmedia Pvt. Ltd.</h2>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed mt-0.5">
                Unit No 1, Malwa Patanwala Comp, LBS Marg, Ghatkopar West, Mumbai 400086, Maharashtra, India<br />
                <strong>CIN:</strong> U74999MH2016PTC273606
              </p>
            </div>
            
            <div className="sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Tax Invoice & Receipt
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 pt-1">Invoice No: {invoiceNumber}</p>
              <p className="text-xs text-slate-500">Date: {receiptDate}</p>
              <p className="text-xs text-slate-500 font-mono">Payment Ref ID: {memberData.paymentId || 'N/A'}</p>
            </div>
          </div>

          {/* Delegate & Billed To Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div>
              <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">Billed To (Delegate Details)</h4>
              <p className="text-base font-bold text-slate-900">{memberData.name || 'Delegate Member'}</p>
              <p className="text-xs text-slate-600 font-medium">{memberData.designation ? `${memberData.designation}, ` : ''}{memberData.organization || ''}</p>
              <p className="text-xs text-slate-500">{memberData.email}</p>
              <p className="text-xs text-slate-500">{memberData.phone || ''} {memberData.country ? `· ${memberData.country}` : ''}</p>
            </div>
            
            <div>
              <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">Registration & Seat Status</h4>
              <p className="text-xs text-slate-700"><strong>Member ID:</strong> <span className="font-mono text-brandBlue font-bold">{memberData.memberId || 'VL-2026-REG'}</span></p>
              <p className="text-xs text-slate-700"><strong>Selected Package:</strong> {memberData.packageTour || 'SOAS London Summit 2026 Delegate'}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Payment Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : paymentStatus === 'Partially Paid'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-3.5 rounded-l-xl">Description / Particulars</th>
                  <th className="p-3.5 text-center">Type</th>
                  <th className="p-3.5 text-right rounded-r-xl">Total Package Fee (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3.5 font-bold text-slate-800">
                    {memberData.packageTour && memberData.packageTour !== 'None' 
                      ? `SOAS London Summit 2026 Registration & Package (${memberData.packageTour})` 
                      : 'SOAS London Summit 2026 Delegate Registration Fee'}
                    {memberData.wizardIntents && memberData.wizardIntents.length > 0 && (
                      <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                        Includes: {memberData.wizardIntents.join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-600 uppercase text-[10px]">
                    {paymentStatus === 'Partially Paid' ? 'Token Deposit & Registration' : 'Full Delegate Registration'}
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-slate-900 text-sm">
                    ₹{totalAmount.toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Calculation Ledger Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch gap-6 pt-2 border-t border-slate-200">
            <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl flex-1 space-y-1">
              <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> Financial Summary & Seat Security
              </h5>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                {paymentStatus === 'Paid'
                  ? 'Your summit registration fee has been paid in full. Your seat and official dossier are fully confirmed.'
                  : paymentStatus === 'Partially Paid'
                  ? `Your seat is secured via your partial token deposit of ₹${amountPaid.toLocaleString('en-IN')}. Please settle the remaining balance of ₹${remainingBalance.toLocaleString('en-IN')} prior to the summit commencement.`
                  : 'Payment is currently pending for this registration.'}
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Package Price:</span>
                <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-200 pt-2">
                <span>Amount Paid So Far:</span>
                <span>₹{amountPaid.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-amber-800 font-extrabold text-sm border-t border-slate-200 pt-2">
                <span>Remaining Balance Due:</span>
                <span>₹{remainingBalance.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
          </div>

          {/* Payment History / Transactions if available */}
          {memberData.paymentHistory && memberData.paymentHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400">Transaction History Log</h5>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px]">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Transaction ID</th>
                      <th className="p-2">Payment Type</th>
                      <th className="p-2 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {memberData.paymentHistory.map((h: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2">{h.paidAt ? new Date(h.paidAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                        <td className="p-2">{h.paymentId || 'N/A'}</td>
                        <td className="p-2 font-sans font-semibold text-slate-800">{h.paymentType || 'Payment'}</td>
                        <td className="p-2 text-right font-extrabold text-emerald-700">₹{(h.amount || 0).toLocaleString('en-IN')}.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Terms & Stamp */}
          <div className="border-t border-slate-200 pt-6 text-[10px] text-slate-400 space-y-1 text-center">
            <p>This is a computer-generated Tax Invoice & Receipt issued by Vishwa Leader Techmedia Pvt. Ltd.</p>
            <p>© {new Date().getFullYear()} Vishwa Leader Techmedia Pvt. Ltd. All rights reserved. For queries, contact info@vishwaleader.com.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
