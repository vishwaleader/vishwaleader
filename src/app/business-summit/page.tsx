"use client";

import { Globe, Handshake, Users, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import EventRegistrationCTA from '@/components/EventRegistrationCTA';

export default function BusinessSummitPage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      <main className="pb-16 md:pb-20">

        {/* Hero */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
              International Business Summit
            </h1>
            <p className="text-blue-100 text-base md:text-lg mb-10 max-w-2xl mx-auto">
              On the Eve of the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-sm max-w-3xl mx-auto">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Summit Theme</p>
              <p className="text-lg md:text-xl font-serif text-white italic">
                &quot;Business as a Driver of Social Change: Realizing Dr. Ambedkar&apos;s Vision in Today&apos;s Economy&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">

            {/* About */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" /> About the Summit
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                <p>
                  The Organising Committee of the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026 cordially invites business leaders, entrepreneurs, investors, corporate executives, startup founders, industry professionals, and social enterprises from across the world to participate in the International Business Summit, held in London on 19th September 2026.
                </p>
                <p>
                  The Summit serves as a global platform for strategic dialogue, cross-border collaboration, innovation, and inclusive economic growth, inspired by Dr. B. R. Ambedkar&apos;s economic and social philosophy.
                </p>
              </div>
            </div>

            {/* Association Logos */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-slate-400" /> In Association With
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {/* GBBC */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center flex flex-col items-center gap-4 hover:border-brandBlue/30 hover:shadow-md transition-all">
                  <div className="w-24 h-24 relative flex items-center justify-center bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
                    <Image src="/assets/images/GBBC.png" alt="GBBC Logo" fill className="object-contain p-2" />
                  </div>
                  <p className="font-semibold text-slate-900 text-xs leading-snug">Global Bahujan Business Council (GBBC)</p>
                </div>
                {/* DACC */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center flex flex-col items-center gap-4 hover:border-brandBlue/30 hover:shadow-md transition-all">
                  <div className="w-24 h-24 relative flex items-center justify-center bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
                    <Image src="/assets/images/DACCI-2-hd.png" alt="DACC Logo" fill className="object-contain p-2" />
                  </div>
                  <p className="font-semibold text-slate-900 text-xs leading-snug">Dr. Ambedkar Chamber of Commerce (DACC)</p>
                </div>
                {/* WLCC */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center flex flex-col items-center gap-4 hover:border-brandBlue/30 hover:shadow-md transition-all">
                  <div className="w-24 h-24 relative flex items-center justify-center bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
                    <Image src="/assets/images/WLCC.png" alt="WLCC Logo" fill className="object-contain p-2" />
                  </div>
                  <p className="font-semibold text-slate-900 text-xs leading-snug">West London Chamber of Commerce (WLCC)</p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" /> Venue Location
                </h2>
                <p className="text-slate-500 text-sm mt-1">Atrium Hotel, Bath Road, Heathrow, London, UK</p>
              </div>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY}&q=Atrium+Hotel+Heathrow,Bath+Road,London,UK&zoom=15&maptype=satellite`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Business Summit Venue — Atrium Hotel, London"
              />
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Summit Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Summit Details</h3>
              <ul className="space-y-5 text-sm">
                <li className="flex gap-4 items-start">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Date</p>
                    <p className="text-slate-500 mt-1">19th September 2026</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Venue</p>
                    <p className="text-slate-500 mt-1">Atrium Hotel Banquet Suite, Heathrow, London, UK</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Online Registration Portal */}
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 shadow-2xl">
              <div className="mb-2">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-1 rounded">Online Registration</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-3 mb-1">Register as Delegate</h3>
              <p className="text-slate-400 text-xs mb-6 pb-6 border-b border-white/10">
                Secure your seat at the International Business Summit. Registration includes access to all summit sessions, networking banquet, and delegate kit.
              </p>

              <div className="space-y-3 text-xs text-slate-400 mb-6">
                <div className="flex justify-between items-center">
                  <span>Delegate Registration</span>
                  <span className="font-bold text-white">₹11,800 <span className="text-slate-500 font-normal">(incl. GST)</span></span>
                </div>
              </div>

              <EventRegistrationCTA
                itemId="reg_business"
                price="₹11,800"
                label="Register as Delegate"
                paidLabel="✅ Delegate Registered"
                dark
              />

              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-600">Powered by</p>
                <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain mx-auto mt-1 opacity-40 invert" />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
