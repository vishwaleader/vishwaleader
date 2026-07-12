"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Calendar, MapPin, Mail, Trophy, Info, Users, Check } from 'lucide-react';
import Preloader from '@/components/Preloader';

export default function AwardsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleActionClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/auth/member");
    } else {
      const provider = new GoogleAuthProvider();
      try {
        setLoadingAuth(true);
        await signInWithPopup(auth, provider);
        router.push("/auth/member");
      } catch (err) {
        console.error("Login failed:", err);
      } finally {
        setLoadingAuth(false);
      }
    }
  };

  if (loadingAuth) return <Preloader />;

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
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              Honoring individuals and organizations making exceptional contributions to social justice, equality, and human rights.
            </p>
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

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            
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
              <h3 className="text-lg font-semibold text-white mb-2">Registration Portal</h3>
              <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-[#333333]">
                Deadline: <strong className="text-white">31st May 2026</strong>
              </p>

              <div className="space-y-3 mb-8 text-sm text-slate-300">
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
              
              <button onClick={handleActionClick} className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 rounded-lg text-sm transition-colors mb-6">
                Register & Nominate
              </button>
              
              <div className="text-center text-xs text-slate-500">
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
