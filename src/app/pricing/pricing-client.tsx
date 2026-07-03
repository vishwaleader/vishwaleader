"use client";

import React, { useEffect, useState } from "react";
import Preloader from "@/components/Preloader";
import { Check } from "lucide-react";

export default function PricingClientPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500); // Quick animation simulation
  }, []);

  const handleProceed = () => {
    window.location.href = "/auth/member?tab=payment";
  };

  if (loading) return <Preloader />;

  return (
    <>
      {/* Navbar overlay header */}
      <header className="fixed w-full top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-7 w-auto object-contain" />
            <span className="font-sans font-bold tracking-tight text-sm text-slate-900">Vishwa Leader</span>
          </a>
          <div className="flex gap-6 text-sm font-medium text-slate-500 hidden md:flex">
            <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
            <a href="/awards" className="hover:text-slate-900 transition-colors">Awards</a>
            <a href="/pricing" className="text-slate-900">Pricing</a>
          </div>
          <button onClick={handleProceed} className="bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all">
            Get Started
          </button>
        </div>
      </header>

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
          
          {/* Tour Packages (Ordered 4 -> 3 -> 2 -> 1) */}
          <div className="mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              
              {/* Package 4 (1,31,000) */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col hover:border-slate-300 transition-colors">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Budget Option</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">₹1,31,000</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">For a basic tour experience.</p>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Land Package (Basic)</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Event Registration</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Get started with Budget</button>
              </div>

              {/* Package 3 (2,00,501) */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col hover:border-slate-300 transition-colors">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Land Only</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">₹2,00,501</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">Standard land accommodations.</p>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Land Package</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Event Registration</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Get started with Land Only</button>
              </div>

              {/* Package 2 (2,35,000) */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col hover:border-slate-300 transition-colors relative">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900">Standard</h3>
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">₹2,35,000</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">Great for international travelers.</p>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Land Package</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Visa Processing</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Medical Insurance (Upto 59yrs)</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-600"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /><span>Event Registration</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Get started with Standard</button>
              </div>

              {/* Package 1 (3,10,000) - Premium Dark Mode */}
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 flex flex-col shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-2">VIP Full Experience</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-white">₹3,10,000</span>
                </div>
                <p className="text-sm text-slate-400 mb-8 pb-8 border-b border-[#333333]">For the complete, worry-free tour.</p>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Everything in Standard</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Economy Airfare Included</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Priority Support</span></li>
                  <li className="flex items-start gap-3 text-sm text-slate-300"><Check className="size-4 shrink-0 text-white mt-0.5" /><span>Premium Accommodations</span></li>
                </ul>
                <button onClick={handleProceed} className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-2.5 rounded-lg text-sm transition-colors mt-auto">Get started with VIP</button>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* A La Carte Event Days */}
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">A La Carte Events</h2>
              <p className="text-sm text-slate-500 mb-6">Build your custom itinerary.</p>
              
              <div className="space-y-3">
                {[
                  { name: "Day 1: International Conference", price: "5,900" },
                  { name: "Day 2: International Business Summit", price: "11,800" },
                  { name: "Day 3: International Awards", price: "5,900" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <span className="font-medium text-slate-700 text-sm">{item.name}</span>
                    <span className="font-semibold text-slate-900 text-sm">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Souvenir Ads */}
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Souvenir Advertisements</h2>
              <p className="text-sm text-slate-500 mb-6">Global visibility in print.</p>
              
              <div className="space-y-3">
                {[
                  { name: "Front Cover (Premium)", price: "5,00,000" },
                  { name: "Back Cover (Premium)", price: "2,00,000" },
                  { name: "Inside Front/Back Cover", price: "1,50,000" },
                  { name: "Double Spread", price: "1,00,000" },
                  { name: "Full Page", price: "50,000" },
                  { name: "Half Page", price: "25,000" },
                  { name: "Quarter Page", price: "15,000" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <span className="font-medium text-slate-700 text-sm">{item.name}</span>
                    <span className="font-semibold text-slate-900 text-sm">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
