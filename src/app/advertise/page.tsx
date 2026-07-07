import React from 'react';
import Link from 'next/link';
import { BookOpen, Image as ImageIcon, CreditCard, Mail, Send, Check } from 'lucide-react';

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

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-7 w-auto object-contain" />
            <span translate="no" className="notranslate font-sans font-bold tracking-tight text-sm text-slate-900">Vishwa Leader</span>
          </a>
          <div className="flex gap-6 text-sm font-medium text-slate-500 hidden md:flex">
            <a href="/" className="hover:text-slate-900 transition-colors">Home</a>
          </div>
        </div>
      </header>

      <main className="pb-16 md:pb-20">
        
        {/* Hero Section */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-sm">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Official Souvenir 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
              Advertise With Us
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              Place your advertisement in the Official Souvenir of the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026.
            </p>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          
          {/* Main Content - Rates & Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl p-8">
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

            <div className="bg-white border border-slate-200 rounded-xl p-8">
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
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0"></span>
                  <span>Along with the ad file, please provide Company Logo, Photograph, and Message/Greeting Text.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar - Application & Payment */}
          <div className="space-y-8">
            
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 shadow-xl">
              <h3 className="font-semibold text-lg text-white mb-4">How to Book</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                To book your advertisement space, please download the Souvenir Advertisement Form, fill in your organization details, and email it to us along with your payment receipt and advertisement artwork.
              </p>
              
              <a href="mailto:vishwaleader.techmedia@gmail.com" className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 rounded-lg text-sm transition-colors">
                <Mail className="w-4 h-4" /> vishwaleader.techmedia@gmail.com
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="font-semibold text-lg text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-400" /> Bank Details
              </h3>
              <p className="text-xs text-slate-500 mb-4">Payment Modes: Bank Transfer, UPI, Credit/Debit Card.</p>
              
              <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <p><span className="font-semibold text-slate-900 block mb-0.5">Bank Name</span> Union Bank of India</p>
                <p><span className="font-semibold text-slate-900 block mb-0.5">A/c no</span> 023811100002652</p>
                <p><span className="font-semibold text-slate-900 block mb-0.5">IFSC Code</span> UBIN0802387</p>
                <p><span className="font-semibold text-slate-900 block mb-0.5">Branch</span> Damodar Park, Ghatkopar West</p>
                <p><span className="font-semibold text-slate-900 block mb-0.5">Company</span> M/s. <span translate="no" className="notranslate">VISHWA LEADER</span> TECHMEDIA PVT LTD</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
