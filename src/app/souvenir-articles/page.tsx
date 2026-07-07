import React from 'react';
import Link from 'next/link';
import { BookOpen, PenTool, Check, Image as ImageIcon, Mail, FileText } from 'lucide-react';

export default function SouvenirArticlesPage() {
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
              Exclusive Commemorative Souvenir
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
              Public Invitation for Articles
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              Publish your writings in the Official Souvenir for the <span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026.
            </p>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start px-6 max-w-7xl mx-auto">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-2 space-y-8">
            
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-slate-400" /> Article Contributions
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed text-justify space-y-4 mb-8">
                <p>
                  On this historic occasion, we are publishing an Exclusive Commemorative Souvenir, which will be officially released during the event and printed and distributed to all international delegates, VIPs, award recipients, sponsors, partner institutions, and invited guests.
                </p>
                <p>
                  We cordially invite original, unpublished articles inspired by the vision of Dr. B. R. Ambedkar. All selected articles will be professionally edited and published in the souvenir, which will serve as an internationally circulated archival document of this global event.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-widest">Themes of Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {["Social Justice", "Equality", "Fraternity", "Democracy", "Education", "Empowerment", "Global Citizenship"].map((theme, i) => (
                    <span key={i} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-xs font-medium border border-slate-200">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" /> Submission Guidelines
              </h2>
              <ul className="space-y-6 text-sm text-slate-600">
                <li className="flex items-start gap-4">
                  <Check className="w-5 h-5 text-slate-900 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Language</strong>
                    English only
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-5 h-5 text-slate-900 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Word Limit</strong>
                    800–1,200 words
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Check className="w-5 h-5 text-slate-900 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Format</strong>
                    MS Word or compatible digital format (.doc / .docx)
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <ImageIcon className="w-5 h-5 text-slate-900 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Author Profile</strong>
                    Include a short 50–70 word biography along with a high-resolution photograph of the author.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">How to Submit</h3>
              <p className="text-slate-400 text-sm mb-8">
                Please review the guidelines carefully to ensure your article is formatted correctly before submission.
              </p>
              
              <a href="mailto:vishwaleader.techmedia@gmail.com" className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 rounded-lg text-sm transition-colors">
                <Mail className="w-4 h-4" /> Email Us
              </a>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
