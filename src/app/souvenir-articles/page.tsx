"use client";

import { useState, useEffect } from 'react';
import { PenTool, FileText, Check, Image as ImageIcon, Send, Download, ExternalLink } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import EventRegistrationCTA from '@/components/EventRegistrationCTA';

const themes = ["Social Justice", "Equality", "Fraternity", "Democracy", "Education", "Empowerment", "Global Citizenship"];

export default function SouvenirArticlesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', bio: '', photoUrl: '', theme: '' });

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const q = query(collection(db, 'souvenir_submissions'), where('userId', '==', u.uid));
        const snap = await getDocs(q);
        if (!snap.empty) setSubmitted(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'souvenir_submissions'), {
        ...form, userId: user.uid, userName: user.displayName, userEmail: user.email,
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
        <div className="bg-brandBlue relative overflow-hidden min-h-screen flex flex-col items-center justify-between -mt-16 md:-mt-20 pt-28 md:pt-36 pb-8 mb-16 text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 my-auto">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-sm">
              <PenTool className="w-4 h-4 text-amber-400" /> Official Souvenir 2026
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight font-display">Souvenir Articles</h1>
            <p className="text-blue-100 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-normal">Contribute an original article inspired by Dr. B. R. Ambedkar&apos;s vision, to be published in the Official Souvenir.</p>
          </div>
          <div className="relative z-10 pt-4 flex flex-col items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-widest animate-bounce">
            <span>Scroll Down to Explore</span>
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">

          <div className="md:col-span-2 space-y-8">

            {/* About */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2"><PenTool className="w-5 h-5 text-slate-400" /> Article Contributions</h2>
              <div className="text-slate-600 text-sm leading-relaxed text-justify space-y-4 mb-8">
                <p>We are publishing an Exclusive Commemorative Souvenir, officially released during the event and distributed to all international delegates, VIPs, award recipients, sponsors, partner institutions, and invited guests.</p>
                <p>We cordially invite original, unpublished articles inspired by the vision of Dr. B. R. Ambedkar. Selected articles will be professionally edited and published in the souvenir — an internationally circulated archival document of this global event.</p>
              </div>
              <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-widest">Themes of Focus</h3>
              <div className="flex flex-wrap gap-2">
                {themes.map((t, i) => <span key={i} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-xs font-medium border border-slate-200">{t}</span>)}
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400" /> Submission Guidelines</h2>
              <ul className="space-y-6 text-sm text-slate-600">
                <li className="flex items-start gap-4"><Check className="w-5 h-5 text-slate-900 shrink-0" /><div><strong className="text-slate-900 block mb-0.5">Language</strong>English only</div></li>
                <li className="flex items-start gap-4"><Check className="w-5 h-5 text-slate-900 shrink-0" /><div><strong className="text-slate-900 block mb-0.5">Word Limit</strong>800–1,200 words</div></li>
                <li className="flex items-start gap-4"><Check className="w-5 h-5 text-slate-900 shrink-0" /><div><strong className="text-slate-900 block mb-0.5">Format</strong>MS Word or compatible (.doc / .docx)</div></li>
                <li className="flex items-start gap-4"><ImageIcon className="w-5 h-5 text-slate-900 shrink-0" /><div><strong className="text-slate-900 block mb-0.5">Author Profile</strong>Include a short 50–70 word biography and a high-resolution photograph (Google Drive link).</div></li>
              </ul>
            </div>

            {/* Online Submission Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2"><Send className="w-5 h-5 text-slate-400" /> Online Article Submission</h2>
              <p className="text-slate-500 text-sm mb-6">Sign in and submit your article directly. No email needed.</p>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Article Submitted!</h3>
                  <p className="text-slate-500 text-sm">Our editorial team will reach out to <strong>{user?.email}</strong> with feedback and publishing confirmation.</p>
                </div>
              ) : !user ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 text-sm mb-4">Please sign in to access the submission form.</p>
                  <EventRegistrationCTA itemId="__login_only__" price="" label="Sign In to Submit Article" paidLabel="Already Submitted" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Article Title *</label>
                      <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="Enter your article title" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Theme *</label>
                      <select required value={form.theme} onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50">
                        <option value="">Select a theme</option>
                        {themes.map((t, i) => <option key={i}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Article Content (800–1,200 words) *</label>
                    <textarea required rows={8} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50 resize-none" placeholder="Paste or type your article here…" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Author Bio (50–70 words) *</label>
                    <textarea required rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50 resize-none" placeholder="Short biography about yourself…" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Author Photo — Google Drive Link <span className="text-slate-400 normal-case font-normal">(shareable link)</span></label>
                    <input type="url" value={form.photoUrl} onChange={e => setForm(p => ({ ...p, photoUrl: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="https://drive.google.com/file/..." />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full bg-brandBlue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-900/20">
                    {submitting ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</> : <><Send className="w-4 h-4" /> Submit Article</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Official Invitation</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">Download the official souvenir call for articles and publication guidelines brochure.</p>
              <div className="space-y-2">
                <a 
                  href="/pdfs/souvenir-invitation.pdf" 
                  download="Souvenir-Invitation-Brochure-2026.pdf"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brandBlue text-white font-bold rounded-xl shadow hover:bg-blue-700 transition-all text-xs"
                >
                  <Download className="w-4 h-4" /> Download Brochure (PDF)
                </a>
                <a 
                  href="/pdfs/souvenir-invitation.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-all text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview in Browser
                </a>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 shadow-2xl">
              <div className="mb-2"><span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-1 rounded">Souvenir Publication</span></div>
              <h3 className="text-lg font-bold text-white mt-3 mb-1">Submit Your Article</h3>
              <p className="text-slate-400 text-xs mb-6 pb-6 border-b border-white/10">Login required. Submission is free for all registered conference or souvenir participants.</p>
              <EventRegistrationCTA itemId="reg_souvenir" price="₹6,136" label="Register & Submit" paidLabel="✅ Souvenir Registration Active" dark />
              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-600">Secured by</p>
                <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain mx-auto opacity-40 invert" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
