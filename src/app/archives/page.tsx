"use client";

import React, { useState } from "react";
import Link from "next/link";

const pdfDownloadsList = [
    { file: 'awards-circular-2026.pdf', title: 'Dr. Ambedkar International Awards May 2026 Circular', desc: 'Official circular detailing the 2026 awards ceremony, schedule, and delegation instructions.', size: '5.1 MB' },
    { file: 'nomination-form-2026.pdf', title: 'Application for Award Nominations', desc: 'Official form to nominate candidates for the Dr. B. R. Ambedkar International Awards in London.', size: '4.7 MB' },
    { file: 'business-prospectus-2026.pdf', title: 'International Business Summit Prospectus', desc: 'Sponsorship levels, business table structures, and executive networking pathways.', size: '1.4 MB' },
    { file: 'soas-call-for-papers.pdf', title: 'SOAS Conference Call for Abstracts & Papers', desc: 'Themes, submission formats, and academic panel details for the SOAS University conference.', size: '3.0 MB' },
    { file: 'event-brochure.pdf', title: 'Vishwa Leader Corporate Event Brochure', desc: 'Detailed corporate credentials, organizational goals, and previous social action projects.', size: '3.3 MB' },
    { file: 'souvenir-invitation.pdf', title: 'Public Invitation for Souvenir Articles', desc: 'Open invitation for write-ups, scholarly papers, and advertisement bookings.', size: '970 KB' },
    { file: 'advertisement-booking-form.pdf', title: 'Souvenir Print Advertisement Booking Form', desc: 'Pricing layout, print sizes, and booking terms for the commemorative London Summit publication.', size: '1.7 MB' },
    { file: 'london-itinerary.pdf', title: 'Official London Tour & Seminar Itinerary', desc: 'Official schedule, hotel, academic events, and sightseeing plan for all registered delegates.', size: '4.7 MB' },
    { file: 'summit-poster.pdf', title: 'Dr. Ambedkar London Summit Event Poster', desc: 'High-resolution promotional event poster with venue details and dates.', size: '238 KB' }
];

const magazineCoversList = [
  { src: '1001702539.jpg', title: '1001702539', date: '1001702539' },
  { src: '1001702550.jpg', title: '1001702550', date: '1001702550' },
  { src: '1001702555.jpg', title: '1001702555', date: '1001702555' },
  { src: 'APRIL-2013.jpg', title: 'APRIL 2013', date: 'APRIL 2013' },
  { src: 'April  2011 Cover.jpg', title: 'April  2011 Cover', date: 'April  2011 Cover' },
  { src: 'April  Issue Cover 10.jpg', title: 'April  Issue Cover 10', date: 'April  Issue Cover 10' },
  { src: 'April-2012.png', title: 'April 2012', date: 'April 2012' },
  { src: 'Augst  2011 Cover.jpg', title: 'Augst  2011 Cover', date: 'Augst  2011 Cover' },
  { src: 'Augst Issue Cover 10.jpg', title: 'Augst Issue Cover 10', date: 'Augst Issue Cover 10' },
  { src: 'Augst-2012.png', title: 'Augst 2012', date: 'Augst 2012' },
  { src: 'Dec 2011 Cover.jpg', title: 'Dec 2011 Cover', date: 'Dec 2011 Cover' },
  { src: 'Dec-2012.png', title: 'Dec 2012', date: 'Dec 2012' },
  { src: 'December Cover 09.jpg', title: 'December Cover 09', date: 'December Cover 09' },
  { src: 'FEB-2013.png', title: 'FEB 2013', date: 'FEB 2013' },
  { src: 'Feb Issue Cover10.jpg', title: 'Feb Issue Cover10', date: 'Feb Issue Cover10' },
  { src: 'February 2011 Cover.jpg', title: 'February 2011 Cover', date: 'February 2011 Cover' },
  { src: 'JAN-2013.png', title: 'JAN 2013', date: 'JAN 2013' },
  { src: 'Jan-2012.png', title: 'Jan 2012', date: 'Jan 2012' },
  { src: 'July Issue Cover 10.jpg', title: 'July Issue Cover 10', date: 'July Issue Cover 10' },
  { src: 'July-2012.png', title: 'July 2012', date: 'July 2012' },
  { src: 'June Issue Cover 10.jpg', title: 'June Issue Cover 10', date: 'June Issue Cover 10' },
  { src: 'June-2012.png', title: 'June 2012', date: 'June 2012' },
  { src: 'MARCH-2013.png', title: 'MARCH 2013', date: 'MARCH 2013' },
  { src: 'March  2011 Cover.jpg', title: 'March  2011 Cover', date: 'March  2011 Cover' },
  { src: 'March Issue Cover 10.jpg', title: 'March Issue Cover 10', date: 'March Issue Cover 10' },
  { src: 'May  2011 Cover.jpg', title: 'May  2011 Cover', date: 'May  2011 Cover' },
  { src: 'May Issue Cover 10.jpg', title: 'May Issue Cover 10', date: 'May Issue Cover 10' },
  { src: 'May-2012.png', title: 'May 2012', date: 'May 2012' },
  { src: 'Nov cover 09.jpg', title: 'Nov cover 09', date: 'Nov cover 09' },
  { src: 'Nov-2012.png', title: 'Nov 2012', date: 'Nov 2012' },
  { src: 'November Cover 10.jpg', title: 'November Cover 10', date: 'November Cover 10' },
  { src: 'Oct  2011 Cover.jpg', title: 'Oct  2011 Cover', date: 'Oct  2011 Cover' },
  { src: 'Oct Issue Cover 09.jpg', title: 'Oct Issue Cover 09', date: 'Oct Issue Cover 09' },
  { src: 'Oct-2012.png', title: 'Oct 2012', date: 'Oct 2012' },
  { src: 'Sep Cover 10.jpg', title: 'Sep Cover 10', date: 'Sep Cover 10' },
  { src: 'Sep-2012.png', title: 'Sep 2012', date: 'Sep 2012' },
  { src: 'Sept  2011 Cover.jpg', title: 'Sept  2011 Cover', date: 'Sept  2011 Cover' },
  { src: 'feb 2012.jpg', title: 'feb 2012', date: 'feb 2012' },
  { src: 'feb-2012.png', title: 'feb 2012', date: 'feb 2012' },
];

export default function ArchivesPage() {
    // modalState can be null, or an object { type: 'pdf' | 'image', item: <pdf object> | <cover object> }
    const [modalState, setModalState] = useState<{type: 'pdf' | 'image', item: any} | null>(null);

    return (
        <div className="bg-slate-950 min-h-screen text-slate-300">
            {/* Minimalist Top Nav */}
            <nav className="fixed w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/assets/images/vishwaleader-logo-globe.png" alt="Vishwa Leader" className="h-6 w-auto group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
                        <span className="font-display font-black text-white text-sm tracking-wide group-hover:text-amber-400 transition-colors">VISHWA LEADER</span>
                    </Link>
                    <div className="flex gap-6 items-center text-xs font-bold tracking-wider uppercase">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
                        <Link href="/auth/member" className="bg-brandBlue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors border border-blue-500/50 shadow-[0_0_15px_rgba(0,86,202,0.3)]">Member Login</Link>
                    </div>
                </div>
            </nav>

            {/* Page Header */}
            <header className="pt-32 pb-16 px-6 border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl pointer-events-none">
                    <div className="w-96 h-96 bg-brandBlue rounded-full"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-tight mb-4">
                            The Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Archives</span>
                        </h1>
                        <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">
                            Access our complete repository of official circulars, academic abstracts, and a rich history of Vishwa Leader print magazines dating back over a decade. All documents are securely hosted and verified.
                        </p>
                    </div>
                </div>
            </header>

            {/* The Library (Shelves) */}
            <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">
                
                {/* Shelf 1: PDFs */}
                <section className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-brandBlue/10 text-brandBlue flex items-center justify-center border border-brandBlue/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM2 2v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2A2 2 0 0 1 8 2.5V1H3a1 1 0 0 0-1 1z"/></svg>
                            </span>
                            <div>
                                <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">Official Circulars & Conference Documents</h2>
                                <p className="text-[10px] text-slate-500 font-medium">Verified PDF Downloads & Academic Forms</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider bg-slate-900 px-3 py-1 rounded-full border border-slate-800">{pdfDownloadsList.length} Resources Available</span>
                    </div>

                    <div className="relative pb-10">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 pt-6 px-4">
                            {pdfDownloadsList.map((pdf, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center space-y-4 group cursor-pointer" onClick={() => setModalState({ type: 'pdf', item: pdf })}>
                                    <div className="relative w-[110px] h-[160px] sm:w-[130px] sm:h-[190px] active:scale-95 transition-transform duration-150">
                                        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-brandDark to-slate-900 border border-slate-700/50 rounded-r-lg shadow-lg flex flex-col justify-between p-3 sm:p-4 overflow-hidden">
                                            <div className="absolute top-0 left-0 w-3 h-full bg-black/30 border-r border-white/5 z-20"></div>
                                            <div className="self-end bg-brandBlue/90 backdrop-blur-sm border border-brandBlue/35 text-[7px] font-black text-white uppercase px-1.5 py-0.5 rounded tracking-widest z-10">PDF</div>
                                            <div className="pl-2 flex-grow flex items-center justify-center pt-2">
                                                <h4 className="font-display font-extrabold text-white text-[9px] sm:text-[10px] leading-tight line-clamp-4 select-none">{pdf.title}</h4>
                                            </div>
                                            <div className="pl-2 border-t border-slate-800/80 pt-2 flex items-center justify-between text-[7px] font-mono text-slate-500 uppercase tracking-widest z-10">
                                                <span>VL DOC</span>
                                                <span>{pdf.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-[120px] sm:w-[140px] space-y-1">
                                        <h4 className="text-xs font-bold text-slate-300 leading-tight line-clamp-2 group-hover:text-brandBlue transition-colors font-display">{pdf.title}</h4>
                                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide">{pdf.size} | PDF</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-4 w-full bg-slate-900 border-t border-slate-800 rounded-lg mt-4 relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/30 pointer-events-none"></div>
                        </div>
                    </div>
                </section>

                {/* Shelf 2: Magazines */}
                <section className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-4">
                        <div className="flex items-center gap-4">
                            <img src="/assets/images/vishwaleader-legacy-logo.png" alt="Legacy Vishwa Leader Logo" className="h-12 w-auto object-contain" style={{ maxWidth: '140px' }} />
                            <div>
                                <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">Legacy Archive</h2>
                                <p className="text-[10px] text-slate-500 font-medium">Our Historical Print Publications</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider bg-slate-900 px-3 py-1 rounded-full border border-slate-800">{magazineCoversList.length} Issues Archived</span>
                    </div>

                    <div className="relative pb-10">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 pt-6 px-4">
                            {magazineCoversList.map((cover, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center space-y-4 group cursor-pointer" onClick={() => setModalState({ type: 'image', item: cover })}>
                                    <div className="relative w-[110px] h-[160px] sm:w-[130px] sm:h-[190px] active:scale-95 transition-transform duration-150">
                                        <div className="relative w-full h-full bg-slate-900 border border-slate-800/80 rounded-md shadow-lg overflow-hidden">
                                            <img src={encodeURI(`/magazine-covers/${cover.src}`)} alt={cover.title} className="w-full h-full object-cover" loading="lazy" />
                                            <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-r from-black/45 to-transparent z-10"></div>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10"></div>
                                        </div>
                                    </div>
                                    <div className="w-[120px] sm:w-[140px] space-y-1">
                                        <h4 className="text-xs font-bold text-slate-300 leading-tight line-clamp-2 group-hover:text-amber-400 transition-colors font-display">{cover.title}</h4>
                                        <span className="text-[9px] font-mono font-bold text-amber-500/80 uppercase tracking-wider">{cover.date} | Issue</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-4 w-full bg-slate-900 border-t border-slate-800 rounded-lg mt-4 relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/30 pointer-events-none"></div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal Overlay */}
            {modalState && (
                <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col">
                    <div className="bg-slate-950 border-b border-slate-900 px-6 py-4 flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider bg-brandBlue text-white">
                                {modalState.type === 'pdf' ? 'PDF DOCUMENT' : 'ARCHIVED ISSUE'}
                            </span>
                            <h3 className="font-display font-bold text-white text-sm md:text-base leading-tight truncate max-w-md">
                                {modalState.item.title}
                            </h3>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {modalState.type === 'pdf' && (
                                <a href={`/pdfs/${modalState.item.file}`} download className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                                    Download
                                </a>
                            )}
                            <button onClick={() => setModalState(null)} className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white hover:text-red-400 flex items-center justify-center text-base transition-colors" title="Close Reader">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col lg:flex-row">
                        <div className="hidden lg:flex w-80 shrink-0 border-r border-slate-900 bg-slate-950/60 p-6 flex-col justify-between overflow-y-auto">
                            <div className="space-y-6">
                                <div className="aspect-[3/4] w-48 mx-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative">
                                    {modalState.type === 'image' ? (
                                        <img src={encodeURI(`/magazine-covers/${modalState.item.src}`)} alt="Cover Image" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-brandDark flex flex-col justify-between p-4">
                                            <div className="absolute top-0 left-0 w-2.5 h-full bg-black/25"></div>
                                            <span className="self-end bg-brandBlue text-white text-[8px] font-bold px-1.5 py-0.5 rounded">VL DOC</span>
                                            <p className="text-white text-xs font-bold font-display pl-2 leading-tight">{modalState.item.title}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 pt-6 border-t border-slate-900">
                                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-900 pb-2">
                                        <span className="text-slate-500 uppercase tracking-wider">File Size</span>
                                        <span className="text-brandBlue font-bold">{modalState.item.size || 'IMG'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-900 pb-2">
                                        <span className="text-slate-500 uppercase tracking-wider">Document Type</span>
                                        <span className="text-amber-400 font-bold">{modalState.type === 'pdf' ? 'PDF' : 'JPG'}</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Description</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        {modalState.item.desc || `High resolution scanned archive of the ${modalState.item.title} magazine.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow p-4 md:p-8 bg-slate-900/50 relative flex justify-center items-center">
                            {modalState.type === 'pdf' ? (
                                <iframe src={`/pdfs/${modalState.item.file}`} className="w-full h-full border-0 rounded-2xl shadow-2xl" style={{ minHeight: 'calc(100vh - 120px)' }}></iframe>
                            ) : (
                                <img src={encodeURI(`/magazine-covers/${modalState.item.src}`)} className="max-w-full max-h-[calc(100vh-140px)] object-contain rounded-xl shadow-2xl" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
