"use client";

import { Globe, Handshake, Users, Calendar, MapPin, Download, Clock } from 'lucide-react';
import Image from 'next/image';
import EventRegistrationCTA from '@/components/EventRegistrationCTA';

export default function BusinessSummitPage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      <main className="pb-16 md:pb-20">

        {/* Hero */}
        <div className="bg-brandBlue relative overflow-hidden min-h-screen flex flex-col items-center justify-between -mt-16 md:-mt-20 pt-28 md:pt-36 pb-8 mb-16 text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 my-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight font-display">
              International Business Summit
            </h1>
            <p className="text-blue-100 text-base md:text-xl mb-8 max-w-2xl mx-auto font-normal">
              On the Eve of the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-sm max-w-3xl mx-auto">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Summit Theme</p>
              <p className="text-lg md:text-2xl font-serif text-white italic">
                &quot;Business as a Driver of Social Change: Realizing Dr. Ambedkar&apos;s Vision in Today&apos;s Economy&quot;
              </p>
            </div>
          </div>
          <div className="relative z-10 pt-4 flex flex-col items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-widest animate-bounce">
            <span>Scroll Down to Explore</span>
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">

            {/* Minute-to-Minute Schedule (19th Sept 2026) */}
            <div id="schedule" className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm scroll-mt-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brandBlue" /> Minute-to-Minute Program Schedule
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Saturday, 19th September 2026 — Atrium Hotel Heathrow, London</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-wider">Day 3 (Business)</span>
              </div>
              <div className="space-y-4">
                {[
                  { time: "08:30 AM – 09:30 AM", title: "Breakfast at Hotel", desc: "Continental Breakfast at Atrium Hotel Heathrow." },
                  { time: "09:30 AM – 12:30 PM", title: "Windsor Castle Excursion", desc: "Guided sightseeing tour & entrance to historic Windsor Castle." },
                  { time: "01:00 PM – 02:00 PM", title: "Indian Buffet Lunch", desc: "Indian lunch at restaurant." },
                  { time: "02:30 PM – 04:30 PM", title: "Return & Prep Time", desc: "Return to hotel for summit preparation & executive networking." },
                  { time: "05:00 PM – 05:30 PM", title: "Delegate Registration & Business Welcome", desc: "Arrival of delegates, corporate leaders, and VIP dignitaries at Atrium Suite." },
                  { time: "05:30 PM – 07:30 PM", title: "Inaugural Keynote & B2B Presentations", desc: "Opening remarks by GBBC, DACC & WLCC conveners, investor presentations." },
                  { time: "07:30 PM – 09:30 PM", title: "Panel Discussion & Global Network Forum", desc: "Cross-border trade forums, startup pitches & global Bahujan business initiatives." },
                  { time: "09:30 PM Onwards", title: "Business Summit Gala Dinner", desc: "Networking banquet dinner post summit at Hotel Atrium." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-3.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                    <span className="shrink-0 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-900 font-bold text-xs tracking-tight shadow-2xs">
                      {item.time}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Official Prospectus</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">Download the complete International Business Summit 2026 Prospectus & detailed Minute-to-Minute program schedule.</p>
              <a 
                href="/pdfs/business-prospectus-2026.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brandBlue text-white font-bold rounded-xl shadow hover:bg-blue-700 transition-all text-xs"
              >
                <Download className="w-4 h-4" /> Download Prospectus (PDF)
              </a>
            </div>

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
                  <span className="font-bold text-white">₹12,272 <span className="text-slate-500 font-normal">(incl. GST)</span></span>
                </div>
              </div>

              <EventRegistrationCTA
                itemId="reg_business"
                price="₹12,272"
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
