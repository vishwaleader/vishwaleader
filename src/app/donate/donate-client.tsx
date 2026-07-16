"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createDonationOrder, verifyDonationPayment } from "@/app/actions/donationActions";
import { Heart, ShieldCheck, Sparkles, Check, CreditCard, HelpCircle, ArrowLeft, Loader2, Sparkle } from "lucide-react";
import Link from "next/link";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.querySelector('script[src*="checkout.razorpay"]')) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function DonateClient() {
  const router = useRouter();
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [purpose, setPurpose] = useState("General Support");
  const [consent, setConsent] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        setName(user.displayName || "");
        setEmail(user.email || "");
        
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            if (data.name) setName(data.name);
            if (data.phone) setPhone(data.phone);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
        setPrefilled(true);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const getFinalAmount = (): number => {
    if (selectedAmount === "custom") {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount;
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const amount = getFinalAmount();
    if (amount < 1) {
      setErrorMsg("Donation amount must be at least ₹1.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please enter your phone number.");
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setErrorMsg("Could not load payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const res = await createDonationOrder(amount);
      if (!res.success || !res.order) {
        setErrorMsg(res.error || "Failed to initiate payment. Please try again.");
        setLoading(false);
        return;
      }

      const order = res.order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vishwa Leader Techmedia Pvt Ltd",
        description: `Donation: ${purpose}`,
        order_id: order.id,
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#1d4ed8",
        },
        handler: async (response: any) => {
          setLoading(true);
          try {
            const verifyRes = await verifyDonationPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              userId: currentUser ? currentUser.uid : null,
              name: name,
              email: email,
              phone: phone,
              amount: amount,
              purpose: purpose,
              consent: consent,
            });

            if (verifyRes.success && verifyRes.donationId) {
              router.push(`/donate/success?id=${verifyRes.donationId}`);
            } else {
              setErrorMsg(verifyRes.error || "Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (err: any) {
            console.error(err);
            setErrorMsg("Payment verification failed. Please check your connection or contact support.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-center">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brandBlue/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brandBlue mb-8 transition-colors">
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
          
          {/* Left Column: Form */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brandBlue/10 text-brandBlue rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Heart className="size-3.5 fill-current" /> Support Us
              </div>
              <h1 className="text-3xl font-black font-display text-slate-900 tracking-tight leading-none uppercase">Become a Patron</h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">Empower academic excellence and global leadership recognition.</p>
            </div>

            <form onSubmit={handleDonate} className="space-y-5">
              
              {/* Amount Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Donation Amount</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                        selectedAmount === amt
                          ? "bg-brandBlue text-white border-brandBlue shadow-md shadow-brandBlue/20 scale-[1.02]"
                          : "bg-white text-slate-700 border-slate-200 hover:border-brandBlue hover:text-brandBlue"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => setSelectedAmount("custom")}
                  className={`w-full py-3 rounded-xl border text-sm font-bold transition-all mb-3 ${
                    selectedAmount === "custom"
                      ? "bg-brandBlue text-white border-brandBlue shadow-md shadow-brandBlue/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-brandBlue hover:text-brandBlue"
                  }`}
                >
                  Custom Amount
                </button>

                {selectedAmount === "custom" && (
                  <div className="relative animate-in slide-in-from-top-2 duration-200">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 text-slate-900 font-bold text-sm rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Purpose Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose of Donation</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none font-semibold"
                >
                  <option value="General Support">General Support</option>
                  <option value="Event Sponsorship">Event Sponsorship</option>
                  <option value="Patron Membership">Patron Membership</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Your Details</label>
                
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none font-medium"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number (e.g. +91 9999999999)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none font-medium"
                  />
                </div>
              </div>

              {/* Consent Toggle */}
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 size-4 text-brandBlue focus:ring-brandBlue border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-slate-600 font-semibold cursor-pointer leading-tight">
                  Display my name on the homepage Patron Recognition Wall as a recent supporter.
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brandBlue text-white font-bold py-3.5 rounded-xl text-sm hover:bg-brandBlue/90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brandBlue/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Verifying Transaction...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" /> Become a Patron Now
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Column: Information Panel */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Background highlights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brandBlue/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-lg font-black font-display uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="size-5 text-amber-400 fill-current" /> Why Support Us?
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                  Vishwa Leader is dedicated to fostering research, recognizing international excellence, and creating global leadership networks. Your patronage fuels:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="size-6 bg-brandBlue/20 text-brandBlue flex items-center justify-center rounded-lg text-xs font-bold shrink-0 mt-0.5">
                    <Check className="size-3.5 text-brandBlue" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Global Academic Research</h4>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      Funding research publications, souvenir journals, and scholarships for outstanding contributors.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="size-6 bg-brandBlue/20 text-brandBlue flex items-center justify-center rounded-lg text-xs font-bold shrink-0 mt-0.5">
                    <Check className="size-3.5 text-brandBlue" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Leadership Summits & Awards</h4>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      Organizing world-class awards ceremonies honoring Dr. B. R. Ambedkar's international legacy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="size-6 bg-brandBlue/20 text-brandBlue flex items-center justify-center rounded-lg text-xs font-bold shrink-0 mt-0.5">
                    <Check className="size-3.5 text-brandBlue" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">UPI, Cards & Net Banking</h4>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      Secure processing for all Indian and international credit/debit cards, wallets, and UPI payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 mt-6 sm:mt-0 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="size-4.5 text-emerald-400" />
                Secure 256-bit Payment
              </div>
              <p className="text-[9px] text-slate-400 leading-normal">
                Vishwa Leader is seamlessly connected to all major banks via Razorpay's bank-grade secure gateway.
              </p>
              <div className="opacity-60 invert brightness-200 grayscale mix-blend-screen self-start mt-2">
                <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
