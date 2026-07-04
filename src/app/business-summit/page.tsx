"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { MapPin, Calendar, Mail, Users, Handshake, Globe } from 'lucide-react';
import Preloader from '@/components/Preloader';

export default function BusinessSummitPage() {
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
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-7 w-auto object-contain" />
            <span className="font-sans font-bold tracking-tight text-sm text-slate-900">Vishwa Leader</span>
          </a>
          <div className="flex gap-6 text-sm font-medium text-slate-500 hidden md:flex">
            <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
          </div>
          <button onClick={handleActionClick} className="bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all">
            Get Started
          </button>
        </div>
      </header>

      <main className="pb-16 md:pb-20">
        
        {/* Hero Section */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
              International Business Summit
            </h1>
            <p className="text-blue-100 text-base md:text-lg mb-10 max-w-2xl mx-auto">
              On the Eve of the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-sm max-w-3xl mx-auto">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Summit Theme</p>
              <p className="text-lg md:text-xl font-serif text-white italic">
                "Business as a Driver of Social Change: Realizing Dr. Ambedkar's Vision in Today's Economy"
              </p>
            </div>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-8">
            
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" /> About the Summit
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                <p>
                  The Organising Committee of the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026 cordially invites business leaders, entrepreneurs, investors, corporate executives, startup founders, industry professionals, and social enterprises from across the world to participate in the Vishwa Leader Dr. B. R. Ambedkar International Business Summit, to be held in London, UK on 19th September 2026.
                </p>
                <p>
                  Held as a key component of the international celebrations preceding the Awards Ceremony, the Business Summit serves as a global platform for strategic dialogue, cross-border collaboration, innovation, and inclusive economic growth, inspired by the economic and social philosophy of Dr. B. R. Ambedkar. The Summit seeks to bridge commerce with conscience by promoting ethical leadership, entrepreneurship, sustainable business practices, and social responsibility in a rapidly evolving global economy.
                </p>
                <p>
                  The Summit aims to bring together visionary business leaders, policymakers, investors, innovators, MSMEs, startups, and global enterprises to exchange ideas, explore partnerships, identify investment opportunities, and collectively work towards building a more inclusive, equitable, and socially transformative global business ecosystem rooted in Ambedkarite values.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-slate-400" /> In Association With
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="font-semibold text-slate-900 text-xs">Global Bahujan Business Council (GBBC)</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="font-semibold text-slate-900 text-xs">Dr. Ambedkar Chamber of Commerce (DACC)</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="font-semibold text-slate-900 text-xs">West London Chamber of Commerce (WLCC)</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            
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
                    <p className="text-slate-500 mt-1">Hotel Banquet Suite, London, United Kingdom.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Registration Portal</h3>
              <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-[#333333]">
                Deadline: <strong className="text-white">31st May 2026</strong>
              </p>
              
              <button onClick={handleActionClick} className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 rounded-lg text-sm transition-colors mb-6">
                Register as Delegate
              </button>
              
              <div className="text-center text-xs text-slate-500">
                <p>Or mail your application to:</p>
                <a href="mailto:vishwaleaderbusiness@gmail.com" className="text-slate-300 hover:text-white font-medium flex items-center justify-center gap-1.5 mt-2">
                  <Mail className="w-3.5 h-3.5" /> vishwaleaderbusiness@gmail.com
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
