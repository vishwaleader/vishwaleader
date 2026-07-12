"use client";

import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { pdfDownloadsList, magazineCoversList, createSlug } from "./data";

export default function ArchivesPage() {

    return (
        <div className="min-h-screen bg-white font-sans pb-32">

            {/* Hero Section */}
            <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mt-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
                        The Document Archives
                    </h1>
                    <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
                        Access our complete repository of official circulars, academic abstracts, and a rich history of Vishwa Leader print magazines dating back over a decade. All documents are securely hosted and verified.
                    </p>
                </div>
            </div>

            {/* The Library (Shelves) */}
            <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">
                
                {/* Shelf 1: PDFs */}
                <section className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-slate-400" />
                                    Official Circulars & Conference Documents
                                </h2>
                                <p className="text-sm text-slate-500 pl-7">Verified PDF Downloads & Academic Forms</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{pdfDownloadsList.length} Resources Available</span>
                    </div>

                    <div className="relative pb-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 pt-8 px-4 place-items-center max-w-5xl mx-auto">
                            {pdfDownloadsList.map((pdf, idx) => (
                                <Link href={`/archives/${createSlug(pdf.title)}`} key={idx} className="flex flex-col items-center text-center space-y-4 group cursor-pointer">
                                    <div className="relative w-[220px] h-[310px] active:scale-95 transition-transform duration-150">
                                        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-brandDark to-slate-900 border border-slate-700/50 rounded-r-lg shadow-lg flex flex-col justify-between p-5 overflow-hidden">
                                            <div className="absolute top-0 left-0 w-4 h-full bg-black/30 border-r border-white/5 z-20"></div>
                                            <div className="self-end bg-brandBlue/90 backdrop-blur-sm border border-brandBlue/35 text-[9px] font-black text-white uppercase px-2 py-1 rounded tracking-widest z-10">PDF</div>
                                            <div className="pl-4 flex-grow flex items-center justify-center pt-2">
                                                <h4 className="font-display font-extrabold text-white text-sm leading-tight line-clamp-4 select-none">{pdf.title}</h4>
                                            </div>
                                            <div className="pl-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest z-10">
                                                <span>VL DOC</span>
                                                <span>{pdf.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-[240px] space-y-2 mt-4 text-center">
                                        <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-brandBlue transition-colors font-display">{pdf.title}</h4>
                                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide">{pdf.size} | PDF</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="h-3 w-full bg-slate-100 border-t border-slate-200 rounded-lg mt-4 shadow-inner">
                        </div>
                    </div>
                </section>

                {/* Shelf 2: Magazines */}
                <section className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-4">
                        <div className="flex items-center gap-4">
                            <img src="/assets/images/vishwaleader-logo-hd.png" alt="Legacy Vishwa Leader Logo" className="h-10 w-auto object-contain" style={{ maxWidth: '140px' }} />
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">Legacy Archive</h2>
                                <p className="text-sm text-slate-500">Our Historical Print Publications</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{magazineCoversList.length} Issues Archived</span>
                    </div>

                    <div className="relative pb-10">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 pt-6 px-4">
                            {magazineCoversList.map((cover, idx) => (
                                <Link href={`/archives/${createSlug(cover.title)}`} key={idx} className="flex flex-col items-center text-center space-y-4 group cursor-pointer">
                                    <div className="relative w-[110px] h-[160px] sm:w-[130px] sm:h-[190px] active:scale-95 transition-transform duration-150">
                                        <div className="relative w-full h-full bg-slate-900 border border-slate-800/80 rounded-md shadow-lg overflow-hidden">
                                            <img src={encodeURI(`/magazine-covers/${cover.src}`)} alt={cover.title} className="w-full h-full object-cover" loading="lazy" />
                                            <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-r from-black/45 to-transparent z-10"></div>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10"></div>
                                        </div>
                                    </div>
                                    <div className="w-[120px] sm:w-[140px] space-y-1">
                                        <h4 className="text-xs font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-brandBlue transition-colors font-display">{cover.title}</h4>
                                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">{cover.date} | Issue</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="h-3 w-full bg-slate-100 border-t border-slate-200 rounded-lg mt-4 shadow-inner">
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
}
