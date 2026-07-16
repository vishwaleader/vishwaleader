"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, Printer, Heart, ArrowRight, ArrowLeft, Loader2, FileCheck } from "lucide-react";
import Link from "next/link";

function SuccessClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const donationId = searchParams.get("id") || "";

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!donationId) {
      setErrorMsg("No donation reference found.");
      setLoading(false);
      return;
    }

    const fetchDonation = async () => {
      try {
        const docRef = doc(db, "donations", donationId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setDonation(snap.data());
        } else {
          setErrorMsg("Donation record not found.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to retrieve receipt details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [donationId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 z-50">
        <Loader2 className="size-8 text-brandBlue animate-spin mb-4" />
        <p className="text-slate-600 font-bold text-sm tracking-wide uppercase">Generating Donation Receipt...</p>
      </div>
    );
  }

  if (errorMsg || !donation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Receipt Error</h2>
          <p className="text-slate-550 text-sm font-semibold">{errorMsg || "An error occurred."}</p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/donate"
              className="bg-brandBlue text-white font-bold py-3 rounded-xl text-sm hover:bg-brandBlue/90 transition-colors"
            >
              Back to Donate Page
            </Link>
            <Link
              href="/"
              className="text-slate-600 hover:text-brandBlue font-bold text-xs py-2 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const receiptDate = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 py-12 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center print:bg-white print:py-0">
      
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            background: white;
          }
          header, footer, nav, button, .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Decorative Orbs (No-Print) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brandBlue/10 blur-3xl pointer-events-none no-print" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none no-print" />

      <div className="max-w-2xl w-full relative z-10 flex flex-col gap-6">
        
        {/* Success Header (No-Print) */}
        <div className="text-center space-y-3 no-print">
          <div className="inline-flex items-center justify-center size-16 bg-emerald-100 text-emerald-600 rounded-full shadow-inner animate-bounce">
            <CheckCircle className="size-10 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-black font-display text-slate-900 tracking-tight leading-none uppercase">Donation Complete!</h1>
          <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
            Thank you for your support. A confirmation email and digital receipt has been sent to <span className="text-slate-800 font-bold">{donation.email}</span>.
          </p>
        </div>

        {/* Receipt Container */}
        <div 
          id="printable-receipt"
          className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 relative flex flex-col gap-6 print:border-none print:shadow-none print:p-0"
        >
          {/* Top Decorative Edge */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brandBlue to-emerald-500 print:hidden" />

          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/images/vishwaleader-logo-hd.png" 
                alt="Vishwa Leader" 
                className="h-12 w-auto object-contain" 
              />
              <div className="leading-none">
                <span className="text-lg font-black tracking-tight text-brandBlue font-display block">Vishwa Leader</span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Techmedia Private Limited</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Donation Receipt</h2>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">Receipt No: REC_{donation.paymentId}</p>
            </div>
          </div>

          {/* Donor & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contributor</h3>
              <div>
                <p className="font-bold text-slate-800 text-base">{donation.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{donation.email}</p>
                <p className="text-slate-500 text-xs mt-0.5">{donation.phone}</p>
              </div>
            </div>

            <div className="space-y-3 sm:text-right">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-right">Payment Details</h3>
              <div className="text-slate-500 text-xs space-y-0.5">
                <p>Date: <span className="font-semibold text-slate-800">{receiptDate}</span></p>
                <p>Payment ID: <span className="font-semibold text-slate-800 font-mono text-[11px]">{donation.paymentId}</span></p>
                <p>Order ID: <span className="font-semibold text-slate-800 font-mono text-[11px]">{donation.orderId}</span></p>
                <p>Status: <span className="font-bold text-emerald-500">Completed (Success)</span></p>
              </div>
            </div>
          </div>

          {/* Receipt Table / Breakdown */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden mt-2">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 font-bold text-[10px] text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 font-bold text-[10px] text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-5 py-4 font-semibold">
                    Donation / Contribution
                    <span className="block text-[10px] text-slate-500 mt-1 font-medium">Purpose: {donation.purpose}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-right text-slate-900">₹{donation.amount.toLocaleString("en-IN")}.00</td>
                </tr>
                <tr className="bg-slate-50/50 font-bold text-slate-900 border-t-2 border-slate-100">
                  <td className="px-5 py-4 text-right text-[10px] uppercase text-slate-550 tracking-wider">Total Received</td>
                  <td className="px-5 py-4 text-right text-lg text-brandBlue">₹{donation.amount.toLocaleString("en-IN")}.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Support Notes */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
            <p className="text-xs font-bold text-slate-800">Thank you for your generous contribution!</p>
            <p className="text-[10px] text-slate-500 font-medium">
              Vishwa Leader is registered in India. This contribution supports our scholarly conferences, publications, and awards systems.
            </p>
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-4 border-t border-slate-100 text-[9px] text-slate-400 font-medium space-y-0.5">
            <p>© 2026 Vishwa Leader Techmedia Private Limited. All Rights Reserved.</p>
            <p>For inquiries, please reach out to info@vishwaleader.com.</p>
          </div>

        </div>

        {/* Action Buttons (No-Print) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full no-print">
          <button
            onClick={handlePrint}
            className="flex-1 bg-white text-slate-800 font-bold py-3.5 rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="size-4" /> Print / Save as PDF
          </button>
          
          <button
            onClick={() => router.push("/auth/member?tab=donations")}
            className="flex-1 bg-brandBlue text-white font-bold py-3.5 rounded-xl text-sm hover:bg-brandBlue/90 transition-colors flex items-center justify-center gap-2 shadow-md shadow-brandBlue/10"
          >
            <FileCheck className="size-4" /> View in Dashboard
          </button>
        </div>

        <Link
          href="/"
          className="text-slate-500 hover:text-brandBlue font-bold text-xs text-center pb-8 no-print transition-colors"
        >
          Go to Homepage
        </Link>

      </div>
    </div>
  );
}

export default function SuccessClient() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 z-50">
        <Loader2 className="size-8 text-brandBlue animate-spin mb-4" />
        <p className="text-slate-600 font-bold text-sm tracking-wide uppercase">Loading Page Content...</p>
      </div>
    }>
      <SuccessClientContent />
    </Suspense>
  );
}
