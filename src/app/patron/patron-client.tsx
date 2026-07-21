"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, CreditCard, ShieldCheck, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { createDonationOrder, verifyDonationPayment } from "@/app/actions/donationActions";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export default function PatronClientPage() {
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const finalAmt =
    selectedAmount === "custom"
      ? parseInt(customAmount || "0", 10)
      : selectedAmount;

  const handlePay = async () => {
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name or organisation.");
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
    if (!finalAmt || finalAmt < 1000) {
      setErrorMsg("Minimum contribution amount is ₹1,000.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Razorpay order via Server Action
      const orderRes = await createDonationOrder(finalAmt);

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.error || "Failed to initialize payment gateway.");
      }

      const orderData = orderRes.order;

      // 2. Load Razorpay SDK dynamically if needed
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Vishwa Leader 2026",
        description: "Patron Contribution & Recognition",
        image: "/assets/images/favicon-32x32.png",
        order_id: orderData.id,
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#1e3a8a",
        },
        handler: async function (response: any) {
          try {
            // Verify payment securely on server
            const verifyRes = await verifyDonationPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              userId: null,
              name: name,
              email: email,
              phone: phone,
              amount: finalAmt,
              purpose: "Patron Contribution — Vishwa Leader 2026",
              consent: consent
            });

            if (verifyRes.success) {
              router.push(
                `/checkout/success?payment_id=${response.razorpay_payment_id}&amount=${finalAmt}&type=patron`
              );
            } else {
              setErrorMsg(verifyRes.error || "Payment verification failed. Please contact support.");
            }
          } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Error verifying payment signature.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-32">
      {/* Header Section */}
      <div className="bg-brandBlue relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 mb-8 sm:mb-12">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Back Button */}
          <div className="flex justify-start mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm border border-white/20 active:scale-95 cursor-pointer"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-widest border border-white/20 mb-4 sm:mb-6 backdrop-blur-sm">
            <Heart className="w-4 h-4 fill-amber-300 text-amber-300" />
            Support Vishwa Leader 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white tracking-tight mb-3 sm:mb-4 leading-tight">
            Patron Contribution & Recognition
          </h1>
          <p className="text-blue-100 text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We kindly invite individuals, organisations, institutions and well-wishers to support the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026, London, UK.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 space-y-6 sm:space-y-10">
        {/* Information & Details Card */}
        <div id="recognition-details" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm space-y-6 scroll-mt-24">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500" /> Patron Contribution & Recognition
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We kindly invite individuals, organisations, institutions and well-wishers to support the <strong className="text-slate-800"><span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026, London, UK</strong>.
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Recognition & Acknowledgement</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1.5 sm:space-y-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs sm:text-sm">
                  📖
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Souvenir Recognition</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  All contributors will receive a special place of recognition in the official Vishwa Leader Souvenir Magazine, with the prominence and placement of the acknowledgement determined according to the level of contribution.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 space-y-1.5 sm:space-y-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-brandBlue flex items-center justify-center font-bold text-xs sm:text-sm">
                  🌐
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Website Listing</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  The names of patrons and contributors will also be listed on the official Vishwa Leader website.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50/60 border border-purple-200/60 space-y-1.5 sm:space-y-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs sm:text-sm">
                  🏛️
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">London 2026 Acknowledgement</h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  Contributors making a significant contribution of ₹1,00,000 or more may receive additional special acknowledgement during the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026, London, UK, subject to the contribution level and event arrangements.
                </p>
              </div>
            </div>

            <p className="pt-2 text-slate-700 font-medium text-[11px] sm:text-sm border-t border-slate-100 leading-relaxed">
              Kindly contribute ₹1,000 or more and become a valued supporter of this prestigious international initiative inspired by the values and teachings of Bharat Ratna Dr. B. R. Ambedkar.
            </p>
          </div>
        </div>

        {/* Premium Black Payment Card Theme */}
        <div id="contribution-form" className="bg-slate-900 text-white rounded-2xl p-4 sm:p-8 md:p-10 shadow-xl space-y-6 sm:space-y-8 border border-slate-800 scroll-mt-24">
          
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white">Select Contribution Amount</h2>
            <p className="text-xs text-slate-400">Choose your contribution amount or specify a custom value.</p>
            
            {/* Amount Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5 pt-1 sm:pt-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center min-h-[44px] flex items-center justify-center whitespace-nowrap cursor-pointer ${
                    selectedAmount === amt
                      ? "bg-brandBlue border-brandBlue text-white shadow-md shadow-brandBlue/30 scale-[1.02]"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-slate-500 active:bg-slate-700"
                  }`}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            {/* Custom Amount Button */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => setSelectedAmount("custom")}
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all min-h-[44px] cursor-pointer ${
                  selectedAmount === "custom"
                    ? "bg-brandBlue border-brandBlue text-white shadow-md"
                    : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-500 active:bg-slate-700"
                }`}
              >
                Custom Contribution Amount
              </button>

              {selectedAmount === "custom" && (
                <div className="mt-3 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base sm:text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    placeholder="Enter amount (min ₹1,000)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 bg-slate-800 border border-slate-700 text-white font-bold text-base sm:text-sm rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none min-h-[48px]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4 pt-3 sm:pt-4 border-t border-slate-800">
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Contributor Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium text-xs">Full Name / Organisation</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name or organisation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none text-base sm:text-sm min-h-[48px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium text-xs">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none text-base sm:text-sm min-h-[48px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium text-xs">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-1 focus:ring-brandBlue focus:border-brandBlue outline-none text-base sm:text-sm min-h-[48px]"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="consent-minimal"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-5 text-brandBlue focus:ring-brandBlue border-slate-700 rounded cursor-pointer shrink-0"
              />
              <label htmlFor="consent-minimal" className="text-xs text-slate-400 cursor-pointer leading-relaxed select-none">
                Display my name / organisation on the official Vishwa Leader website and souvenir recognition.
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Payment CTA Button */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 px-6 bg-brandBlue hover:bg-brandBlue/90 active:bg-brandBlue/80 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-brandBlue/30 flex items-center justify-center gap-2 min-h-[52px] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Payment...</>
              ) : (
                <><CreditCard className="w-5 h-5" /> Contribute ₹{finalAmt > 0 ? finalAmt.toLocaleString("en-IN") : "1,000"}</>
              )}
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 text-center sm:text-left">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit Encrypted SSL</span>
              <span className="flex items-center gap-1">Secured by <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-3.5 opacity-60 invert" /></span>
            </div>
          </div>

        </div>

        {/* Closing Note */}
        <p className="text-center text-[11px] sm:text-xs text-slate-500 leading-relaxed max-w-xl mx-auto px-4">
          Kindly contribute ₹1,000 or more and become a valued supporter of this prestigious international initiative inspired by the values and teachings of Bharat Ratna Dr. B. R. Ambedkar.
        </p>

      </main>
    </div>
  );
}
