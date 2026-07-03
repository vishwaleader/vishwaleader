'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft, BookOpen, MapPin, Calendar, Mail, FileText, ExternalLink, GraduationCap, CheckCircle2 } from 'lucide-react';

const subThemes = [
  "Social Justice and Human Rights",
  "Economic Inclusion and Sustainable Development",
  "Education as a Tool for Empowerment",
  "Constitutional Values and Global Governance",
  "Intersectionality in Social Movements",
  "Innovative Models for Inclusive Societies",
  "Ambedkar and Literature",
  "Democracy, Representation, and Political Empowerment",
  "Ambedkarite Art and Cultural Resistance Movements",
  "Ambedkar and National Security and International Relations"
];

export default function CallForPapersPage() {
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
      <div className="bg-brandBlue relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            International Academic Conference
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Call for Abstracts and Papers
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium mb-8">
            Submit your research for the International Conference at London.
          </p>
          
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-6 text-left max-w-3xl mx-auto shadow-2xl">
            <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-1 text-center">Conference Theme</p>
            <p className="text-white text-xl md:text-2xl font-serif text-center italic">
              "Reimagining Equality and Justice: Dr. B. R. Ambedkar's Vision in the 21st Century"
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="text-brandBlue w-6 h-6" /> Suggested Sub-Themes
              </h2>
              <p className="text-slate-600 mb-6 text-sm">
                Submissions may address, but are not limited to, the following themes:
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {subThemes.map((theme, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brandBlue shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-slate-700">{theme}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="text-brandBlue w-6 h-6" /> Submission Guidelines
              </h2>
              
              <div className="space-y-6">
                <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                  <h3 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-sm">Abstract Submission</h3>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                    <li><strong>Length:</strong> Up to 300 words</li>
                    <li><strong>Format:</strong> Title (Bold, Centered), Author(s) Name, Affiliation, Email ID, ORCID ID</li>
                    <li><strong>Keywords:</strong> 3–5</li>
                    <li><strong>Font:</strong> Times New Roman, 12 pt, 1.5 spacing</li>
                    <li><strong>File Type:</strong> Word Document (.doc/.docx)</li>
                  </ul>
                </div>

                <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                  <h3 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-sm">Full Paper Submission</h3>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                    <li><strong>Length:</strong> 3,000–5,000 words (including references)</li>
                    <li><strong>Structure:</strong> Title | Abstract | Introduction | Literature Review | Methodology | Results & Discussion | Conclusion | References (APA 7th Edition)</li>
                    <li><strong>Originality:</strong> Unpublished work only (Similarity Index ≤10%, including AI content)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandBlue to-indigo-500"></div>
              <h3 className="font-bold text-xl text-slate-800 mb-6">Conference Details</h3>
              
              <ul className="space-y-4 text-sm text-slate-600 mb-6">
                <li className="flex gap-3">
                  <Calendar className="w-5 h-5 text-brandBlue shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Date</p>
                    <p>18th September 2026</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin className="w-5 h-5 text-brandBlue shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Venue</p>
                    <p>Brunei Gallery Lecture Theatre, SOAS University of London, United Kingdom.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
              <h3 className="font-bold text-lg mb-4">Important Dates</h3>
              <div className="space-y-3 text-sm text-slate-300 mb-6">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Abstract Submission</span>
                  <span className="font-bold text-amber-400">31st May 2026</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Acceptance</span>
                  <span className="font-bold text-amber-400">15th June 2026</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span>Full Paper</span>
                  <span className="font-bold text-amber-400">15th July 2026</span>
                </div>
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
                <p>Email abstracts & papers to:</p>
                <a href="mailto:vishwaleaderconference@gmail.com" className="text-blue-300 hover:text-white font-semibold flex items-center justify-center gap-1 mt-1">
                  <Mail className="w-3 h-3" /> vishwaleaderconference@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
              <h3 className="font-bold text-xs text-brandBlue mb-3 uppercase tracking-widest">Delegation Registry Fee</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Base Conference Fee:</span>
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
