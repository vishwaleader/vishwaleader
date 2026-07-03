'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Mail, Award } from 'lucide-react';

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
      <div className="bg-brandBlue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6">
            <Award className="w-4 h-4 text-amber-400" />
            Applications Now Open
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Vishwa Leader Dr. B. R. Ambedkar International Awards 2026
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
            Honoring individuals and organizations making exceptional contributions to social justice, equality, and human rights.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-brandBlue"></i> About the Awards
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 text-justify">
                We are delighted to announce the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026, scheduled to be held in London. This prestigious global event aims to honour individuals and organizations making exceptional contributions to social justice, equality, human rights, education, economic empowerment, and community development, inspired by the timeless principles of Dr. B. R. Ambedkar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-trophy text-brandBlue"></i> Award Categories
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Social Justice Leadership",
                  "Education and Empowerment",
                  "Economic Development and Inclusion",
                  "Human Rights Advocacy",
                  "Innovative Community Service"
                ].map((category, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                    <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-semibold text-slate-800 mt-1">{category}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-users text-brandBlue"></i> Eligibility Criteria
              </h2>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-600 space-y-3">
                <p>Open to individuals, organizations, and institutions worldwide.</p>
                <p>Nominees must demonstrate significant impact aligned with Dr. Ambedkar's vision.</p>
                <p>Applications are welcome from academia, civil society, government, business, and private sectors.</p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandBlue to-indigo-500"></div>
              <h3 className="font-bold text-lg text-slate-800 mb-4">Event Details</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-600">
                  <Calendar className="w-5 h-5 text-brandBlue shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Date</p>
                    <p className="text-sm">20th September 2026</p>
                  </div>
                </li>
                <li className="flex gap-3 text-slate-600">
                  <MapPin className="w-5 h-5 text-brandBlue shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Venue</p>
                    <p className="text-sm">Greenwood Theatre, Guys Campus, King's College, London, United Kingdom.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
              <h3 className="font-bold text-lg mb-2">Registration Portal</h3>
              <p className="text-slate-300 text-sm mb-6">Deadline: <strong className="text-amber-400">31st May 2026</strong></p>
              
              <div className="space-y-3 mb-6 text-sm text-slate-300">
                <p className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> A detailed description of achievements</p>
                <p className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> Supporting documents</p>
                <p className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-400"></i> References or testimonials</p>
              </div>

              {loadingAuth ? (
                <div className="w-full py-3 bg-brandBlue/70 text-white text-center font-bold rounded-xl text-sm">
                  Checking Account...
                </div>
              ) : user ? (
                <button onClick={handleActionClick} className="block w-full py-3 bg-brandBlue hover:bg-blue-600 text-white text-center font-bold rounded-xl transition-colors mb-3 flex items-center justify-center gap-2 text-sm">
                  Go to Dashboard & Register <ExternalLink className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleActionClick} className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 text-center font-bold rounded-xl transition-colors mb-3 flex items-center justify-center gap-2 text-sm">
                  Login with Google to Register <ExternalLink className="w-4 h-4" />
                </button>
              )}
              
              <div className="text-center text-xs text-slate-400 border-t border-white/10 pt-4 mt-2">
                <p>Or email nomination to:</p>
                <a href="mailto:vishwaleaderawards@gmail.com" className="text-blue-300 hover:text-white font-semibold flex items-center justify-center gap-1 mt-1">
                  <Mail className="w-3 h-3" /> vishwaleaderawards@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <h3 className="font-bold text-xs text-brandBlue mb-3 uppercase tracking-widest">Delegation Registry Fee</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Base Ceremony Fee:</span>
                  <span className="font-semibold text-slate-700">₹5,000</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>18% GST:</span>
                  <span className="font-semibold text-slate-700">₹900</span>
                </div>
                <div className="border-t border-slate-150 pt-2 flex justify-between text-sm font-bold text-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-brandBlue font-mono text-base">₹5,900</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-normal">
                Note: Payable securely online via UPI, Cards, or Netbanking inside the Member Portal. International cards are supported (estimated in USD/GBP on checkout).
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
