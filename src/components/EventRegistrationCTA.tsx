"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createDynamicOrder, verifyDynamicPayment } from "@/app/actions/paymentActions";

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

export default function EventRegistrationCTA({
  itemId, price, label, paidLabel = "✅ Registered — View in Profile", onPaymentSuccess, dark = false
}: EventRegistrationCTAProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        const rights: string[] = snap.data()?.accessRights || [];
        setHasPaid(rights.includes(itemId));
      }
      setLoading(false);
    });
    return () => unsub();
  }, [itemId]);

  const handleSignIn = async () => {
    try {
      setPaying(true);
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) { console.error(e); } finally { setPaying(false); }
  };

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

  const btnBase = "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60";
  const Spinner = () => <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;

  if (loading) return <div className="w-full py-3 rounded-xl bg-slate-800/50 animate-pulse h-11" />;

  if (hasPaid) return (
    <div className="w-full text-center py-3 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
      {paidLabel}
    </div>
  );

  if (!user) return (
    <button onClick={handleSignIn} disabled={paying}
      className={`${btnBase} ${dark ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-brandBlue text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20"}`}>
      {paying ? <><Spinner /> Signing in…</> : <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Sign in to {label}</>}
    </button>
  );

  return (
    <button onClick={handlePayment} disabled={paying}
      className={`${btnBase} ${dark ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-brandBlue text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20"}`}>
      {paying ? <><Spinner /> Processing…</> : <>{label} — {price}</>}
    </button>
  );
}
