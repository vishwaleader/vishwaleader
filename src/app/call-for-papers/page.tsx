import React from 'react';
import Link from 'next/link';
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

              <a href="https://forms.gle/aWAEDNKLSbV6ms9eA" target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-brandBlue hover:bg-blue-600 text-white text-center font-bold rounded-xl transition-colors mb-3 flex items-center justify-center gap-2">
                Submit Registration Form <ExternalLink className="w-4 h-4" />
              </a>
              
              <div className="text-center text-xs text-slate-400 border-t border-white/10 pt-4 mt-2">
                <p>Email abstracts & papers to:</p>
                <a href="mailto:vishwaleaderconference@gmail.com" className="text-blue-300 hover:text-white font-semibold flex items-center justify-center gap-1 mt-1">
                  <Mail className="w-3 h-3" /> vishwaleaderconference@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
              <h3 className="font-bold text-sm text-slate-800 mb-3 uppercase tracking-widest text-brandBlue">Submission Fee</h3>
              <p className="text-2xl font-black text-slate-900 mb-4">₹ 5,000/-</p>
              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><span className="font-bold text-slate-800">Bank Name:</span> Union Bank of India</p>
                <p><span className="font-bold text-slate-800">A/c no:</span> 023811100002652</p>
                <p><span className="font-bold text-slate-800">IFSC Code:</span> UBIN0802387</p>
                <p><span className="font-bold text-slate-800">Company:</span> Vishwa Leader Techmedia Pvt. Ltd.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
