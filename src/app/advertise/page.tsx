"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Image as ImageIcon, Send, Check } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import EventRegistrationCTA from '@/components/EventRegistrationCTA';

const adRates = [
  { id: "ad_front_cover", name: "Front Cover (Premium)", type: "Full Page", price: "₹5,00,000", itemId: "ad_front_cover", color: "bg-[#111111] border-[#222222] text-white", labelColor: "text-slate-400", dark: true },
  { id: "ad_back_cover", name: "Back Cover (Premium)", type: "Full Page", price: "₹2,00,000", itemId: "ad_back_cover", color: "bg-slate-900 border-slate-800 text-white", labelColor: "text-slate-400", dark: true },
  { id: "ad_inside_cover", name: "Inside Front Cover", type: "Full Page", price: "₹1,50,000", itemId: "ad_inside_cover", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400", dark: false },
  { id: "ad_double_spread", name: "Double Spread", type: "Double Page", price: "₹1,00,000", itemId: "ad_double_spread", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400", dark: false },
  { id: "ad_full_page", name: "Full Page", type: "Full Page", price: "₹50,000", itemId: "ad_full_page", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400", dark: false },
  { id: "ad_half_page", name: "Half Page", type: "Half Page", price: "₹25,000", itemId: "ad_half_page", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400", dark: false },
  { id: "ad_quarter_page", name: "Quarter Page", type: "Quarter Page", price: "₹15,000", itemId: "ad_quarter_page", color: "bg-white border-slate-200 text-slate-900", labelColor: "text-slate-400", dark: false },
];

export default function AdvertisePage() {
  const [user, setUser] = useState<User | null>(null);
  const [paidSlot, setPaidSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ company: '', contact: '', message: '', artworkUrl: '', logoUrl: '' });

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDocs(query(collection(db, 'ad_submissions'), where('userId', '==', u.uid)));
        if (!snap.empty) setSubmitted(true);
      }
    });
  }, []);

  const handleArtworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !paidSlot) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'ad_submissions'), {
        ...form, adSlot: paidSlot, userId: user.uid, userName: user.displayName, userEmail: user.email,
        status: 'pending_review', createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) { console.error(err); alert('Submission failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      <main className="pb-16 md:pb-20">

        {/* Hero */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-sm">
              <BookOpen className="w-4 h-4 text-amber-400" /> Official Souvenir 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">Advertise With Us</h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              Place your advertisement in the Official Souvenir of the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026. Book and pay entirely online.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">

          <div className="md:col-span-2 space-y-8">

            {/* Ad Rates */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-slate-400" /> Advertisement Rates
              </h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                The souvenir will be distributed to international delegates, diplomats, business leaders, academicians, media, and awardees. Select your slot and book instantly online.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {adRates.map((ad) => (
                  <div key={ad.id} className={`p-6 rounded-xl border ${ad.color} flex flex-col justify-between h-full shadow-sm`}>
                    <div>
                      <p className={`font-semibold text-xs uppercase tracking-wider mb-2 ${ad.labelColor}`}>{ad.type}</p>
                      <h3 className="font-semibold text-lg mb-4">{ad.name}</h3>
                      <p className="text-2xl font-bold tracking-tight mb-6">{ad.price}</p>
                    </div>
                    <EventRegistrationCTA
                      itemId={ad.itemId}
                      price={ad.price}
                      label="Book This Slot"
                      paidLabel="✅ Slot Booked"
                      dark={ad.dark}
                      onPaymentSuccess={() => setPaidSlot(ad.itemId)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Artwork Submission Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-slate-400" /> Submit Your Artwork
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                After booking your ad slot, submit your artwork details below. No email required — everything is handled online.
              </p>

              {!user ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 text-sm mb-4">Please sign in and book an ad slot first.</p>
                  <EventRegistrationCTA itemId="__login_only__" price="" label="Sign In to Continue" paidLabel="Signed In" />
                </div>
              ) : submitted ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Artwork Submitted!</h3>
                  <p className="text-slate-500 text-sm">Our design team will review your artwork and reach you at <strong>{user?.email}</strong>.</p>
                </div>
              ) : !paidSlot ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                  <p className="text-amber-800 text-sm font-semibold">⚠️ Please book an advertisement slot above to unlock this form.</p>
                </div>
              ) : (
                <form onSubmit={handleArtworkSubmit} className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 font-medium">
                    ✅ Slot booked! Now submit your artwork details below.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Company / Organization Name *</label>
                    <input required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="Your company name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Contact Person & Phone *</label>
                    <input required value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="Name, +91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Artwork File — Google Drive Link * <span className="text-slate-400 font-normal normal-case">(300 DPI, PDF/JPG/PNG/AI)</span></label>
                    <input required type="url" value={form.artworkUrl} onChange={e => setForm(p => ({ ...p, artworkUrl: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="https://drive.google.com/file/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Company Logo — Google Drive Link <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
                    <input type="url" value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="https://drive.google.com/file/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Greeting / Message Text <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
                    <textarea rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50 resize-none" placeholder="Any special message or greeting to appear alongside your ad…" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full bg-brandBlue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-900/20">
                    {submitting ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</> : <><Send className="w-4 h-4" /> Submit Artwork</>}
                  </button>
                </form>
              )}
            </div>

            {/* Submission Guidelines */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-slate-400" /> Artwork Specifications</h2>
              <ul className="space-y-4 text-sm text-slate-600">
                {["All artwork must be high resolution (300 DPI).","A4 size for all full-page advertisements.","Accepted formats: PDF, JPG, PNG, AI, CDR.","Include Company Logo, Photograph, and Message/Greeting Text.","Share via Google Drive with a shareable (anyone with link) permission."].map((s, i) => (
                  <li key={i} className="flex items-start gap-3"><Check className="w-4 h-4 text-brandBlue mt-0.5 shrink-0" /><span>{s}</span></li>
                ))}
              </ul>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 shadow-2xl">
              <div className="mb-2"><span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-1 rounded">100% Online</span></div>
              <h3 className="text-lg font-bold text-white mt-3 mb-3">How It Works</h3>
              <ol className="space-y-4 text-sm text-slate-400">
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-brandBlue/20 text-brandBlue flex items-center justify-center text-xs font-bold shrink-0">1</span><span>Sign in with your Google account.</span></li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-brandBlue/20 text-brandBlue flex items-center justify-center text-xs font-bold shrink-0">2</span><span>Select your ad slot and pay online via Razorpay (Cards, UPI, Net Banking).</span></li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-brandBlue/20 text-brandBlue flex items-center justify-center text-xs font-bold shrink-0">3</span><span>Upload your artwork via Google Drive link in the form.</span></li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">✓</span><span className="text-emerald-400 font-medium">Done! Our team confirms via email.</span></li>
              </ol>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-[10px] text-slate-600">Secured by</p>
                <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain mx-auto mt-1 opacity-40 invert" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
