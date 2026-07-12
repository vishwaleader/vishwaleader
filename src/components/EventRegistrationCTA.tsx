"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createDynamicOrder, verifyDynamicPayment } from "@/app/actions/paymentActions";
import { Check, CheckCircle, ShieldAlert, X } from "lucide-react";

interface EventRegistrationCTAProps {
  itemId: string;
  price: string;
  label: string;
  paidLabel?: string;
  onPaymentSuccess?: () => void;
  dark?: boolean;
}

declare global {
  interface Window { Razorpay: any; }
}

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.querySelector('script[src*="checkout.razorpay"]')) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ── Item label + price map (client-side mirror of server PRICE_DICTIONARY) ──
const ITEM_INFO: Record<string, { label: string; amount: number }> = {
  reg_conference: { label: "International Conference Registration", amount: 5900 },
  reg_business: { label: "International Business Summit Registration", amount: 11800 },
  reg_award: { label: "International Awards Ceremony Registration", amount: 5900 },
  reg_presenter: { label: "Conference Presenter Registration", amount: 5900 },
  reg_souvenir: { label: "Official Souvenir Article Submission", amount: 5900 },
  day_1: { label: "Day 1 — Conference Pass", amount: 5900 },
  day_2: { label: "Day 2 — Business Summit Pass", amount: 11800 },
  day_3: { label: "Day 3 — Awards Ceremony Pass", amount: 5900 },
  ad_front_cover: { label: "Souvenir Ad — Front Cover (Premium)", amount: 500000 },
  ad_back_cover: { label: "Souvenir Ad — Back Cover (Premium)", amount: 200000 },
  ad_inside_cover: { label: "Souvenir Ad — Inside Cover", amount: 150000 },
  ad_double_spread: { label: "Souvenir Ad — Double Spread", amount: 100000 },
  ad_full_page: { label: "Souvenir Ad — Full Page", amount: 50000 },
  ad_half_page: { label: "Souvenir Ad — Half Page", amount: 25000 },
  ad_quarter_page: { label: "Souvenir Ad — Quarter Page", amount: 15000 },
  pkg_1: { label: "London Tour Package (Mumbai–London–Mumbai, 7N/8D)", amount: 310000 },
  pkg_2: { label: "London Tour Package (Mumbai–London–Mumbai, 4N/5D)", amount: 235000 },
  pkg_3: { label: "London Land Package (7N/8D)", amount: 200501 },
  pkg_4: { label: "London Land Package (4N/5D)", amount: 131000 },
  donation_patron: { label: "High-Level Patronage Contribution", amount: 118000 },
};

export default function EventRegistrationCTA({
  itemId, price, label, paidLabel = "✅ Registered — View in Profile", onPaymentSuccess, dark = false
}: EventRegistrationCTAProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);

  // Billing modal state
  const [showBilling, setShowBilling] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Auth + profile check ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.data();
        const rights: string[] = data?.accessRights || [];
        setHasPaid(rights.includes(itemId));
        setProfileComplete(data?.legalConsent === true);
        setMemberData(data || null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [itemId]);

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    try {
      setPaying(true);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const u = result.user;

      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.data();
      const rights: string[] = data?.accessRights || [];

      if (rights.includes(itemId)) {
        setHasPaid(true);
        return;
      }

      if (itemId === "__login_only__") {
        setProfileComplete(data?.legalConsent === true);
        return;
      }

      if (data?.legalConsent === true) {
        setProfileComplete(true);
        setMemberData(data);
        // Show billing modal instead of direct Razorpay
        setShowBilling(true);
      } else {
        router.push("/auth/member");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPaying(false);
    }
  };

  // ── Pay button click ────────────────────────────────────────────────────────
  const handlePayClick = () => {
    if (!user) return;
    if (itemId === "__login_only__") return;

    if (!profileComplete) {
      router.push("/auth/member");
      return;
    }

    // Show billing modal
    setLegalConsent(false);
    setShowBilling(true);
  };

  // ── Confirm & Pay from billing modal ────────────────────────────────────────
  const handleConfirmPay = async () => {
    if (!user || !legalConsent) return;
    setShowBilling(false);
    await handlePayment();
  };

  // ── Razorpay checkout ───────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!user) return;
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert("Could not load payment gateway. Check your connection."); return; }
      const result = await createDynamicOrder([itemId]);
      if (!result.success || !result.order) { alert(result.error || "Could not create order."); return; }
      const { order, totalAmount } = result;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vishwa Leader Techmedia Pvt Ltd",
        description: label,
        order_id: order.id,
        handler: async (response: any) => {
          const verify = await verifyDynamicPayment(
            response.razorpay_payment_id, response.razorpay_order_id,
            response.razorpay_signature, user.uid, [itemId], totalAmount!
          );
          if (verify.success) { setHasPaid(true); onPaymentSuccess?.(); }
          else alert("Payment verification failed. Contact support.");
        },
        prefill: { name: user.displayName || "", email: user.email || "" },
        theme: { color: "#1d4ed8" },
      };
      new window.Razorpay(options).open();
    } finally { setPaying(false); }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const itemInfo = ITEM_INFO[itemId];
  const displayAmount = itemInfo ? `₹${itemInfo.amount.toLocaleString('en-IN')}` : price;
  const displayLabel = itemInfo?.label || label;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setShowBilling(false);
  };

  // ── Shared styles ───────────────────────────────────────────────────────────
  const btnBase = "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60";
  const btnStyle = dark
    ? "bg-white text-slate-900 hover:bg-slate-100"
    : "bg-brandBlue text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20";

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );

  const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  // ── Render states ───────────────────────────────────────────────────────────

  if (loading) return <div className="w-full py-3 rounded-xl bg-slate-800/50 animate-pulse h-11" />;

  if (hasPaid) return (
    <div className="w-full text-center py-3 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
      {paidLabel}
    </div>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* CTA Button */}
      {!user ? (
        <button onClick={handleSignIn} disabled={paying} className={`${btnBase} ${btnStyle}`}>
          {paying ? <><Spinner /> Signing in…</> : <><GoogleIcon /> Sign in to {label}</>}
        </button>
      ) : !profileComplete && itemId !== "__login_only__" ? (
        <button onClick={handlePayClick} disabled={paying} className={`${btnBase} ${btnStyle}`}>
          {paying ? <><Spinner /> Redirecting…</> : <>Complete Registration to {label}</>}
        </button>
      ) : (
        <button
          onClick={handlePayClick}
          disabled={paying || itemId === "__login_only__"}
          className={`${btnBase} ${btnStyle} ${itemId === "__login_only__" ? "cursor-default" : ""}`}
        >
          {paying ? <><Spinner /> Processing…</> : itemId === "__login_only__" ? <>{paidLabel}</> : <>{label} — {price}</>}
        </button>
      )}

      {/* ── Billing / Receipt Modal ── */}
      {showBilling && (
        <div
          ref={overlayRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-brandBlue" />

            {/* Header */}
            <div className="bg-[#0a0a0a] px-8 pt-8 pb-7 relative">
              <button
                onClick={() => setShowBilling(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <ShieldAlert className="w-10 h-10 text-brandBlue shrink-0 drop-shadow-md" />
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Secure Checkout</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Review your order before payment</p>
                </div>
              </div>

              <div className="flex items-center gap-5 text-xs font-medium text-slate-500 mt-4">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> SSL Secured</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Authorized Gateway</span>
                <div className="ml-auto opacity-80 grayscale invert brightness-200 mix-blend-screen">
                  <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain" />
                </div>
              </div>
            </div>

            {/* Body — Receipt */}
            <div className="px-8 py-7 space-y-5">

              {/* Delegate info */}
              {memberData && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <img
                    src={memberData?.headshotUrl || user?.photoURL || "https://placehold.co/100x100"}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover shrink-0"
                    alt="Profile"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{memberData?.name || user?.displayName || "Delegate"}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    {memberData?.designation && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{memberData.designation}{memberData.organization ? ` • ${memberData.organization}` : ""}</p>
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded shrink-0">
                    VL-2026-{(user?.uid?.substring(0, 4) || "XXXX").toUpperCase()}
                  </span>
                </div>
              )}

              {/* Line items */}
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Registration Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2">
                      <Check className="w-4 h-4 shrink-0 text-slate-900 mt-0.5" />
                      <span>{displayLabel}</span>
                    </span>
                    <span className="font-semibold text-slate-900 shrink-0">{displayAmount}</span>
                  </div>
                </div>
              </div>

              {/* Tax note */}
              <div className="pt-3 pb-3 border-t border-b border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">All Taxes</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  INCLUDED IN PRICE
                </span>
              </div>

              {/* Total */}
              <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-between shadow-md">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Due Today</span>
                <span className="text-2xl font-semibold text-white">{displayAmount}</span>
              </div>

              {/* Legal consent */}
              <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={legalConsent}
                  onChange={(e) => setLegalConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-slate-900 focus:ring-slate-900 shrink-0"
                />
                <span className="text-sm text-slate-600 leading-tight">
                  I confirm that all information provided is accurate and I agree to the{" "}
                  <a href="/terms" target="_blank" className="font-semibold text-slate-900 hover:underline">
                    Terms and Conditions
                  </a>{" "}
                  to finalize this transaction.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBilling(false)}
                className="rounded-xl font-semibold h-12 px-6 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm bg-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                disabled={paying || !legalConsent}
                className="bg-slate-900 text-white hover:bg-slate-800 font-semibold h-12 px-8 rounded-xl shadow-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {paying ? <><Spinner /> Processing…</> : <>Pay & Finalize</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
