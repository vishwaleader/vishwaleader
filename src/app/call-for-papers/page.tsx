"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Check, Calendar, MapPin, Mail, BookOpen, FileText } from 'lucide-react';
import Preloader from '@/components/Preloader';

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
              Call for Papers
            </h1>
            <p className="text-blue-100 text-base md:text-lg mb-10 max-w-2xl mx-auto">
              Submit your research for the International Conference in London.
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-sm max-w-3xl mx-auto">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Conference Theme</p>
              <p className="text-lg md:text-xl font-serif text-white italic">
                "Reimagining Equality and Justice: Dr. B. R. Ambedkar's Vision in the 21st Century"
              </p>
            </div>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Sub-Themes */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-400" /> Suggested Sub-Themes
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {subThemes.map((theme, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-slate-900 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600">{theme}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Guidelines */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" /> Submission Guidelines
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Abstract Submission</h3>
                  <ul className="space-y-2 text-sm text-slate-500 list-disc list-inside">
                    <li><strong className="text-slate-700 font-medium">Length:</strong> Up to 300 words</li>
                    <li><strong className="text-slate-700 font-medium">Format:</strong> Title (Bold, Centered), Author(s) Name, Affiliation, Email ID, ORCID ID</li>
                    <li><strong className="text-slate-700 font-medium">Keywords:</strong> 3–5</li>
                    <li><strong className="text-slate-700 font-medium">File Type:</strong> Word Document (.doc/.docx)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Full Paper Submission</h3>
                  <ul className="space-y-2 text-sm text-slate-500 list-disc list-inside">
                    <li><strong className="text-slate-700 font-medium">Length:</strong> 3,000–5,000 words (including references)</li>
                    <li><strong className="text-slate-700 font-medium">Structure:</strong> Title | Abstract | Introduction | Literature Review | Methodology | Results & Discussion | Conclusion | References</li>
                    <li><strong className="text-slate-700 font-medium">Originality:</strong> Unpublished work only (Similarity Index ≤10%)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            
            {/* Conference Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Conference Details</h3>
              <ul className="space-y-5 text-sm">
                <li className="flex gap-4 items-start">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Date</p>
                    <p className="text-slate-500 mt-1">18th September 2026</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Venue</p>
                    <p className="text-slate-500 mt-1">Brunei Gallery Lecture Theatre, SOAS University of London</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Premium Dark CTA Card */}
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-6">Important Dates</h3>
              <div className="space-y-4 text-sm text-slate-400 mb-8 pb-8 border-b border-[#333333]">
                <div className="flex justify-between">
                  <span>Abstract Submission</span>
                  <span className="font-semibold text-white">31st May 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Acceptance</span>
                  <span className="font-semibold text-white">15th June 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Full Paper</span>
                  <span className="font-semibold text-white">15th July 2026</span>
                </div>
              </div>

              <button onClick={handleActionClick} className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 rounded-lg text-sm transition-colors mb-6">
                Register & Submit Paper
              </button>
              
              <div className="text-center text-xs text-slate-500">
                <p>Email abstracts & papers to:</p>
                <a href="mailto:vishwaleaderconference@gmail.com" className="text-slate-300 hover:text-white font-medium flex items-center justify-center gap-1.5 mt-2">
                  <Mail className="w-3.5 h-3.5" /> vishwaleaderconference@gmail.com
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
