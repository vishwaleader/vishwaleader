"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createDynamicOrder, verifyDynamicPayment } from "@/app/actions/paymentActions";
import { Check, CheckCircle, ShieldAlert } from "lucide-react";
import Image from "next/image";

declare global {
  interface Window { Razorpay: any; }
}

const ITEM_INFO: Record<string, { label: string; amount: number }> = {
  reg_conference:   { label: "International Conference Registration",       amount: 5900 },
  reg_business:     { label: "International Business Summit Registration",  amount: 11800 },
  reg_award:        { label: "International Awards Ceremony Registration",  amount: 5900 },
  reg_presenter:    { label: "Conference Presenter Registration",           amount: 5900 },
  reg_souvenir:     { label: "Official Souvenir Article Submission",        amount: 5900 },
  ad_front_cover:   { label: "Souvenir Ad — Front Cover (Premium)",        amount: 500000 },
  ad_back_cover:    { label: "Souvenir Ad — Back Cover (Premium)",         amount: 200000 },
  ad_inside_cover:  { label: "Souvenir Ad — Inside Cover",                 amount: 150000 },
  ad_double_spread: { label: "Souvenir Ad — Double Spread",                amount: 100000 },
  ad_full_page:     { label: "Souvenir Ad — Full Page",                    amount: 50000 },
  ad_half_page:     { label: "Souvenir Ad — Half Page",                    amount: 25000 },
  ad_quarter_page:  { label: "Souvenir Ad — Quarter Page",                 amount: 15000 },
  pkg_1:            { label: "London Tour Package (Mumbai–London–Mumbai, 7N/8D)", amount: 310000 },
  pkg_2:            { label: "London Tour Package (Mumbai–London–Mumbai, 4N/5D)", amount: 235000 },
  pkg_3:            { label: "London Land Package (7N/8D)",                amount: 200501 },
  pkg_4:            { label: "London Land Package (4N/5D)",                amount: 131000 },
  donation_patron:  { label: "High-Level Patronage Contribution",          amount: 118000 },
};

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.querySelector('script[src*="checkout.razorpay"]')) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("item") || "";

  const [user, setUser] = useState<User | null>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  const itemInfo = ITEM_INFO[itemId];
  const displayAmount = itemInfo ? `₹${itemInfo.amount.toLocaleString("en-IN")}` : "—";
  const displayLabel  = itemInfo?.label ?? itemId;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/auth/member"); return; }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.data();
      setMemberData(data || null);
      const rights: string[] = data?.accessRights || [];
      if (rights.includes(itemId)) { setAlreadyPaid(true); setLoading(false); return; }
      if (!data?.legalConsent) { router.replace("/auth/member"); return; }
      setLoading(false);
    });
    return () => unsub();
  }, [itemId, router]);

  const handlePay = async () => {
    if (!user || !legalConsent || !itemInfo) return;
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert("Could not load payment gateway. Check your connection."); return; }
      const result = await createDynamicOrder([itemId]);
      if (!result.success || !result.order) { alert(result.error || "Could not create order."); return; }
      const { order, totalAmount } = result;
      new window.Razorpay({
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    order.currency,
        name:        "Vishwa Leader Techmedia Pvt Ltd",
        description: displayLabel,
        order_id:    order.id,
        handler: async (response: any) => {
          const verify = await verifyDynamicPayment(
            response.razorpay_payment_id, response.razorpay_order_id,
            response.razorpay_signature, user.uid, [itemId], totalAmount!
          );
          if (verify.success) router.replace("/auth/member?tab=dashboard");
          else alert("Payment verification failed. Please contact support.");
        },
        prefill: { name: user.displayName || "", email: user.email || "" },
        theme:   { color: "#1d4ed8" },
      }).open();
    } finally { setPaying(false); }
  };

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <svg className="animate-spin w-8 h-8 text-brandBlue" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  if (alreadyPaid) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 gap-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-xl font-bold text-slate-900">Already Registered</h2>
      <p className="text-slate-500 text-sm">You have already completed this registration.</p>
      <button onClick={() => router.replace("/auth/member?tab=dashboard")}
        className="mt-4 bg-slate-900 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-slate-800 transition-colors">
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-0 bg-white overflow-hidden">

      {/* Left: payment-bg.jpg wallpaper */}
      <div className="hidden lg:flex flex-col justify-between p-10 relative text-white">
        <Image
          src="/assets/images/newest-background-for-checkout.jpeg"
          alt="Payment Background"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-6">
            <ShieldAlert className="size-12 text-brandBlue drop-shadow-md shrink-0" />
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm shrink-0 whitespace-nowrap">Secure Checkout</h2>
            <p className="text-slate-200 text-sm opacity-90 leading-snug drop-shadow-sm border-l border-white/20 pl-6 max-w-md">
              Your payment is secured with industry-standard 256-bit encryption.
              Completing your registration guarantees your seat at the Vishwa Leader summit.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-end justify-between w-full mt-auto">
          <div className="flex items-center gap-6 text-sm font-medium opacity-80">
            <span className="flex items-center gap-2"><CheckCircle className="size-5 text-emerald-400" /> SSL Secured</span>
            <span className="flex items-center gap-2"><CheckCircle className="size-5 text-emerald-400" /> Authorized Gateway</span>
          </div>
          <div className="opacity-90 grayscale contrast-200 invert brightness-200 mix-blend-screen pb-1 pr-2">
            <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-6 object-contain" />
          </div>
        </div>
      </div>

      {/* Right: receipt form */}
      <div className="p-8 md:p-12 flex flex-col h-full bg-white relative overflow-y-auto">

        <div className="mb-6 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-900 leading-tight">Registration Summary</h3>
          <p className="text-sm text-slate-500 mt-1">Review your selected package before proceeding to payment.</p>
        </div>

        {memberData && (
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl mb-5">
            <img
              src={memberData?.headshotUrl || user?.photoURL || "https://placehold.co/100x100"}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border border-slate-200 object-cover shrink-0"
              alt="Profile"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{memberData?.name || user?.displayName || "Delegate"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              {memberData?.designation && (
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {memberData.designation}{memberData.organization ? ` • ${memberData.organization}` : ""}
                </p>
              )}
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded shrink-0">
              VL-2026-{(user?.uid?.substring(0, 4) || "XXXX").toUpperCase()}
            </span>
          </div>
        )}

        <div className="space-y-2 flex-grow mb-4">
          <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
            <span className="flex items-start gap-2">
              <Check className="size-4 shrink-0 text-slate-900 mt-0.5" />
              <span>{displayLabel}</span>
            </span>
            <span className="font-semibold text-slate-900 shrink-0">{displayAmount}</span>
          </div>
        </div>

        <div className="pt-3 pb-3 border-t border-b border-slate-100 mb-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-900">All Taxes</span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            INCLUDED IN PRICE
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-between mb-5 shadow-md">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Due Today</span>
          <span className="text-2xl font-semibold text-white">{displayAmount}</span>
        </div>

        <label className="flex items-start space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors mb-6">
          <input type="checkbox" checked={legalConsent} onChange={(e) => setLegalConsent(e.target.checked)}
            className="mt-0.5 size-4 rounded text-slate-900 focus:ring-slate-900 shrink-0" />
          <span className="text-sm text-slate-600 leading-tight">
            I confirm that all information provided is accurate and I agree to the{" "}
            <a href="/terms" target="_blank" className="font-semibold text-slate-900 hover:underline">Terms and Conditions</a>
            {" "}to finalize this transaction.
          </span>
        </label>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={() => router.back()}
            className="rounded-xl font-semibold h-12 px-6 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm bg-white text-sm">
            Back
          </button>
          <button onClick={handlePay} disabled={paying || !legalConsent}
            className="bg-slate-900 text-white hover:bg-slate-800 font-semibold h-12 px-8 rounded-xl shadow-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
            {paying ? <><Spinner /> Processing…</> : "Pay & Finalize"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <svg className="animate-spin w-8 h-8 text-brandBlue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
