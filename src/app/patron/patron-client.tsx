"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createDonationOrder, verifyDonationPayment } from "@/app/actions/donationActions";
import {
  Heart, ShieldCheck, Check, CreditCard, Loader2, ChevronRight, ChevronLeft,
  User as UserIcon, Sparkles, Crown, Medal, Trophy, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

declare global {
  interface Window { Razorpay: any; }
}

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];
const PURPOSES = ["General Support", "Event Sponsorship", "Patron Membership", "Other"];

const PATRON_TIERS = [
  { min: 1000, label: "Supporter", icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/30", desc: "Friend of Vishwa Leader" },
  { min: 2500, label: "Contributor", icon: Medal, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30", desc: "Academic Contributor" },
  { min: 5000, label: "Patron", icon: Crown, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30", desc: "Named Patron" },
  { min: 10000, label: "Grand Patron", icon: Trophy, color: "text-yellow-300", bg: "bg-yellow-300/10 border-yellow-300/30", desc: "Grand Patron of Vishwa Leader" },
];

function getTier(amount: number) {
  let tier = PATRON_TIERS[0];
  for (const t of PATRON_TIERS) {
    if (amount >= t.min) tier = t;
  }
  return tier;
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

export default function PatronClient() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Wizard step: 0 = Choose Amount, 1 = Personal Details, 2 = Review & Pay
  const [step, setStep] = useState(0);

  // Form fields
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [purpose, setPurpose] = useState("General Support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);

  // UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
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
        } catch (e) { /* silent */ }
      }
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

  const currentTier = getTier(getFinalAmount());
  const TierIcon = currentTier.icon;

  const validateStep = (): boolean => {
    setErrorMsg("");
    if (step === 0) {
      if (getFinalAmount() < 1) { setErrorMsg("Please enter a valid donation amount."); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 1));
  };

  const prevStep = () => {
    setErrorMsg("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handlePay = async () => {
    if (!validateStep()) return;
    setErrorMsg("");
    setLoading(true);
    const amount = getFinalAmount();
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setErrorMsg("Could not load payment gateway. Please check your connection."); setLoading(false); return; }

      const res = await createDonationOrder(amount);
      if (!res.success || !res.order) { setErrorMsg(res.error || "Failed to initiate payment."); setLoading(false); return; }

      const order = res.order;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vishwa Leader Techmedia Pvt Ltd",
        description: `Patron Contribution: ${purpose}`,
        order_id: order.id,
        prefill: { name, email, contact: phone },
        theme: { color: "#1d4ed8" },
        handler: async (response: any) => {
          setLoading(true);
          const verifyRes = await verifyDonationPayment({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            userId: currentUser ? currentUser.uid : null,
            name, email, phone, amount, purpose, consent,
          });
          if (verifyRes.success && verifyRes.donationId) {
            router.push(`/patron/success?id=${verifyRes.donationId}`);
          } else {
            setErrorMsg(verifyRes.error || "Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      new window.Razorpay(options).open();
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const STEPS = ["Choose Amount", "Review & Pay"];

  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      <main className="pb-16 md:pb-20">

        {/* ── Hero Section (matching event pages) ── */}
        <div className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          {/* Background image */}
          <Image
            src="/assets/images/patron-hero.avif"
            alt="Become a Patron"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/80" />
          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 hidden">
          </div>
        </div>

        {/* ── Main Content Grid (matching event pages) ── */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">

          {/* Left: Info content */}
          <div className="md:col-span-2 space-y-8">

            {/* About Patron Programme */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Why Become a Patron?
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                The Vishwa Leader Patron Programme invites individuals and organizations worldwide to support our mission of celebrating academic excellence and social justice leadership. Inspired by the life and philosophy of Dr. B. R. Ambedkar, our work brings together scholars, activists, and leaders from across the globe.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your generous contribution directly funds scholarships, research grants, award ceremonies, and community outreach programmes that create lasting change. As a named patron, you become an integral part of our global network and legacy.
              </p>
            </div>

            {/* Patron Benefits */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-slate-400" /> Patron Benefits
              </h2>
              <div className="space-y-4">
                {[
                  { tier: "Supporter (₹1,000+)", perks: ["Named acknowledgement in the conference programme", "Certificate of appreciation", "Listed on vishwaleader.com Patron Wall"] },
                  { tier: "Contributor (₹2,500+)", perks: ["All Supporter benefits", "Souvenir journal mention", "Access to post-event research compilation"] },
                  { tier: "Patron (₹5,000+)", perks: ["All Contributor benefits", "Priority access to future events", "Name on backdrop at the awards ceremony"] },
                  { tier: "Grand Patron (₹10,000+)", perks: ["All Patron benefits", "VIP lounge access (London)", "Featured profile in Vishwa Leader Souvenir Magazine", "Special recognition award plaque"] },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm mb-2">{item.tier}</h3>
                    <ul className="space-y-1">
                      {item.perks.map((perk, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-brandBlue mt-0.5 shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* What your contribution funds */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-slate-400" /> What Your Contribution Funds
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Academic research scholarships for deserving scholars",
                  "International Awards Ceremony at King's College London",
                  "Publication of the official Vishwa Leader Souvenir Journal",
                  "Translation & accessibility services for global participation",
                  "Community outreach & social justice initiatives",
                  "Conference AV production & live-streaming infrastructure",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-brandBlue mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Wizard Sidebar */}
          <div className="space-y-6 md:sticky md:top-28">
            <div className="bg-[#111111] border border-[#222222] rounded-xl shadow-xl overflow-hidden">

              {/* Step Indicator */}
              <div className="border-b border-[#222222] px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-1 rounded">
                    Patron Registration
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Step {step + 1} / {STEPS.length}</span>
                </div>
                {/* Step dots */}
                <div className="flex items-center gap-2">
                  {STEPS.map((s, i) => (
                    <React.Fragment key={i}>
                      <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-brandBlue' : 'bg-slate-800'}`} />
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 font-semibold mt-2">{STEPS[step]}</p>
              </div>

              <div className="p-6 space-y-4">

                {/* ─── STEP 0: Choose Amount ─── */}
                {step === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Select Your Contribution</h3>

                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_AMOUNTS.map((amt) => {
                        const tier = getTier(amt);
                        const TIcon = tier.icon;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setSelectedAmount(amt)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              selectedAmount === amt
                                ? "bg-brandBlue border-brandBlue shadow-md shadow-brandBlue/20"
                                : "bg-[#1a1a1a] border-[#333] hover:border-brandBlue/50"
                            }`}
                          >
                            <p className={`text-sm font-bold ${selectedAmount === amt ? 'text-white' : 'text-slate-200'}`}>
                              ₹{amt.toLocaleString("en-IN")}
                            </p>
                            <p className={`text-[10px] mt-0.5 font-semibold ${selectedAmount === amt ? 'text-blue-200' : 'text-slate-500'}`}>
                              {tier.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedAmount("custom")}
                      className={`w-full p-3 rounded-xl border text-sm font-bold transition-all ${
                        selectedAmount === "custom"
                          ? "bg-brandBlue border-brandBlue text-white shadow-md"
                          : "bg-[#1a1a1a] border-[#333] text-slate-300 hover:border-brandBlue/50"
                      }`}
                    >
                      Custom Amount
                    </button>

                    {selectedAmount === "custom" && (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="Enter amount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-[#1a1a1a] border border-[#333] text-white font-bold text-sm rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none"
                        />
                      </div>
                    )}

                    {/* Purpose */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose</label>
                      <select
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#333] text-slate-200 text-xs rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none font-semibold"
                      >
                        {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    {/* Current tier indicator */}
                    {getFinalAmount() >= 1 && (
                      <div className={`flex items-center gap-2 p-3 rounded-xl border ${currentTier.bg}`}>
                        <TierIcon className={`size-5 ${currentTier.color} shrink-0`} />
                        <div>
                          <p className={`text-xs font-bold ${currentTier.color}`}>{currentTier.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{currentTier.desc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── STEP 1: Review & Pay ─── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Review Your Contribution</h3>

                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
                      <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${currentTier.bg}`}>
                        <TierIcon className={`size-5 ${currentTier.color} shrink-0`} />
                        <div>
                          <p className={`text-xs font-bold ${currentTier.color}`}>{currentTier.label}</p>
                          <p className="text-[10px] text-slate-400">{currentTier.desc}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Contribution Amount</span>
                          <span className="font-bold text-white text-sm">₹{getFinalAmount().toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Purpose</span>
                          <span className="font-semibold text-slate-200">{purpose}</span>
                        </div>
                        <div className="h-px bg-[#333] my-2" />
                        <div className="flex justify-between text-slate-400">
                          <span>Name</span>
                          <span className="font-semibold text-slate-200 text-right max-w-[60%] truncate">{name || "Google User"}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Email</span>
                          <span className="font-semibold text-slate-200 text-right max-w-[60%] truncate">{email || "Linked Account"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Consent */}
                    <div className="flex items-start gap-2.5 p-3 bg-[#1a1a1a] border border-[#333] rounded-xl mt-2">
                      <input
                        type="checkbox"
                        id="consent-patron"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 size-4 text-brandBlue focus:ring-brandBlue border-slate-600 rounded cursor-pointer"
                      />
                      <label htmlFor="consent-patron" className="text-[11px] text-slate-400 font-medium cursor-pointer leading-snug">
                        Display my name on the Patron Recognition Wall on vishwaleader.com as a valued supporter.
                      </label>
                    </div>
                  </div>
                )}

                {/* Error */}
                {errorMsg && (
                  <div className="p-3 bg-rose-950/50 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 pt-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={loading}
                      className="flex items-center gap-1 px-4 py-2.5 bg-[#1a1a1a] text-slate-300 border border-[#333] rounded-xl text-xs font-bold hover:border-slate-500 transition-all disabled:opacity-40"
                    >
                      <ChevronLeft className="size-3.5" /> Back
                    </button>
                  )}
                  {step < 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brandBlue text-white font-bold py-2.5 rounded-xl text-xs hover:bg-brandBlue/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brandBlue/20"
                    >
                      Continue <ChevronRight className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePay}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brandBlue text-white font-bold py-2.5 rounded-xl text-xs hover:bg-brandBlue/90 active:scale-[0.99] transition-all shadow-md shadow-brandBlue/20 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <><Loader2 className="size-3.5 animate-spin" /> Verifying...</>
                      ) : (
                        <><CreditCard className="size-3.5" /> Pay ₹{getFinalAmount().toLocaleString("en-IN")}</>
                      )}
                    </button>
                  )}
                </div>

                {/* Security badge */}
                <div className="pt-2 border-t border-[#222] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                    <ShieldCheck className="size-3.5 text-emerald-500" /> SSL Secured
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                    Secured by
                    <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-3 object-contain opacity-40 invert" />
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="border-t border-[#222222] px-6 py-4 text-center">
                <p className="text-[10px] text-slate-600">Or email us at:</p>
                <a href="mailto:info@vishwaleader.com" className="text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 mt-1">
                  info@vishwaleader.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
