import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, PenTool, CheckCircle2, Image as ImageIcon, Send, FileText } from 'lucide-react';

export default function SouvenirArticlesPage() {
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
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Exclusive Commemorative Souvenir
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Public Invitation for Articles
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Publish your writings in the Official Souvenir for the Vishwa Leader Dr. B. R. Ambedkar International Awards 2026.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PenTool className="text-brandBlue w-6 h-6" /> Article Contributions
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-justify">
                On this historic occasion, we are publishing an Exclusive Commemorative Souvenir, which will be officially released during the event and printed and distributed to all international delegates, VIPs, award recipients, sponsors, partner institutions, and invited guests.
              </p>
              <p className="text-slate-600 mb-6 leading-relaxed text-justify">
                We cordially invite original, unpublished articles inspired by the vision of Dr. B. R. Ambedkar. All selected articles will be professionally edited and published in the souvenir, which will serve as an internationally circulated archival document of this global event.
              </p>
              
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
                <h3 className="font-bold text-indigo-900 mb-3 text-sm uppercase tracking-wider">Themes of Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {["Social Justice", "Equality", "Fraternity", "Democracy", "Education", "Empowerment", "Global Citizenship"].map((theme, i) => (
                    <span key={i} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="text-brandBlue w-5 h-5" /> Submission Guidelines
              </h2>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Language</strong>
                    English only
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Word Limit</strong>
                    800–1,200 words
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Format</strong>
                    MS Word or compatible digital format (.doc / .docx)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="text-slate-800 block">Author Profile</strong>
                    Include a short 50–70 word biography along with a high-resolution photograph of the author.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandBlue to-indigo-500"></div>
              <h3 className="font-bold text-lg mb-4">How to Submit</h3>
              <p className="text-slate-300 text-sm mb-6">
                Please review the guidelines carefully to ensure your article is formatted correctly before submission.
              </p>
              
              <div className="text-center text-sm text-slate-300">
                <p>Email your article and photo to:</p>
                <a href="mailto:vishwaleader.techmedia@gmail.com" className="text-indigo-300 hover:text-white font-bold flex items-center justify-center gap-2 mt-2 bg-white/5 py-3 rounded-xl border border-white/10 transition-colors">
                  <Send className="w-4 h-4" /> Email Us
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
