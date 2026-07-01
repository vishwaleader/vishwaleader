import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Image as ImageIcon, CreditCard, Send, Mail } from 'lucide-react';

const adRates = [
  { name: "Front Cover (Premium)", type: "Full Page", price: "₹5,00,000/-", color: "bg-amber-50 border-amber-200 text-amber-800" },
  { name: "Back Cover (Premium)", type: "Full Page", price: "₹2,00,000/-", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  { name: "Inside Front Cover", type: "Full Page", price: "₹1,50,000/-", color: "bg-blue-50 border-blue-200 text-blue-800" },
  { name: "Inside Back Cover", type: "Full Page", price: "₹1,50,000/-", color: "bg-blue-50 border-blue-200 text-blue-800" },
  { name: "Double Spread", type: "-", price: "₹1,00,000/-", color: "bg-slate-50 border-slate-200 text-slate-800" },
  { name: "Full Page", type: "Full Page", price: "₹50,000/-", color: "bg-slate-50 border-slate-200 text-slate-800" },
  { name: "Half Page", type: "-", price: "₹25,000/-", color: "bg-slate-50 border-slate-200 text-slate-800" },
  { name: "Quarter Page", type: "-", price: "₹15,000/-", color: "bg-slate-50 border-slate-200 text-slate-800" },
];

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
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
      <div className="bg-slate-900 relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6">
            <BookOpen className="w-4 h-4 text-brandBlue" />
            Official Souvenir 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Advertise With Us
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Place your advertisement in the Official Souvenir of the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content - Rates & Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ImageIcon className="text-brandBlue w-6 h-6" /> Advertisement Rates
              </h2>
              <p className="text-slate-600 mb-8 text-sm">
                The souvenir will be distributed to international delegates, diplomats, business leaders, academicians, cultural icons, media, and awardees during the 3-day global event in London. All advertisements will be printed in full color.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {adRates.map((ad, i) => (
                  <div key={i} className={`p-5 rounded-xl border ${ad.color} flex flex-col justify-between h-full`}>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wider mb-1 opacity-70">{ad.type}</p>
                      <h3 className="font-black text-xl mb-4 leading-tight">{ad.name}</h3>
                    </div>
                    <p className="text-2xl font-black">{ad.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Send className="text-brandBlue w-5 h-5" /> Submission Guidelines
              </h2>
              <ul className="space-y-3 text-sm text-slate-600 list-disc list-inside ml-2">
                <li>All artwork should be high resolution <strong>(300 DPI)</strong>.</li>
                <li><strong>A4 size</strong> for all full-page advertisements.</li>
                <li>Accepted formats: <strong>PDF, JPG, PNG, AI, CDR</strong>.</li>
                <li>Along with the ad file, please provide Company Logo (optional), Photograph (optional), and Message/Greeting Text.</li>
              </ul>
            </div>
          </div>

          {/* Sidebar - Application & Payment */}
          <div className="space-y-6">
            
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandBlue to-indigo-500"></div>
              <h3 className="font-bold text-lg mb-4">How to Book</h3>
              <p className="text-slate-300 text-sm mb-6">
                To book your advertisement space, please download the Souvenir Advertisement Form, fill in your organization details, and email it to us along with your payment receipt and advertisement artwork.
              </p>
              
              <div className="text-center text-sm text-slate-300">
                <p>Email all materials to:</p>
                <a href="mailto:vishwaleader.techmedia@gmail.com" className="text-brandBlue hover:text-white font-bold flex items-center justify-center gap-2 mt-2 bg-white/5 py-3 rounded-xl border border-white/10 transition-colors">
                  <Mail className="w-4 h-4" /> vishwaleader.techmedia@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" /> Bank Details
              </h3>
              <p className="text-xs text-slate-500 mb-4">Payment Modes: Bank Transfer, UPI, Credit/Debit Card.</p>
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><span className="font-bold text-slate-800">Bank Name:</span> Union Bank of India</p>
                <p><span className="font-bold text-slate-800">A/c no:</span> 023811100002652</p>
                <p><span className="font-bold text-slate-800">IFSC Code:</span> UBIN0802387</p>
                <p><span className="font-bold text-slate-800">Branch:</span> Damodar Park, Ghatkopar West</p>
                <p><span className="font-bold text-slate-800">Company:</span> M/s. VISHWA LEADER TECHMEDIA PRIVATE LIMITED</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
