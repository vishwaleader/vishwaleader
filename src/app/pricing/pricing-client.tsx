"use client";

import React, { useEffect, useState } from "react";
import Preloader from "@/components/Preloader";
import { Check, Image as ImageIcon, Send } from "lucide-react";

const adRates = [
  { name: "Front Cover (Premium)", type: "Full Page", price: "₹5,00,000", color: "bg-[#111111] border-[#222222] text-white", labelColor: "text-slate-400" },
  { name: "Back Cover (Premium)", type: "Full Page", price: "₹2,00,000", color: "bg-slate-900 border-slate-800 text-white", labelColor: "text-slate-400" },
  { name: "Inside Front Cover", type: "Full Page", price: "₹1,50,000", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400" },
  { name: "Inside Back Cover", type: "Full Page", price: "₹1,50,000", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400" },
  { name: "Double Spread", type: "-", price: "₹1,00,000", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400" },
  { name: "Full Page", type: "Full Page", price: "₹50,000", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400" },
  { name: "Half Page", type: "-", price: "₹25,000", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400" },
  { name: "Quarter Page", type: "-", price: "₹15,000", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400" },
];

export default function PricingClientPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500); // Quick animation simulation
  }, []);

  const handleProceed = () => {
    window.location.href = "/auth/member?tab=registration";
  };

  if (loading) return <Preloader />;

  return (
    <>

      <main className="min-h-screen bg-white font-sans pb-32">
        {/* Header Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-20 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
            Plans and Pricing
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto mb-10">
            Select an all-inclusive VIP tour package, or build a custom itinerary with our a la carte options.
          </p>
        </section>

        {/* Pricing Grids */}
        <section className="max-w-7xl mx-auto px-6">
          
          {/* Tour Packages (Ordered Highest to Lowest) */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              
              {/* Package 1 (3,10,000) - Premium Dark Mode */}
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 flex flex-col shadow-xl relative order-1">
                <div className="flex items-start justify-between gap-2 mb-2 h-[64px]">
                  <h3 className="text-xl font-semibold text-white leading-tight pr-2">7 Nights / 8 Days</h3>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 mt-1">VIP</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-white">₹3,10,000</span>
                </div>
                <p className="text-sm text-slate-400 mb-8 pb-8 border-b border-[#333333] h-[100px]">International Tour Package (Mumbai – London – Mumbai)</p>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Return airfare (Mumbai – London – Mumbai)</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Accommodation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Meals as per itinerary</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Local transportation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Sightseeing as per programme</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-amber-400 mt-0.5" /><span className="text-amber-400 font-medium">Event Registration (Worth ₹23,600) Included</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>All applicable taxes and package inclusions</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Register Now</button>
              </div>

              {/* Package 2 (2,35,000) */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col hover:border-slate-300 transition-colors relative order-2">
                <div className="flex items-start justify-between gap-2 mb-2 h-[64px]">
                  <h3 className="text-xl font-semibold text-slate-900 leading-tight pr-2">4 Nights / 5 Days</h3>
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 mt-1">Popular</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">₹2,35,000</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100 h-[100px]">International Tour Package (Mumbai – London – Mumbai)</p>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Return airfare (Mumbai – London – Mumbai)</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Accommodation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Meals as per itinerary</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Local transportation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-brandBlue mt-0.5" /><span className="text-brandBlue font-medium">Event Registration (Worth ₹23,600) Included</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>All applicable taxes and package inclusions</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-slate-900 text-white hover:bg-slate-800 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Register Now</button>
              </div>

              {/* Package 3 (2,00,500) */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col hover:border-slate-300 transition-colors order-3">
                <div className="flex items-start justify-between gap-2 mb-2 h-[64px]">
                  <h3 className="text-xl font-semibold text-slate-900 leading-tight pr-2">7 Nights / 8 Days</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">₹2,00,500</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100 h-[100px]">Land Package (London Only)</p>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Accommodation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Local transportation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Meals as per itinerary</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-brandBlue mt-0.5" /><span className="text-brandBlue font-medium">Event Registration (Worth ₹23,600) Included</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>All applicable package inclusions within London</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-slate-900 text-white hover:bg-slate-800 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Register Now</button>
              </div>

              {/* Package 4 (1,31,000) */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col hover:border-slate-300 transition-colors order-4">
                <div className="flex items-start justify-between gap-2 mb-2 h-[64px]">
                  <h3 className="text-xl font-semibold text-slate-900 leading-tight pr-2">4 Nights / 5 Days</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">₹1,31,000</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100 h-[100px]">Land Package (London Only)</p>
                
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Accommodation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Local transportation</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Meals as per itinerary</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-brandBlue mt-0.5" /><span className="text-brandBlue font-medium">Event Registration (Worth ₹23,600) Included</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>All applicable package inclusions within London</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-slate-900 text-white hover:bg-slate-800 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Register Now</button>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* A La Carte Event Days */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Individual Registration Fees</h2>
              <p className="text-sm text-slate-500 mb-6">A la carte event registrations.</p>
              
              <div className="space-y-3 flex-grow">
                {[
                  { name: "International Conference", base: "5,000", gst: "900", total: "5,900" },
                  { name: "International Business Summit", base: "10,000", gst: "1,800", total: "11,800" },
                  { name: "International Awards & Cultural Ceremony", base: "5,000", gst: "900", total: "5,900" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col p-4 rounded-lg border border-slate-100 bg-slate-50">
                    <span className="font-semibold text-slate-800 text-sm mb-1">{item.name}</span>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>₹{item.base} + GST (18%) ₹{item.gst}</span>
                      <span className="font-bold text-slate-900 text-sm">₹{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center bg-brandBlue/5 p-4 rounded-lg border-brandBlue/10">
                <span className="font-bold text-brandBlue text-sm">Total Registration for All 3 Events:</span>
                <span className="font-black text-brandBlue text-lg">₹23,600</span>
              </div>
            </div>

            {/* Important Notes & Early Bird */}
            <div className="flex flex-col gap-6">
              <div className="bg-amber-50 rounded-xl p-8 border border-amber-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <span className="bg-amber-400 text-amber-900 text-[10px] uppercase font-black px-2 py-0.5 rounded">Early Bird Offer</span>
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  Special Early Bird Tour Prices are valid only for the <strong>First Batch of Delegates until 15 July</strong>.
                </p>
                <p className="text-sm text-amber-700/80 mt-3 leading-relaxed">
                  Seats are limited and will be allotted on a first-come, first-served basis. After 15 July, package prices may be revised without prior notice depending on airfare, hotel availability, and operational costs. Register early to secure your seat and enjoy the special introductory pricing.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 shadow-sm relative">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Important Note</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  For complete package inclusions, day-wise programme, sightseeing, accommodation details, and other important information, please refer to the <strong>Tour Itinerary PDF</strong> available in the PDF section.
                </p>
              </div>
            </div>
          </div>

          {/* Advertisement Rates */}
          <div className="max-w-4xl mx-auto mb-20 space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-400" /> Advertisement Rates
              </h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                The souvenir will be distributed to international delegates, diplomats, business leaders, academicians, cultural icons, media, and awardees during the 3-day global event in London. All advertisements will be printed in full color.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {adRates.map((ad, i) => (
                  <div key={i} className={`p-6 rounded-xl border ${ad.color} flex flex-col justify-between h-full shadow-sm`}>
                    <div>
                      <p className={`font-semibold text-xs uppercase tracking-wider mb-2 ${ad.labelColor}`}>{ad.type}</p>
                      <h3 className="font-semibold text-lg mb-6">{ad.name}</h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold tracking-tight">{ad.price}</p>
                      {ad.name.includes('Premium') && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">VIP</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-slate-400" /> Submission Guidelines
              </h2>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>All artwork should be high resolution <strong>(300 DPI)</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span><strong>A4 size</strong> for all full-page advertisements.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>Accepted formats: <strong>PDF, JPG, PNG, AI, CDR</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
