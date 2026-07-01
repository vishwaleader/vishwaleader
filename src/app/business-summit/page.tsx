import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Mail, Briefcase, Users, Handshake } from 'lucide-react';

export default function BusinessSummitPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar Minimal */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brandBlue flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <img src="/assets/images/vishwaleader-logo-hd.png" alt="VishwaLeader" className="h-8 object-contain" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Call for Participation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            International Business Summit at London
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-8">
            On the Eve of the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026
          </p>
          
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-6 text-left max-w-3xl mx-auto shadow-2xl">
            <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-1 text-center">Summit Theme</p>
            <p className="text-white text-xl md:text-2xl font-serif text-center italic">
              "Business as a Driver of Social Change: Realizing Dr. Ambedkar's Vision in Today's Economy"
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-earth-americas text-brandBlue"></i> About the Summit
              </h2>
              <div className="text-slate-600 leading-relaxed space-y-4 text-justify">
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
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Handshake className="text-brandBlue w-6 h-6" /> In Association With
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">Global Bahujan Business Council (GBBC)</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">Dr. Ambedkar Chamber of Commerce (DACC)</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">WLCC (West London Chamber of Commerce)</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <h3 className="font-bold text-lg text-slate-800 mb-4">Summit Details</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-600">
                  <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Date</p>
                    <p className="text-sm">19th September 2026</p>
                  </div>
                </li>
                <li className="flex gap-3 text-slate-600">
                  <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Venue</p>
                    <p className="text-sm">Hotel Banquet Suite, London, United Kingdom.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
              <h3 className="font-bold text-lg mb-2">Application Guidelines</h3>
              <p className="text-slate-300 text-sm mb-6">Deadline: <strong className="text-emerald-400">31st May 2026</strong></p>
              
              <p className="text-sm text-slate-300 mb-4">
                It is mandatory for all delegates to fill and submit the Google form below.
              </p>

              <a href="https://forms.gle/uuSAD1sqUiLCkjeg6" target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-center font-bold rounded-xl transition-colors mb-3 flex items-center justify-center gap-2">
                Submit Google Form <ExternalLink className="w-4 h-4" />
              </a>
              
              <div className="text-center text-xs text-slate-400">
                <p>Or mail your application to:</p>
                <a href="mailto:vishwaleaderbusiness@gmail.com" className="text-emerald-300 hover:text-white font-semibold flex items-center justify-center gap-1 mt-1">
                  <Mail className="w-3 h-3" /> vishwaleaderbusiness@gmail.com
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
