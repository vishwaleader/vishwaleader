"use client";

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Calendar, MapPin, Mail, Trophy, Info, Users, Check, Download, Clock } from 'lucide-react';
import EventRegistrationCTA from '@/components/EventRegistrationCTA';

export default function AwardsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pb-32">

      <main className="pb-16 md:pb-20">
        
        {/* Hero Section */}
        <div className="bg-brandBlue relative overflow-hidden min-h-screen flex flex-col items-center justify-between -mt-16 md:-mt-20 pt-28 md:pt-36 pb-8 mb-16 text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 my-auto">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest border border-emerald-500/30 mb-6 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              2026 Event Concluded
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026
            </h1>
            <p className="text-blue-100 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
              Honoring individuals and organizations making exceptional contributions to social justice, equality, and human rights.
            </p>
          </div>
          <div className="relative z-10 pt-4 flex flex-col items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-widest animate-bounce">
            <span>Scroll Down to Explore</span>
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Minute-to-Minute Schedule (20th Sept 2026) */}
            <div id="schedule" className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm scroll-mt-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brandBlue" /> Minute-to-Minute Program Schedule
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Sunday, 20th September 2026 — Greenwood Theatre, King&apos;s College London</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-wider">Day 4 (Awards & Cultural)</span>
              </div>
              <div className="space-y-4">
                {[
                  { time: "08:30 AM – 10:00 AM", title: "Delegate Breakfast", desc: "Breakfast at Atrium Hotel Heathrow." },
                  { time: "10:00 AM – 01:00 PM", title: "Morning Leisure & Global Delegate Networking", desc: "Free time for international delegate networking, press & media interactions." },
                  { time: "01:00 PM – 02:00 PM", title: "Indian Buffet Lunch", desc: "Indian lunch served at hotel." },
                  { time: "02:30 PM – 03:30 PM", title: "Coach Departure for Central London", desc: "Executive coach transfer to Greenwood Theatre, Guy's Campus, King's College London." },
                  { time: "04:00 PM – 04:30 PM", title: "Red Carpet VIP Reception", desc: "Arrival of award recipients, VIP dignitaries, House of Lords patrons, and media." },
                  { time: "04:30 PM – 06:00 PM", title: "Dr. Ambedkar International Awards Ceremony", desc: "Presentation of prestigious International Awards to honored global leaders." },
                  { time: "06:00 PM – 07:00 PM", title: "Cultural Evening & Performing Arts Showcase", desc: "Live music, poetry, and socio-cultural performances celebrating Dr. Ambedkar's legacy." },
                  { time: "07:30 PM – 09:30 PM", title: "Gala Awards Dinner & Return Transfer", desc: "Dinner at Indian restaurant in central London followed by return coach to hotel." },
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

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-400" /> About the Awards
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                We are delighted to announce the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026, scheduled to be held in London. This prestigious global event aims to honour individuals and organizations making exceptional contributions to social justice, equality, human rights, education, economic empowerment, and community development, inspired by the timeless principles of Dr. B. R. Ambedkar.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> Award Categories & Honored Awardees (Winners 2026)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Official Announcement of Awardees — Dr. B. R. Ambedkar International Awards 2026
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-wider">
                  Official 2026 Winners
                </span>
              </div>

              <div className="space-y-6">
                {[
                  {
                    category: "Social Justice Leadership",
                    awardees: [
                      "G. Govindaraju",
                      "The Ambedkar Association of North America (AANA)"
                    ]
                  },
                  {
                    category: "Education and Empowerment",
                    awardees: [
                      "POETIC JUSTICE FOUNDATION",
                      "Dr Pallavi G.K"
                    ]
                  },
                  {
                    category: "Economic Development and Inclusion",
                    awardees: [
                      "Ichiro Koike",
                      "M. Suhail Yacoob Khandwani"
                    ]
                  },
                  {
                    category: "Human Rights Advocacy",
                    awardees: [
                      "Prof Kevin Brown"
                    ]
                  },
                  {
                    category: "Innovative Community Service",
                    awardees: [
                      "Sadguru Yogiraj Dr. Mangeshda",
                      "Mr Shivshankar Lature"
                    ]
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-amber-300 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-brandBlue text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {i + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{item.category}</h3>
                    </div>
                    <div className="pl-10 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Honored Awardees / Winners:</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {item.awardees.map((winner, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-center gap-2.5 shadow-2xs">
                            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-semibold text-slate-800 text-xs">{winner}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" /> Eligibility Criteria
              </h2>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-slate-900 shrink-0" />
                  <span>Open to individuals, organizations, and institutions worldwide.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-slate-900 shrink-0" />
                  <span>Nominees must demonstrate significant impact aligned with Dr. Ambedkar's vision.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-slate-900 shrink-0" />
                  <span>Applications are welcome from academia, civil society, government, business, and private sectors.</span>
                </li>
              </ul>
            </div>

            {/* Google Maps */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" /> Venue Location
                </h2>
                <p className="text-slate-500 text-sm mt-1">Greenwood Theatre, Guys Campus, King&apos;s College, London</p>
              </div>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY}&q=Greenwood+Theatre,King%27s+College+London,UK&zoom=15&maptype=satellite`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Awards Venue — Greenwood Theatre, London"
              />
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Official Circular & Brochure</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">Download the official Awards Circular 2026 brochure and offline nomination form.</p>
              <div className="space-y-3">
                <a 
                  href="/pdfs/awards-circular-2026.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brandBlue text-white font-bold rounded-xl shadow hover:bg-blue-700 transition-all text-xs"
                >
                  <Download className="w-4 h-4" /> Download Awards Circular (PDF)
                </a>
                <a 
                  href="/pdfs/nomination-form-2026.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-all text-xs"
                >
                  <Download className="w-4 h-4" /> Nomination Form (PDF)
                </a>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Event Details</h3>
              <ul className="space-y-5 text-sm">
                <li className="flex gap-4 items-start">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Date</p>
                    <p className="text-slate-500 mt-1">20th September 2026</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Venue</p>
                    <p className="text-slate-500 mt-1">Greenwood Theatre, Guys Campus, King's College, London.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 shadow-xl">
              <div className="mb-2">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-1 rounded">Online Registration</span>
              </div>
              <h3 className="text-lg font-semibold text-white mt-3 mb-2">Registration Portal</h3>
              <p className="text-slate-400 text-xs mb-6 pb-6 border-b border-[#333333]">
                Deadline: <strong className="text-white">31st May 2026</strong>
              </p>

              <div className="space-y-3 mb-6 text-sm text-slate-300">
                <p className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Detailed description of achievements
                </p>
                <p className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Supporting documents
                </p>
                <p className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> References or testimonials
                </p>
              </div>

              <EventRegistrationCTA
                itemId="reg_award"
                price="₹6,136"
                label="Register & Nominate"
                paidLabel="✅ Awards Registration Active"
                dark
              />

              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-600">Secured by</p>
                <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain mx-auto mt-1 opacity-40 invert" />
              </div>

              <div className="mt-6 pt-5 border-t border-[#333333] text-center text-xs text-slate-500">
                <p>Or email nomination to:</p>
                <a href="mailto:vishwaleaderawards@gmail.com" className="text-slate-300 hover:text-white font-medium flex items-center justify-center gap-1.5 mt-2">
                  <Mail className="w-3.5 h-3.5" /> vishwaleaderawards@gmail.com
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
