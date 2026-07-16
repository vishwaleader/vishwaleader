"use client";

import { useState, useEffect } from 'react';
import { BookOpen, FileText, Check, Calendar, MapPin, Send } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import EventRegistrationCTA from '@/components/EventRegistrationCTA';

const subThemes = [
  "Ambedkar and Constitutional Democracy","Human Rights and Social Justice",
  "Caste, Race, and Intersectionality","Economic Inclusion and Development",
  "Diaspora Mobilization and Advocacy","Education and Empowerment",
  "Gender Justice and Dalit Women","Religion, Ethics, and Philosophy",
  "Ambedkar and Literature","Democracy, Representation, and Political Empowerment",
  "Ambedkarite Art and Cultural Resistance","Ambedkar and International Relations"
];

export default function CallForPapersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', abstract: '', author: '', affiliation: '', email: '', orcid: '', keywords: '', subTheme: '', type: 'Abstract' });

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const q = query(collection(db, 'submissions'), where('userId', '==', u.uid));
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
      await addDoc(collection(db, 'submissions'), {
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
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">Call for Papers</h1>
            <p className="text-blue-100 text-base md:text-lg mb-10 max-w-2xl mx-auto">Submit your research for the International Conference in London.</p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-sm max-w-3xl mx-auto">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Conference Theme</p>
              <p className="text-lg md:text-xl font-serif text-white italic">&quot;Reimagining Equality and Justice: Dr. B. R. Ambedkar&apos;s Vision in the 21st Century&quot;</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">

          <div className="md:col-span-2 space-y-8">

            {/* Sub-Themes */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-slate-400" /> Suggested Sub-Themes</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {subThemes.map((t, i) => <div key={i} className="flex items-start gap-3"><Check className="w-4 h-4 text-brandBlue mt-0.5 shrink-0" /><span className="text-sm text-slate-600">{t}</span></div>)}
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-400" /> Submission Guidelines</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Abstract Submission</h3>
                  <ul className="space-y-2 text-sm text-slate-500 list-disc list-inside">
                    <li><strong className="text-slate-700 font-medium">Length:</strong> Up to 300 words</li>
                    <li><strong className="text-slate-700 font-medium">Format:</strong> Title, Author(s), Affiliation, Email, ORCID ID</li>
                    <li><strong className="text-slate-700 font-medium">Keywords:</strong> 3–5</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Full Paper Submission</h3>
                  <ul className="space-y-2 text-sm text-slate-500 list-disc list-inside">
                    <li><strong className="text-slate-700 font-medium">Length:</strong> 3,000–5,000 words</li>
                    <li><strong className="text-slate-700 font-medium">Structure:</strong> Title | Abstract | Introduction | Methodology | Results | Conclusion | References</li>
                    <li><strong className="text-slate-700 font-medium">Originality:</strong> Unpublished only (Similarity ≤10%)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Venue Map */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-400" /> Conference Venue</h2>
                <p className="text-slate-500 text-sm mt-1">Brunei Gallery Lecture Theatre, SOAS University of London</p>
              </div>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY}&q=SOAS+University+of+London,Brunei+Gallery&zoom=16&maptype=satellite`}
                width="100%" height="280" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Conference Venue — SOAS University of London"
              />
            </div>

            {/* Online Submission Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 flex items-center gap-2"><Send className="w-5 h-5 text-slate-400" /> Online Submission Portal</h2>
              <p className="text-slate-500 text-sm mb-6">Sign in with Google to submit your abstract or full paper directly. No email required.</p>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Submission Received!</h3>
                  <p className="text-slate-500 text-sm">Our review committee will contact you at <strong>{user?.email}</strong> within 15 days.</p>
                </div>
              ) : !user ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 text-sm mb-4">Please sign in to access the submission form.</p>
                  <EventRegistrationCTA itemId="__login_only__" price="" label="Sign In to Submit Paper" paidLabel="Already Submitted" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Submission Type *</label>
                      <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue focus:border-transparent bg-slate-50">
                        <option>Abstract</option><option>Full Paper</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Sub-Theme *</label>
                      <select required value={form.subTheme} onChange={e => setForm(p => ({ ...p, subTheme: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50">
                        <option value="">Select a sub-theme</option>
                        {subThemes.map((t, i) => <option key={i}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Paper Title *</label>
                    <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="Enter your paper title" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Abstract (max 300 words) *</label>
                    <textarea required rows={5} value={form.abstract} onChange={e => setForm(p => ({ ...p, abstract: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50 resize-none" placeholder="Paste your abstract here…" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Author Name *</label>
                      <input required value={form.author || user?.displayName || ''} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Affiliation *</label>
                      <input required value={form.affiliation} onChange={e => setForm(p => ({ ...p, affiliation: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="University / Organization" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email *</label>
                      <input required type="email" value={form.email || user?.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">ORCID ID <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                      <input value={form.orcid} onChange={e => setForm(p => ({ ...p, orcid: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="0000-0000-0000-0000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Keywords (3–5, comma separated) *</label>
                    <input required value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue bg-slate-50" placeholder="e.g. social justice, equality, Ambedkar" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full bg-brandBlue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-blue-900/20">
                    {submitting ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</> : <><Send className="w-4 h-4" /> Submit Paper</>}
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Conference Details</h3>
              <ul className="space-y-5 text-sm">
                <li className="flex gap-4 items-start"><Calendar className="w-5 h-5 text-slate-400 shrink-0" /><div><p className="font-semibold text-slate-900">Date</p><p className="text-slate-500 mt-1">18th September 2026</p></div></li>
                <li className="flex gap-4 items-start"><MapPin className="w-5 h-5 text-slate-400 shrink-0" /><div><p className="font-semibold text-slate-900">Venue</p><p className="text-slate-500 mt-1">Brunei Gallery Lecture Theatre, SOAS University of London</p></div></li>
              </ul>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Important Dates</h3>
              <div className="space-y-4 text-sm text-slate-400 mb-8 pb-8 border-b border-white/10">
                <div className="flex justify-between"><span>Abstract Submission</span><span className="font-bold text-white">31st May 2026</span></div>
                <div className="flex justify-between"><span>Acceptance</span><span className="font-bold text-white">15th June 2026</span></div>
                <div className="flex justify-between"><span>Full Paper</span><span className="font-bold text-white">15th July 2026</span></div>
              </div>
              <p className="text-slate-500 text-xs mb-4">Sign in to submit your paper directly online. No email required.</p>
              <EventRegistrationCTA itemId="reg_conference" price="₹5,900" label="Register & Submit" paidLabel="✅ Conference Registration Active" dark />
              <div className="mt-4 text-center">
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
