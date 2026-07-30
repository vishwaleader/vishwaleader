"use client";

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Calendar, MapPin, Mail, Trophy, Info, Users, Check, Download } from 'lucide-react';
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
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              Applications Now Open
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
              <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Honoring individuals and organizations making exceptional contributions to social justice, equality, and human rights.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/pdfs/awards-circular-2026.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-slate-900 font-bold rounded-xl shadow-lg hover:bg-amber-300 transition-all text-sm"
              >
                <Download className="w-4 h-4" /> Download Awards Circular Brochure (PDF)
              </a>
              <a 
                href="/pdfs/nomination-form-2026.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 shadow hover:bg-white/20 transition-all text-sm"
              >
                <Download className="w-4 h-4" /> Nomination Form (PDF)
              </a>
            </div>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-8">
            
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-400" /> About the Awards
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                We are delighted to announce the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026, scheduled to be held in London. This prestigious global event aims to honour individuals and organizations making exceptional contributions to social justice, equality, human rights, education, economic empowerment, and community development, inspired by the timeless principles of Dr. B. R. Ambedkar.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-slate-400" /> Award Categories
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Social Justice Leadership",
                  "Education and Empowerment",
                  "Economic Development and Inclusion",
                  "Human Rights Advocacy",
                  "Innovative Community Service"
                ].map((category, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-start gap-3">
                    <div className="bg-white border border-slate-200 text-slate-900 w-8 h-8 rounded flex items-center justify-center font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-medium text-slate-700 text-sm mt-1">{category}</span>
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
                price="₹5,900"
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
