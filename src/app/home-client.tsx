"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { checkAdminSession, logoutAdmin } from "@/app/actions/adminAuth";

const magazineCoversList = [
  { src: '1001702539.jpg', title: 'April 2016 Cover', date: 'Apr 2016' },
  { src: '1001702550.jpg', title: 'December 2016 Cover', date: 'Dec 2016' },
  { src: '1001702555.jpg', title: 'August 2013 Cover', date: 'Aug 2013' },
  { src: 'December Cover 09.jpg', title: 'December 2009 Cover', date: 'Dec 2009' },
  { src: 'Nov cover 09.jpg', title: 'November 2009 Cover', date: 'Nov 2009' },
  { src: 'Oct Issue Cover 09.jpg', title: 'October 2009 Cover', date: 'Oct 2009' },
  { src: 'April  Issue Cover 10.jpg', title: 'April 2010 Cover', date: 'Apr 2010' },
  { src: 'Augst Issue Cover 10.jpg', title: 'August 2010 Cover', date: 'Aug 2010' },
  { src: 'Feb Issue Cover10.jpg', title: 'February 2010 Cover', date: 'Feb 2010' },
  { src: 'July Issue Cover 10.jpg', title: 'July 2010 Cover', date: 'Jul 2010' },
  { src: 'June Issue Cover 10.jpg', title: 'June 2010 Cover', date: 'Jun 2010' },
  { src: 'March Issue Cover 10.jpg', title: 'March 2010 Cover', date: 'Mar 2010' },
  { src: 'May Issue Cover 10.jpg', title: 'May 2010 Cover', date: 'May 2010' },
  { src: 'November Cover 10.jpg', title: 'November 2010 Cover', date: 'Nov 2010' },
  { src: 'Sep Cover 10.jpg', title: 'September 2010 Cover', date: 'Sep 2010' },
  { src: 'April  2011 Cover.jpg', title: 'April 2011 Cover', date: 'Apr 2011' },
  { src: 'Augst  2011 Cover.jpg', title: 'August 2011 Cover', date: 'Aug 2011' },
  { src: 'Dec 2011 Cover.jpg', title: 'December 2011 Cover', date: 'Dec 2011' },
  { src: 'February 2011 Cover.jpg', title: 'February 2011 Cover', date: 'Feb 2011' },
  { src: 'March  2011 Cover.jpg', title: 'March 2011 Cover', date: 'Mar 2011' },
  { src: 'May  2011 Cover.jpg', title: 'May 2011 Cover', date: 'May 2011' },
  { src: 'Oct  2011 Cover.jpg', title: 'October 2011 Cover', date: 'Oct 2011' },
  { src: 'Sept  2011 Cover.jpg', title: 'September 2011 Cover', date: 'Sep 2011' },
  { src: 'feb 2012.jpg', title: 'February 2012 Cover', date: 'Feb 2012' }
];

export default function HomeClientPage() {
  const [user, setUser] = useState<User | null>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    
    const initAuth = async () => {
      try {
        const isAdmin = await checkAdminSession();
        if (isAdmin) {
          setUser({ email: "vishwaleader@admin", displayName: "Studio Admin", isAdmin: true } as any);
          return;
        }
      } catch (err) {
        console.error("Session check failed", err);
      }

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
              setMemberData(docSnap.data());
            }
          } catch (e) {
            console.error("Firestore not initialized:", e);
          }
        }
      });
    };

    initAuth();
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if ((user as any)?.isAdmin) {
      await logoutAdmin();
      setUser(null);
    } else {
      await signOut(auth);
    }
    setIsDropdownOpen(false);
  };

  return (
    <>
      

    
    
    {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}


    <div className="bg-brandBlue text-white py-3 px-4 text-center border-b border-white/10 text-xs tracking-wide font-semibold relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a id="nav-abstract-strip" data-field="announcements.abstractLink" href="/call-for-papers" className="hover:text-amber-300 transition-colors flex items-center gap-1.5"><i className="fa-solid fa-graduation-cap"></i> Call for Abstracts</a>
            <span className="hidden sm:inline text-white/30">|</span>
            <a id="nav-business-strip" data-field="announcements.businessLink" href="/business-summit" className="hover:text-amber-300 transition-colors flex items-center gap-1.5"><i className="fa-solid fa-briefcase"></i> Call for Business Participation</a>
            <span className="hidden sm:inline text-white/30">|</span>
            <a id="nav-award-strip" data-field="announcements.awardLink" href="/awards" className="hover:text-amber-300 transition-colors flex items-center gap-1.5"><i className="fa-solid fa-trophy"></i> Call for Award Nominations</a>
        </div>
    </div>

    {/* Navigation Header */}
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 view-transition-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <a href="#home" className="group flex items-center gap-2 md:gap-3">
                    <img src="/assets/images/vishwaleader-logo-hd.png" 
                          alt="Vishwa Leader Logo" 
                          className="h-9 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
                          onError={() => {}} />
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="text-base md:text-lg font-black tracking-tight text-brandBlue font-display">Vishwa Leader</span>
                        <span className="text-[9px] md:text-[10px] font-black tracking-widest text-brandBlue uppercase border border-brandBlue/20 px-2 py-0.5 rounded bg-brandBlue/5 self-start">
                            Techmedia
                        </span>
                    </div>
                </a>

            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
                <a href="#about" className="hover:text-brandBlue transition-colors">Corporate</a>
                <a href="#conference" className="hover:text-brandBlue transition-colors">SOAS Conference</a>
                <div className="relative group/nav">
                    <button className="hover:text-brandBlue transition-colors flex items-center gap-1">
                        Events 2026 <i className="fa-solid fa-chevron-down text-[10px]"></i>
                    </button>
                    <div className="absolute top-full left-0 pt-2 w-56 hidden group-hover/nav:block z-50">
                        <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-2">
                            <a href="/call-for-papers" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brandBlue rounded-lg transition-colors">Call for Papers</a>
                            <a href="/business-summit" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brandBlue rounded-lg transition-colors">Business Summit</a>
                            <a href="/awards" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brandBlue rounded-lg transition-colors">Awards Nominations</a>
                            <a href="/souvenir-articles" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brandBlue rounded-lg transition-colors">Souvenir Articles</a>
                            <a href="/tour-package" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brandBlue rounded-lg transition-colors">London Tour Package</a>
                            <a href="/advertise" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brandBlue rounded-lg transition-colors">Advertise with Us</a>
                        </div>
                    </div>
                </div>
                <a href="gallery" className="hover:text-brandBlue transition-colors">Gallery</a>
                <a href="archives" className="hover:text-brandBlue transition-colors">Archive</a>
                <a href="#networks" className="hover:text-brandBlue transition-colors">Networks</a>
                <a href="#advertisers" className="hover:text-brandBlue transition-colors">Advertisers</a>

                {/* Auth State */}
                {!user ? (
                <div id="nav-login-links">
                    <a href="/auth/member" className="text-brandBlue hover:text-brandBlue/80 transition-colors font-bold text-sm flex items-center gap-1">
                        <i className="fa-solid fa-right-to-bracket text-xs"></i> Login/SignIn
                    </a>
                </div>
                ) : (
                <div id="nav-user-status" className="relative">
                    <button id="nav-status-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all focus:outline-none bg-white hover:bg-slate-50" aria-expanded={isDropdownOpen}>
                        <span id="nav-status-dot" className="w-2 h-2 rounded-full animate-pulse bg-emerald-500"></span>
                        <span id="nav-status-label">Logged in</span>
                        <i className={`fa-solid fa-chevron-down text-[9px] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} id="nav-status-chevron"></i>
                    </button>

                    {/* Dropdown card */}
                    <div id="nav-user-dropdown" className={`vl-dropdown absolute right-0 top-[calc(100%+8px)] w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                        {/* User info */}
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                            <div id="nav-avatar" className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-brandBlue">
                                {user.displayName ? user.displayName.charAt(0) : 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p id="nav-display-name" className="text-xs font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                                <p id="nav-display-email" className="text-[10px] text-slate-405 truncate">{user.email}</p>
                            </div>
                        </div>
                        {/* Role badge */}
                        <div id="nav-role-badge" className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 text-center bg-brandBlue/10 text-brandBlue">
                            {memberData?.role || 'Member'}
                        </div>
                        {/* Actions */}
                        <div className="space-y-1.5">
                            <a id="nav-portal-link" href={(user as any)?.isAdmin ? "/auth/admin" : "/auth/member"} className="flex items-center gap-2 w-full text-left text-xs font-semibold text-slate-700 hover:text-brandBlue hover:bg-brandBlue/5 px-3 py-2 rounded-xl transition-all">
                                <i id="nav-portal-icon" className="fa-solid fa-user text-brandBlue"></i>
                                <span id="nav-portal-text">{(user as any)?.isAdmin ? "Go to Dashboard" : "Go to Profile"}</span>
                            </a>
                            <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all">
                                <i className="fa-solid fa-right-from-bracket text-rose-500"></i> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
                )}

            </nav>

            {/* Mobile Hamburger Menu Button */}
            <button id="menuBtn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden relative w-10 h-10 text-slate-800 hover:text-brandBlue focus:outline-none flex items-center justify-center" aria-label="Toggle Menu">
                <div className="w-6 h-4 flex flex-col justify-between items-center relative">
                    <span className={`w-full h-0.5 bg-slate-800 rounded transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-45 translate-y-[0.45rem]' : ''}`} id="bar1"></span>
                    <span className={`w-full h-0.5 bg-slate-800 rounded transition-all duration-300 transform ${isMobileMenuOpen ? 'opacity-0' : ''}`} id="bar2"></span>
                    <span className={`w-full h-0.5 bg-slate-800 rounded transition-all duration-300 transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-[0.45rem]' : ''}`} id="bar3"></span>
                </div>
            </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div id="mobileMenu" className={`md:hidden absolute top-full left-0 right-0 overflow-y-auto transition-all duration-300 ease-in-out bg-white border-t border-slate-200 px-4 space-y-1 shadow-2xl z-50 ${isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100 py-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="py-3 space-y-1.5">
                <a href="#about" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-building text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Corporate</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <a href="#conference" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-graduation-cap text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>SOAS Conference</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <div className="py-2.5 px-3 border-b border-slate-50">
                    <div className="flex items-center text-sm font-semibold text-brandBlue mb-2">
                        <i className="fa-solid fa-calendar-days text-brandBlue/60 mr-3 w-5 text-center text-xs"></i>
                        <span>Events 2026</span>
                    </div>
                    <div className="pl-8 space-y-1">
                        <a href="/call-for-papers" className="block py-1.5 text-sm text-slate-600 hover:text-brandBlue">Call for Papers</a>
                        <a href="/business-summit" className="block py-1.5 text-sm text-slate-600 hover:text-brandBlue">Business Summit</a>
                        <a href="/awards" className="block py-1.5 text-sm text-slate-600 hover:text-brandBlue">Awards Nominations</a>
                        <a href="/souvenir-articles" className="block py-1.5 text-sm text-slate-600 hover:text-brandBlue">Souvenir Articles</a>
                        <a href="/tour-package" className="block py-1.5 text-sm text-slate-600 hover:text-brandBlue">London Tour Package</a>
                        <a href="/advertise" className="block py-1.5 text-sm text-slate-600 hover:text-brandBlue">Advertise with Us</a>
                    </div>
                </div>
                <a href="gallery" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-images text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Gallery</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <a href="archives" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-box-archive text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Archive</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <a href="#networks" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-circle-nodes text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Networks</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <a href="#advertisers" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-rectangle-ad text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Advertisers</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>

                {/* Mobile Auth */}
                {!user ? (
                <div id="mobile-login-links" className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    <a href="/auth/member" className="flex items-center py-2.5 px-3 text-sm font-semibold text-brandBlue hover:text-brandBlue/85 active:bg-slate-50 rounded-xl transition-all">
                        <i className="fa-solid fa-right-to-bracket text-brandBlue mr-3 w-5 text-center text-xs"></i>
                        <span>Login/SignIn</span>
                        <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                    </a>
                    <a href="/auth/admin" className="flex items-center py-2.5 px-3 text-sm font-semibold text-indigo-600 hover:text-indigo-500 active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                        <i className="fa-solid fa-user-shield text-indigo-400 mr-3 w-5 text-center text-xs"></i>
                        <span>Login as Team</span>
                        <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                    </a>
                </div>
                ) : (
                <div id="mobile-user-status" className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                        <div id="mobile-avatar" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-brandBlue shrink-0">
                            {user.displayName ? user.displayName.charAt(0) : 'U'}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p id="mobile-display-name" className="text-xs font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                            <p id="mobile-status-label" className="text-[9px] font-extrabold uppercase tracking-wider text-brandBlue">Logged in</p>
                        </div>
                    </div>
                    <a id="mobile-portal-link" href={(user as any)?.isAdmin ? "/auth/admin" : "/auth/member"} className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50">
                        <i id="mobile-portal-icon" className="fa-solid fa-user text-slate-400 mr-3 w-5 text-center text-xs"></i>
                        <span id="mobile-portal-text">{(user as any)?.isAdmin ? "Dashboard" : "Profile"}</span>
                        <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                    </a>
                    <button id="mobile-logout-btn" onClick={handleLogout} className="flex items-center py-2.5 px-3 text-sm font-semibold text-rose-600 hover:text-rose-750 active:bg-rose-50 rounded-xl transition-all w-full text-left">
                        <i className="fa-solid fa-right-from-bracket text-rose-500 mr-3 w-5 text-center text-xs"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
                )}
            </div>
        </div>
    </header>

    {/* Main Hero Section */}
    <section id="home" className="relative py-20 md:py-28 bg-brandDark text-white border-b border-slate-900 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-70"></div>
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brandBlue/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span data-field="hero.location">London, UK</span> • SEPTEMBER 18-20, 2026
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                    <span data-field="hero.title">Vishwa Leader Dr. B. R. Ambedkar International Awards 2026</span>
                </h1>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl font-normal" data-field="hero.description">
                    Vishwa Leader Techmedia Pvt. Ltd. coordinates global advocacy networks, academic research, and media ecosystems to amplify constitutional values and diaspora empowerment.
                </p>
                
                {/* CTA buttons for the three main calls */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 w-full">
                    <a id="btn-abstract" data-field="announcements.abstractLink" href="#conference" className="w-full sm:w-auto bg-brandBlue text-white font-bold px-6 py-4 rounded hover:bg-brandBlue/90 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-graduation-cap"></i> Submit Abstract
                    </a>
                    <a id="btn-nomination" data-field="announcements.awardLink" href="#contact" className="w-full sm:w-auto bg-amber-500 text-brandDark font-bold px-6 py-4 rounded hover:bg-amber-400 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-trophy"></i> Nominate for Award
                    </a>
                    <a id="btn-business" data-field="announcements.businessLink" href="#contact" className="w-full sm:w-auto border border-slate-500 text-white bg-slate-900/60 font-bold px-6 py-4 rounded hover:bg-slate-800 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-sm flex items-center justify-center gap-2">
                        <i className="fa-solid fa-briefcase"></i> Business Participation
                    </a>
                </div>
            </div>

            {/* Right Card: Interactive Event Box */}
            <div className="lg:col-span-5 relative">
                <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl overflow-hidden group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-brandBlue to-amber-500 rounded-2xl opacity-40 blur-[2px] -z-10"></div>
                    <div className="absolute inset-0 bg-slate-950 rounded-2xl -z-10"></div>

                    <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
                        <div>
                            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">Grand Celebration</span>
                            <h3 className="font-display text-lg font-bold text-white mt-0.5 uppercase tracking-tight">Ambedkar Awards 2026</h3>
                            <p className="text-xs text-slate-400 font-medium">SOAS University & London Forums</p>
                        </div>
                        <span className="bg-brandBlue/20 text-white border border-brandBlue/30 text-[10px] font-bold px-2.5 py-1 rounded">London, UK</span>
                    </div>

                    <div className="space-y-4 py-2 text-sm text-slate-200">
                        {/* Day 1 */}
                        <div className="flex items-start gap-3 border-b border-slate-800/60 pb-3">
                            <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0"><i className="fa-solid fa-graduation-cap text-xs"></i></span>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Day 1 — Sept 18, 2026</p>
                                <p className="font-semibold text-white">Academic Conference</p>
                                <p className="text-xs text-slate-400">Brunei Gallery Lecture Theatre, SOAS University of London</p>
                            </div>
                        </div>
                        {/* Day 2 */}
                        <div className="flex items-start gap-3 border-b border-slate-800/60 pb-3">
                            <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0"><i className="fa-solid fa-briefcase text-xs"></i></span>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Day 2 — Sept 19, 2026</p>
                                <p className="font-semibold text-white">Business Summit</p>
                                <p className="text-xs text-slate-400">Atrium Hotel Banquet Suite LHR, London</p>
                            </div>
                        </div>
                        {/* Day 3 */}
                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0"><i className="fa-solid fa-trophy text-xs"></i></span>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Day 3 — Sept 20, 2026</p>
                                <p className="font-semibold text-white">Awards & Cultural Ceremony</p>
                                <p className="text-xs text-slate-400">Greenwood Theatre, Guys Campus, King's College, London</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                        <span><strong>Director:</strong> Shirish B. Ramteke</span>
                        <a href="#events" className="text-amber-400 font-bold hover:underline">Timeline &rarr;</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Stats Bar */}
    <section className="bg-slate-50 border-b border-slate-200/60 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <span className="font-display block text-3xl font-black text-slate-900">2010</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Magazine Founded</span>
            </div>
            <div>
                <span className="font-display block text-3xl font-black text-slate-900">180+</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Media Photos</span>
            </div>
            <div>
                <span className="font-display block text-3xl font-black text-slate-900">SOAS University</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">London Conference Venue</span>
            </div>
            <div>
                <span className="font-display block text-3xl font-black text-slate-900">Global</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Advocacy Scope</span>
            </div>
        </div>
    </section>

    {/* Magazine Covers Train Ticker Section */}
    <section className="bg-slate-950 py-16 overflow-hidden border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
            <div className="flex justify-center mb-6">
                <img src="/assets/images/vishwaleader-legacy-logo.png" 
                     alt="Old Vishwa Leader Logo" 
                     className="h-16 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-full">Legacy Archive</span>
            <h3 className="font-display text-2xl md:text-3xl font-black text-white mt-3">Our Historical Print Publications</h3>
            <p className="text-slate-400 text-xs md:text-sm mt-3 max-w-3xl mx-auto leading-relaxed">
                These editions represent our foundational years in print publishing. As we evolve and scale into digital-first global advocacy campaigns and academic forums, our physical magazine print operations are currently paused. We preserve this archive as a testament to our editorial origins.
            </p>
        </div>
        
        <div className="relative w-full overflow-hidden py-4 select-none">
            {/* Left & Right gradients for fading edge effect */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
            
            {/* Scrolling Track */}
            <div className="overflow-hidden w-full flex">
                <div id="ticker-track" className="animate-ticker-train flex w-max gap-6 hover:[animation-play-state:paused] py-2">
                    {[...magazineCoversList, ...magazineCoversList].map((cover, i) => (
                        <a key={i} href={`/archives/covers/MAGAZINE COVER-${cover.title}`} 
                           className="flex-shrink-0 w-[200px] md:w-[260px] aspect-[3/4] relative group rounded-xl overflow-hidden shadow-md bg-slate-900 border border-slate-700/50 hover:border-amber-400/80 transition-all cursor-pointer">
                            <img src={`/magazine-covers/${cover.src}`} alt={cover.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-left">
                                <h4 className="text-white text-xs md:text-sm font-bold leading-tight font-display">{cover.title}</h4>
                                <span className="text-amber-400 text-[9px] md:text-[10px] font-extrabold mt-1 uppercase tracking-wider">{cover.date}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </section>

    {/* Corporate & Media Infrastructure */}
    <section id="about" className="py-20 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16 space-y-4">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Core Operations</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">Corporate & Media Infrastructure</h2>
                <p className="text-slate-500 leading-relaxed">
                    Vishwa Leader connects grassroots publishing in Maharashtra with corporate-backed advocacy initiatives on the international stage.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
                {/* Magazine Card */}
                <div className="border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-2xl transition-all p-8 flex flex-col justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brandBlue/10 text-brandBlue flex items-center justify-center border border-brandBlue/20">
                                <i className="fa-solid fa-newspaper text-lg"></i>
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-slate-900 uppercase">Vishwa Leader Magazine</h3>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RNI Print Periodical</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                            Established as a monthly Marathi periodical registered with the Press Registrar General of India under Registration Number <strong>MAHMAR/2009/34832</strong>. Dedicated to highlighting Bahujan and Ambedkarite affairs.
                        </p>
                        <div className="bg-white border border-slate-250 rounded-xl p-4 space-y-2 text-xs text-slate-700 mb-6">
                            <div className="flex justify-between py-1">
                                <span className="text-slate-450">Editor & Owner</span>
                                <span className="font-bold text-slate-900">Shirish B. Ramteke</span>
                            </div>
                        </div>
                    </div>
                    <a href="https://prgi.gov.in" target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-brandBlue hover:text-brandDark transition-colors uppercase tracking-wider">
                        PRGI Verification <i className="fa-solid fa-square-arrow-up-right text-[10px]"></i>
                    </a>
                </div>

                {/* Corporate Entity Card */}
                <div className="border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-2xl transition-all p-8 flex flex-col justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brandBlue/10 text-brandBlue flex items-center justify-center border border-brandBlue/20">
                                <i className="fa-solid fa-building text-lg"></i>
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-slate-900 uppercase">Vishwa Leader Techmedia</h3>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MCA Corporate Entity</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                            Incorporated on February 29, 2016 (CIN: <strong>U74999MH2016PTC273606</strong>) under the Ministry of Corporate Affairs (RoC Mumbai), serving as the event organizer for academic seminars and summits.
                        </p>
                        <div className="bg-white border border-slate-250 rounded-xl p-4 space-y-1.5 text-xs text-slate-700 mb-6 font-mono">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-400">Capital Status</span>
                                <span className="font-bold text-slate-900">Paid-up: Rs. 100k</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Status</span>
                                <span className="font-bold text-emerald-600">Active</span>
                            </div>
                        </div>
                    </div>
                    <a href="https://tracxn.com/d/legal-entities/india/vishwa-leader-techmedia-private-limited/__jDthDz58Owry-yAaHPhKSuhVYScE1DyjR4IGLp2Bhz8" target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-brandBlue hover:text-brandDark transition-colors uppercase tracking-wider">
                        MCA Profile <i className="fa-solid fa-square-arrow-up-right text-[10px]"></i>
                    </a>
                </div>

                {/* Featured Publication */}
                <div className="border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-2xl transition-all p-8 flex flex-col justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brandBlue/10 text-brandBlue flex items-center justify-center border border-brandBlue/20">
                                <i className="fa-solid fa-book-open text-lg"></i>
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-slate-900 uppercase">Featured Souvenir</h3>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Research & Souvenir</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                            <strong>Transnational Advocacy and Diaspora Mobilization:</strong> Documents the translation of Ambedkarite constitutional values and human rights initiatives onto international academic forums.
                        </p>
                        <div className="bg-white border border-slate-250 rounded-xl p-4 space-y-2 text-xs text-slate-700 mb-6">
                            <div className="flex justify-between py-1">
                                <span className="text-slate-450">Format</span>
                                <span className="font-bold text-slate-900">Souvenir PDF & Print</span>
                            </div>
                        </div>
                    </div>
                    <a href="#contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-brandBlue hover:text-brandDark transition-colors uppercase tracking-wider">
                        Request Copy <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </a>
                </div>
            </div>
        </div>
    </section>

    {/* Calling for Articles / SOAS Conference Section */}
    <section id="conference" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="max-w-4xl mb-16 space-y-4">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Academic Invitation</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                    Calling for Articles: SOAS University Conference 2026
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    Held on the eve of the <strong>Vishwa Leader Dr. B. R. Ambedkar International Awards 2026</strong> in London, UK. The organizing committee invites scholars, researchers, and activists to submit abstracts and full research papers for the academic conference at <strong>SOAS University of London</strong>.
                </p>
            </div>

            {/* Seminar Details Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                {/* Theme and Topics Grid (Left 8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <span className="text-[10px] font-bold text-brandBlue uppercase bg-brandBlue/5 px-2.5 py-1 rounded">Primary Theme</span>
                        <h3 className="font-display text-2xl font-black text-slate-900 mt-3 mb-6" data-field="conference.primaryTheme">
                            "Reimagining Equality and Justice: Dr. B. R. Ambedkar's Vision in the 21st Century"
                        </h3>

                        {/* 6 Sub-Themes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brandBlue shrink-0 border border-slate-200"><i className="fa-solid fa-people-group"></i></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Innovative Solutions for Inclusive Societies</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Proposing new ideas and practical solutions to foster equality and address modern governance issues.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brandBlue shrink-0 border border-slate-200"><i className="fa-solid fa-scale-balanced"></i></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Social Justice and Human Rights</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Exploration of Ambedkar's perspectives on justice and their relevance to contemporary human rights.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brandBlue shrink-0 border border-slate-200"><i className="fa-solid fa-chart-line"></i></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Economic Inclusion & Sustainable Development</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Critical analysis of Ambedkar's economic vision, including inclusive growth and economic equality.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brandBlue shrink-0 border border-slate-200"><i className="fa-solid fa-book"></i></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Education as a Tool for Empowerment</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Examining education as a cornerstone for empowerment and social transformation of marginalized communities.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brandBlue shrink-0 border border-slate-200"><i className="fa-solid fa-landmark"></i></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Constitutional Values & Global Governance</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Investigating Ambedkar's constitutional principles (democracy, rule of law, fraternity) and their impact on global governance structures.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brandBlue shrink-0 border border-slate-200"><i className="fa-solid fa-earth-americas"></i></div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Diaspora Mobilization and Transnational Advocacy</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Analyzing the role of global diaspora collectives in advocating for constitutional protections, human rights, and political representation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Important Information Panel (Right 4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Key Deadlines */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h4 className="font-display font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 uppercase text-xs tracking-wider">Conference Calendar</h4>
                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-800">Abstract Submission</p>
                                    <p className="text-slate-400 mt-0.5">Late abstract submissions accepted until</p>
                                </div>
                                <span className="bg-brandBlue/10 text-brandBlue font-bold px-2 py-1 rounded">30 July 2026</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-800">Acceptance Notification</p>
                                    <p className="text-slate-400 mt-0.5">Author review decisions released</p>
                                </div>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-1 rounded">10 August 2026</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <div>
                                    <p className="font-bold text-slate-800">Full Paper Submission</p>
                                    <p className="text-slate-400 mt-0.5">Submit final camera-ready drafts</p>
                                </div>
                                <span className="bg-amber-500/10 text-amber-700 font-bold px-2 py-1 rounded">31 August 2026</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick guidelines */}
                    <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h4 className="font-display font-bold text-white border-b border-slate-800 pb-3 mb-4 uppercase text-xs tracking-wider">Submission Guidelines</h4>
                        <ul className="space-y-3.5 text-xs">
                            <li className="flex items-start gap-2.5"><i className="fa-solid fa-circle-check text-amber-400 mt-0.5"></i> <span><strong>Abstracts:</strong> Limit to 300 words with 4-5 keywords specifying research area.</span></li>
                            <li className="flex items-start gap-2.5"><i className="fa-solid fa-circle-check text-amber-400 mt-0.5"></i> <span><strong>Co-authors:</strong> Up to 3 co-authors are permitted per paper submission.</span></li>
                            <li className="flex items-start gap-2.5"><i className="fa-solid fa-circle-check text-amber-400 mt-0.5"></i> <span><strong>Submission Format:</strong> Submit drafts in DOC/DOCX format with author profiles.</span></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Timeline / Cards Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Day 1 Card */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-brandBlue/30 transition-all flex flex-col justify-between group">
                    <div>
                        <div className="p-6 bg-brandDark text-white flex justify-between items-center">
                            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">DAY 1</span>
                            <span className="bg-brandBlue text-white text-[10px] font-bold px-2 py-0.5 rounded" data-field="events.event1_date">18 Sept 2026</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="font-display font-black text-slate-800 text-lg uppercase leading-tight" data-field="events.event1_name">International Academic Conference</h3>
                            <div className="flex items-center gap-2 text-xs text-brandBlue font-bold">
                                <i className="fa-solid fa-location-dot"></i> <span data-field="events.event1_venue">SOAS University of London</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed" data-field="events.event1_focus">
                                "Reimagining Equality and Justice: Dr. B. R. Ambedkar's Vision in the 21st Century". Featuring research papers, scholar panels, and human rights discourse.
                            </p>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <a data-field="announcements.abstractLink" href="#conference" target="_blank" className="block text-center border border-slate-250 text-slate-700 bg-slate-50 hover:bg-brandBlue hover:text-white hover:border-brandBlue font-bold py-3 rounded text-xs uppercase tracking-wider transition-all">
                            Submit Abstract
                        </a>
                    </div>
                </div>

                {/* Day 2 Card */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-brandBlue/30 transition-all flex flex-col justify-between group">
                    <div>
                        <div className="p-6 bg-brandDark text-white flex justify-between items-center">
                            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">DAY 2</span>
                            <span className="bg-brandBlue text-white text-[10px] font-bold px-2 py-0.5 rounded" data-field="events.event2_date">19 Sept 2026</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="font-display font-black text-slate-800 text-lg uppercase leading-tight" data-field="events.event2_name">International Business Summit</h3>
                            <div className="flex items-center gap-2 text-xs text-brandBlue font-bold">
                                <i className="fa-solid fa-location-dot"></i> <span data-field="events.event2_venue">London, UK</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed" data-field="events.event2_focus">
                                Connecting global diaspora entrepreneurs, business leaders, and investors. Promoting inclusive trade partnerships and economic empowerment.
                            </p>
                            <div className="mt-2 text-[10px] text-slate-400 font-medium">
                                <span className="block font-bold mb-1">In Association with:</span>
                                <span>Global Bahujan Business Council (GBBC), Dr. Ambedkar Chamber of Commerce (DACC), and WLCC (West London Chamber of Commerce).</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <a data-field="announcements.businessLink" href="#contact" target="_blank" className="block text-center border border-slate-250 text-slate-700 bg-slate-50 hover:bg-brandBlue hover:text-white hover:border-brandBlue font-bold py-3 rounded text-xs uppercase tracking-wider transition-all">
                            Register for Summit
                        </a>
                    </div>
                </div>

                {/* Day 3 Card */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-brandBlue/30 transition-all flex flex-col justify-between group">
                    <div>
                        <div className="p-6 bg-brandDark text-white flex justify-between items-center">
                            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">DAY 3</span>
                            <span className="bg-brandBlue text-white text-[10px] font-bold px-2 py-0.5 rounded" data-field="events.event3_date">20 Sept 2026</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <h3 className="font-display font-black text-slate-800 text-lg uppercase leading-tight" data-field="events.event3_name">International Award & Cultural Ceremony</h3>
                            <div className="flex items-center gap-2 text-xs text-brandBlue font-bold">
                                <i className="fa-solid fa-location-dot"></i> <span data-field="events.event3_venue">London, UK</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed" data-field="events.event3_focus">
                                Presentation of the prestigious Dr. Ambedkar International Awards 2026. Followed by cultural performances, networking banquet, and celebratory dinner.
                            </p>
                            <div className="mt-2 text-[10px] text-slate-400 font-medium">
                                <span className="block font-bold mb-1">Award Categories:</span>
                                <span>Social Justice Leadership, Education and Empowerment, Economic Development and Inclusion, Human Rights Advocacy, Innovative Community Service.</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <a data-field="announcements.awardLink" href="#contact" target="_blank" className="block text-center border border-slate-250 text-slate-700 bg-slate-50 hover:bg-brandBlue hover:text-white hover:border-brandBlue font-bold py-3 rounded text-xs uppercase tracking-wider transition-all">
                            Nominate / Attend
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Advertisers & Souvenir Section */}
    <section id="advertisers" className="py-20 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-12 space-y-4">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Opportunities</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">Advertisements & Souvenir Articles</h2>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Place an advertisement in the Official Souvenir or submit your articles inspired by Dr. B. R. Ambedkar's vision.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Advertisements */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Souvenir Advertisement Rates</h3>
                    <ul className="space-y-3 text-sm text-slate-600 mb-6">
                        <li className="flex justify-between border-b border-slate-200 pb-2"><span>Front Cover (Premium)</span><span className="font-bold">₹500,000/-</span></li>
                        <li className="flex justify-between border-b border-slate-200 pb-2"><span>Back Cover (Premium)</span><span className="font-bold">₹200,000/-</span></li>
                        <li className="flex justify-between border-b border-slate-200 pb-2"><span>Inside Front/Back Cover</span><span className="font-bold">₹150,000/-</span></li>
                        <li className="flex justify-between border-b border-slate-200 pb-2"><span>Double Spread</span><span className="font-bold">₹100,000/-</span></li>
                        <li className="flex justify-between border-b border-slate-200 pb-2"><span>Full Page</span><span className="font-bold">₹50,000/-</span></li>
                        <li className="flex justify-between border-b border-slate-200 pb-2"><span>Half Page</span><span className="font-bold">₹25,000/-</span></li>
                        <li className="flex justify-between border-b border-slate-200 pb-2"><span>Quarter Page</span><span className="font-bold">₹15,000/-</span></li>
                    </ul>
                    <a href="#contact" className="block text-center bg-amber-500 text-brandDark font-bold py-3 rounded text-xs uppercase tracking-wider transition-colors hover:bg-amber-400">Book Advertisement</a>
                </div>
                {/* Souvenir Articles */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Call for Articles</h3>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            We invite original, unpublished articles focusing on social justice, equality, fraternity, democracy, education, empowerment, and global citizenship.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600 mb-6">
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> <strong>Word Limit:</strong> 800-1,200 words</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> <strong>Language:</strong> English only</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> <strong>Author Profile:</strong> 50-70 words + photograph</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> <strong>Format:</strong> MS Word Document</li>
                        </ul>
                    </div>
                    <a href="#contact" className="block text-center border border-slate-300 bg-white text-brandDark font-bold py-3 rounded text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors">Submit Article</a>
                </div>
            </div>
        </div>
    </section>

    {/* London Tour Itinerary */}
    <section id="tour" className="py-20 md:py-24 bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-12 space-y-4">
                <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Travel & Logistics</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-white">8-Day London Tour Package</h2>
                <p className="text-slate-400 leading-relaxed text-sm">
                    Join us for an exclusive 7 Nights / 8 Days guided tour (17th Sept - 24th Sept 2026) encompassing the conference, summit, awards, and historical sightseeing across London and Oxford.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-display text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Tour Highlights</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
                        <div>
                            <p className="font-bold text-amber-400 mb-1">Day 1-2: Arrival & Academic</p>
                            <p className="text-xs mb-3">Arrival in London, check-in at Atrium Hotel LHR. Attend SOAS Conference.</p>
                            <p className="font-bold text-amber-400 mb-1">Day 3: Business Summit</p>
                            <p className="text-xs mb-3">Windsor Castle visit, International Business Summit.</p>
                            <p className="font-bold text-amber-400 mb-1">Day 4: Awards Ceremony</p>
                            <p className="text-xs mb-3">Morning leisure, Dr. Ambedkar Awards Ceremony at Greenwood Theatre.</p>
                            <p className="font-bold text-amber-400 mb-1">Day 5: City Tour</p>
                            <p className="text-xs mb-3">Guided City tour, Ambedkar Museum, Madame Tussauds, Oxford Street.</p>
                        </div>
                        <div>
                            <p className="font-bold text-amber-400 mb-1">Day 6: Institutions</p>
                            <p className="text-xs mb-3">LSE, India House, Grey's Inn, Tower of London.</p>
                            <p className="font-bold text-amber-400 mb-1">Day 7: Outskirts</p>
                            <p className="text-xs mb-3">Wolverhampton Buddha Vihara, Oxford Orientation tour.</p>
                            <p className="font-bold text-amber-400 mb-1">Day 8: Departure</p>
                            <p className="text-xs">Breakfast, check out, and transfer to airport.</p>
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-brandBlue text-white border border-brandBlue rounded-2xl p-6 shadow-md">
                        <h4 className="font-display text-sm font-bold uppercase tracking-widest text-amber-300 border-b border-white/20 pb-2 mb-3">Tour Package Cost</h4>
                        <div className="text-2xl font-black mb-1">₹ 2,86,400/-</div>
                        <p className="text-[10px] opacity-80 mb-4">per person (Incl. GST & TCS)</p>
                        
                        <ul className="space-y-2 text-xs mb-4">
                            <li><i className="fa-solid fa-check text-amber-300 mr-2"></i>Economy Airfare & Visa</li>
                            <li><i className="fa-solid fa-check text-amber-300 mr-2"></i>4-Star Hotel Accommodation</li>
                            <li><i className="fa-solid fa-check text-amber-300 mr-2"></i>Meals & Transfers Included</li>
                        </ul>
                        
                        <div className="bg-white/10 p-3 rounded mt-2">
                            <p className="text-[10px] font-bold uppercase mb-1 text-amber-300">Registration</p>
                            <p className="text-xs font-mono">₹ 23,600/-</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Global Networks */}
    <section id="networks" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16 space-y-4">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Global Reach</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">Transnational Advocacy Networks</h2>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Connecting grassroots leadership, academic institutions, and governance platforms to establish advocacy frameworks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="border border-slate-200 rounded-2xl p-8 bg-white flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-4">
                        <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Diplomacy</span>
                        <h3 className="font-display font-bold text-slate-800 text-base uppercase">Tibetan Parliament-in-Exile</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Shirish B. Ramteke led an Ambedkarite delegation to Dharamshala in November 2025, meeting with Deputy Speaker Dolma Tsering Teykhang to build collaborative civil rights advocacy.
                        </p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 mt-6">
                        <a href="https://tibet.net/delegation-of-ambedkarites-meets-deputy-speaker-led-standing-committee-members/" target="_blank" className="text-xs font-bold text-brandBlue hover:underline uppercase tracking-wider">
                            Read Statement <i className="fa-solid fa-arrow-up-right text-[9px] ml-0.5"></i>
                        </a>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="border border-slate-200 rounded-2xl p-8 bg-white flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-4">
                        <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Publications</span>
                        <h3 className="font-display font-bold text-slate-800 text-base uppercase">International Souvenir Volume</h3>
                        <p className="text-xs text-slate-550 leading-relaxed">
                            A commemorative conference Souvenir PDF and Print book will be released during the London ceremony, featuring selected academic papers, profiles of socio-cultural achievements, and sponsor listings.
                        </p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 mt-6">
                        <a href="#advertisers" className="text-xs font-bold text-brandBlue hover:underline uppercase tracking-wider">
                            Get Details <i className="fa-solid fa-arrow-right text-[9px] ml-0.5"></i>
                        </a>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="border border-slate-200 rounded-2xl p-8 bg-white flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-4">
                        <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Academia</span>
                        <h3 className="font-display font-bold text-slate-800 text-base uppercase">SOAS Academic Collaboration</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Partnering with scholars, universities, and diaspora collectives internationally to host and coordinate the 2026 conference panels on social justice and constitutional advocacy.
                        </p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 mt-6">
                        <a href="#conference" className="text-xs font-bold text-brandBlue hover:underline uppercase tracking-wider">
                            Submit Articles <i className="fa-solid fa-arrow-right text-[9px] ml-0.5"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Legal Compliance Desk */}
    <section id="compliance" className="py-20 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Compliance Registry</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">Verified Leadership & Corporate Profiles</h2>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Administrative details, credentials, and regulatory identification indices related to the directorate of Vishwa Leader.
                </p>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 md:p-10 shadow-sm relative max-w-4xl mx-auto">
                <div className="inline-flex mb-4 bg-brandBlue text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded">
                    Verified Director &amp; Publisher
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brandBlue/10 text-brandBlue flex items-center justify-center border border-brandBlue/20">
                            <i className="fa-solid fa-user-check text-lg"></i>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Legal Identity</span>
                            <h4 className="font-display text-xl md:text-2xl font-bold text-slate-900 uppercase">Shirish Bhageshwar Ramteke</h4>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-slate-200/60 py-6 text-xs">
                        <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Region</span>
                            <p className="font-bold text-slate-800 text-sm">Mumbai, Maharashtra, India</p>
                        </div>
                        <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Affiliations</span>
                            <p className="font-bold text-slate-800 text-sm">Vishwa Leader Techmedia Pvt. Ltd. (DIN: 07427260)</p>
                        </div>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Administrative Scope</span>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
                            Authorizes events, publishing schedules, and coordinates national and international representations (such as the SOAS Academic Conferences and Dr. Ambedkar Awards).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Contact Section */}
    <section id="contact" className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Info Column */}
                <div className="lg:col-span-5 space-y-8">
                    <div>
                        <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Inquiries</span>
                        <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-2">Get in Touch</h2>
                        <p className="text-slate-550 mt-4 text-sm leading-relaxed">
                            For any inquiries regarding the SOAS 2026 conference paper submissions, magazine subscriptions, or corporate collaborations.
                        </p>
                    </div>

                    <div className="space-y-6 text-xs text-slate-700">
                        <div className="flex items-start gap-4">
                            <span className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center text-brandBlue shrink-0"><i className="fa-solid fa-location-dot"></i></span>
                            <div>
                                <h4 className="font-bold text-slate-950 uppercase tracking-wide">Corporate Office Address</h4>
                                <p className="text-slate-500 mt-1 leading-relaxed">
                                    Unit no. 1, Malwa, Patanwala Industrial Estate,<br />
                                    LBS Marg, Ghatkopar West, Mumbai - 400086, India
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <span className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center text-brandBlue shrink-0"><i className="fa-solid fa-phone"></i></span>
                            <div>
                                <h4 className="font-bold text-slate-950 uppercase tracking-wide">Hotlines & Coordinator</h4>
                                <p className="text-slate-555 mt-1" data-field="contact.phone">
                                    Primary Phone: +91 9969688928
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <span className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center text-brandBlue shrink-0"><i className="fa-solid fa-envelope"></i></span>
                            <div>
                                <h4 className="font-bold text-slate-950 uppercase tracking-wide">Email Directory</h4>
                                <p className="text-slate-500 mt-1 font-mono">
                                    vishwaleader.techmedia@gmail.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Column (Google-Verified Inquiry) */}
                <div className="lg:col-span-7 border border-slate-200 rounded-2xl p-8 bg-white shadow-sm flex flex-col justify-center">
                    
                    {/* State A: Unauthenticated Visitor */}
                    <div id="inquiry-unauth-container" className="space-y-6 text-center py-6">
                        <div className="w-14 h-14 rounded-full bg-brandBlue/10 border border-brandBlue/20 flex items-center justify-center text-brandBlue text-xl mx-auto">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">Verified Secure Inquiry</h3>
                            <p className="text-xs text-slate-550 max-w-md mx-auto leading-relaxed">
                                To prevent spam and register your contact details securely, we track sender email addresses verified by Google. Please sign in with a secure Google Account to submit your inquiry or message.
                            </p>
                        </div>
                        <button onClick={() => {}} className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm font-bold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-wider mx-auto">
                            <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            Sign In with Google
                        </button>
                    </div>

                    {/* State B: Authenticated Visitor */}
                    <div id="inquiry-auth-container" className="hidden space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div id="inquiry-verified-avatar" className="w-9 h-9 rounded-full bg-brandBlue text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                                    VL
                                </div>
                                <div className="text-left leading-normal">
                                    <h4 id="inquiry-verified-name" className="text-xs font-bold text-slate-900">Name</h4>
                                    <p id="inquiry-verified-email" className="text-[10px] text-slate-500 font-mono">email@gmail.com</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                                <i className="fa-solid fa-circle-check text-[10px]"></i> Verified Sender
                            </span>
                        </div>

                        <form id="contactForm" onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold uppercase tracking-wider text-slate-500">Inquiry Category</label>
                                <select name="category" className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-slate-800 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-xs">
                                    <option>SOAS Conference 2026 - Article Submission</option>
                                    <option>Dr. Ambedkar Awards - Attendee Registration</option>
                                    <option>Vishwa Leader Magazine - Subscriptions & Print Ads</option>
                                    <option>General Information Inquiry</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold uppercase tracking-wider text-slate-500">Message Detail</label>
                                <textarea name="message" rows={4} required className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-slate-800 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-xs" placeholder="Type your inquiry or message here..."></textarea>
                            </div>
                            <button type="submit" className="w-full bg-brandDark text-white font-bold py-4 rounded hover:bg-brandDark/95 transition-colors uppercase tracking-wider text-xs">
                                Submit Verified Inquiry
                            </button>
                        </form>
                        
                        <div className="text-center pt-2">
                            <button onClick={() => {}} className="text-[10px] text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wide">
                                <i className="fa-solid fa-sign-out-alt"></i> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Success State */}
                    <div id="inquiry-success-alert" className="hidden text-center py-8 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-xl mx-auto">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900">Message Sent Successfully</p>
                            <p className="text-[10px] text-slate-550 max-w-xs mx-auto leading-relaxed">
                                Thank you! Your verified inquiry has been logged in our databases. The coordinator team will reach out directly to your Google email.
                            </p>
                        </div>
                        <button onClick={() => {}} className="text-[9px] font-bold text-brandBlue uppercase bg-brandBlue/10 hover:bg-brandBlue/20 px-3 py-1.5 rounded transition-all">
                            Send Another Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Footer */}
    <footer className="bg-brandDark text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12 text-xs">

            <div className="md:col-span-4 space-y-4">
                <span className="font-display text-sm font-black tracking-tight text-white uppercase">VISHWA LEADER</span>
                <p className="text-slate-400 leading-relaxed">
                    Vishwa Leader Techmedia Private Limited is an incorporated corporate media platform driving transnational academic forums and universal empowerment programs.
                </p>
                <div className="flex gap-4 text-slate-500 pt-2">
                    <a href="https://prgi.gov.in" target="_blank" className="hover:text-white transition-colors" title="PRGI"><i className="fa-solid fa-earth-asia text-base"></i></a>
                    <a href="https://tibet.net/delegation-of-ambedkarites-meets-deputy-speaker-led-standing-committee-members/" target="_blank" className="hover:text-white transition-colors" title="Tibet Net"><i className="fa-solid fa-circle-info text-base"></i></a>
                </div>
            </div>

            <div className="md:col-span-4 space-y-3">
                <h4 className="font-display font-bold border-b border-slate-800 pb-2 text-[10px] text-slate-400 uppercase tracking-widest">
                    Verification Registers
                </h4>
                <ul className="space-y-2.5">
                    <li>
                        <a href="https://prgi.gov.in" target="_blank" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                            Press Registrar General of India Registry <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://tracxn.com/d/legal-entities/india/vishwa-leader-techmedia-private-limited/__jDthDz58Owry-yAaHPhKSuhVYScE1DyjR4IGLp2Bhz8" target="_blank" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                            Ministry of Corporate Affairs Profile <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
                <h4 className="font-display font-bold border-b border-slate-800 pb-2 text-[10px] text-slate-400 uppercase tracking-widest">
                    Registration Metadata
                </h4>
                <div className="bg-brandDark/50 border border-slate-800 p-4 rounded-xl space-y-2 text-[10px] font-mono text-slate-400">
                    <p><span className="text-slate-600">CIN:</span> U74999MH2016PTC273606</p>
                    <p><span className="text-slate-600">REG DATE:</span> February 29, 2016</p>
                    <p><span className="text-slate-600">RNI REG:</span> MAHMAR/2009/34832</p>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-8 text-center text-[10px] text-slate-500 font-normal">
            <p>© 2026 Vishwa Leader Techmedia Private Limited. All Rights Reserved. Compiled under RNI & MCA guidelines.</p>
        </div>
    </footer>
    </>
  );
}
