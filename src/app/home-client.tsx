"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit } from "firebase/firestore";
import { checkAdminSession, logoutAdmin } from "@/app/actions/adminAuth";
import { getTestimonials } from "@/app/actions/testimonials";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const magazineCoversList = [
  { src: '1001702539.jpg', title: '1001702539', date: '1001702539' },
  { src: '1001702550.jpg', title: '1001702550', date: '1001702550' },
  { src: '1001702555.jpg', title: '1001702555', date: '1001702555' },
  { src: 'april-2013.jpg', title: 'APRIL 2013', date: 'APRIL 2013' },
  { src: 'april-2011-cover.jpg', title: 'April  2011 Cover', date: 'April  2011 Cover' },
  { src: 'april-issue-cover-10.jpg', title: 'April  Issue Cover 10', date: 'April  Issue Cover 10' },
  { src: 'april-2012.png', title: 'April 2012', date: 'April 2012' },
  { src: 'augst-2011-cover.jpg', title: 'Augst  2011 Cover', date: 'Augst  2011 Cover' },
  { src: 'augst-issue-cover-10.jpg', title: 'Augst Issue Cover 10', date: 'Augst Issue Cover 10' },
  { src: 'augst-2012.png', title: 'Augst 2012', date: 'Augst 2012' },
  { src: 'dec-2011-cover.jpg', title: 'Dec 2011 Cover', date: 'Dec 2011 Cover' },
  { src: 'dec-2012.png', title: 'Dec 2012', date: 'Dec 2012' },
  { src: 'december-cover-09.jpg', title: 'December Cover 09', date: 'December Cover 09' },
  { src: 'feb-2013.png', title: 'FEB 2013', date: 'FEB 2013' },
  { src: 'feb-issue-cover10.jpg', title: 'Feb Issue Cover10', date: 'Feb Issue Cover10' },
  { src: 'february-2011-cover.jpg', title: 'February 2011 Cover', date: 'February 2011 Cover' },
  { src: 'jan-2013.png', title: 'JAN 2013', date: 'JAN 2013' },
  { src: 'jan-2012.png', title: 'Jan 2012', date: 'Jan 2012' },
  { src: 'july-issue-cover-10.jpg', title: 'July Issue Cover 10', date: 'July Issue Cover 10' },
  { src: 'july-2012.png', title: 'July 2012', date: 'July 2012' },
  { src: 'june-issue-cover-10.jpg', title: 'June Issue Cover 10', date: 'June Issue Cover 10' },
  { src: 'june-2012.png', title: 'June 2012', date: 'June 2012' },
  { src: 'march-2013.png', title: 'MARCH 2013', date: 'MARCH 2013' },
  { src: 'march-2011-cover.jpg', title: 'March  2011 Cover', date: 'March  2011 Cover' },
  { src: 'march-issue-cover-10.jpg', title: 'March Issue Cover 10', date: 'March Issue Cover 10' },
  { src: 'may-2011-cover.jpg', title: 'May  2011 Cover', date: 'May  2011 Cover' },
  { src: 'may-issue-cover-10.jpg', title: 'May Issue Cover 10', date: 'May Issue Cover 10' },
  { src: 'may-2012.png', title: 'May 2012', date: 'May 2012' },
  { src: 'nov-cover-09.jpg', title: 'Nov cover 09', date: 'Nov cover 09' },
  { src: 'nov-2012.png', title: 'Nov 2012', date: 'Nov 2012' },
  { src: 'november-cover-10.jpg', title: 'November Cover 10', date: 'November Cover 10' },
  { src: 'oct-2011-cover.jpg', title: 'Oct  2011 Cover', date: 'Oct  2011 Cover' },
  { src: 'oct-issue-cover-09.jpg', title: 'Oct Issue Cover 09', date: 'Oct Issue Cover 09' },
  { src: 'oct-2012.png', title: 'Oct 2012', date: 'Oct 2012' },
  { src: 'sep-cover-10.jpg', title: 'Sep Cover 10', date: 'Sep Cover 10' },
  { src: 'sep-2012.png', title: 'Sep 2012', date: 'Sep 2012' },
  { src: 'sept-2011-cover.jpg', title: 'Sept  2011 Cover', date: 'Sept  2011 Cover' },
  { src: 'feb-2012.jpg', title: 'feb 2012', date: 'feb 2012' },
  { src: 'feb-2012.png', title: 'feb 2012', date: 'feb 2012' },
];

export default function HomeClientPage() {
  const [user, setUser] = useState<User | null>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<'idle'|'submitting'|'success'>('idle');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialStatus, setTestimonialStatus] = useState<'idle'|'submitting'|'success'>('idle');
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(1);

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

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const result = await getTestimonials();
        if (result.success && result.data) {
          setTestimonials(result.data);
        } else {
          console.error("Failed to fetch testimonials via server action", (result as any).error);
        }
      } catch (e) {
        console.error("Failed to fetch testimonials", e);
      }
    };
    fetchTestimonials();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  const submitInquiry = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setInquiryStatus('submitting');
    try {
      const formData = new FormData(e.target);
      await addDoc(collection(db, "inquiries"), {
        category: formData.get("category"),
        message: formData.get("message"),
        name: user.displayName || 'Unknown',
        email: user.email,
        createdAt: serverTimestamp()
      });
      setInquiryStatus('success');
      e.target.reset();
    } catch (err) {
      console.error(err);
      setInquiryStatus('idle');
    }
  };

  const submitTestimonial = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setTestimonialStatus('submitting');
    try {
      const formData = new FormData(e.target);
      const newTestimonial = {
        text: formData.get("text"),
        name: user.displayName || 'Anonymous User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "testimonials"), newTestimonial);
      setTestimonialStatus('success');
      e.target.reset();
      // Optimistically update list
      setTestimonials(prev => [{ id: Math.random().toString(), ...newTestimonial }, ...prev].slice(0,6));
    } catch (err) {
      console.error(err);
      setTestimonialStatus('idle');
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1500; // 1.5 seconds smooth scroll
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // easeInOutCubic
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.history.pushState(null, '', '#' + targetId);
      }
    };

    requestAnimationFrame(animation);
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
                <a href="/mission" className="hover:text-brandBlue transition-colors font-bold text-slate-800">Mission</a>
                <a href="#about" onClick={(e) => handleSmoothScroll(e, 'about')} className="hover:text-brandBlue transition-colors">Corporate</a>
                <a href="/pricing" className="hover:text-brandBlue transition-colors">Pricing</a>
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
                <a href="#networks" onClick={(e) => handleSmoothScroll(e, 'networks')} className="hover:text-brandBlue transition-colors">Networks</a>
                <a href="#advertisers" onClick={(e) => handleSmoothScroll(e, 'advertisers')} className="hover:text-brandBlue transition-colors">Advertisers</a>

                {/* Auth State */}
                {!user ? (
                <div id="nav-login-links">
                    <a href="/auth/member" className="text-brandBlue hover:text-brandBlue/80 transition-colors font-bold text-sm flex items-center gap-1">
                        <i className="fa-solid fa-right-to-bracket text-xs"></i> Login/SignIn
                    </a>
                </div>
                ) : (
                <div id="nav-user-status" className="relative flex items-center">
                    <button id="nav-status-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1.5 focus:outline-none rounded-full p-0.5 border border-slate-200 hover:border-brandBlue transition-all bg-white" aria-expanded={isDropdownOpen}>
                        <img 
                            src={user.photoURL || "https://placehold.co/100x100/0a1e4b/ffffff?text=User"} 
                            referrerPolicy="no-referrer"
                            alt="Profile" 
                            className="w-11 h-11 rounded-full object-cover shrink-0" 
                        />
                        <i className={`fa-solid fa-chevron-down text-[8px] text-slate-500 mr-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} id="nav-status-chevron"></i>
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
                <a href="/mission" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-bullseye text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Mission</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <a href="#about" onClick={(e) => { setIsMobileMenuOpen(false); handleSmoothScroll(e, 'about'); }} className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-building text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Corporate</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <a href="/pricing" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-tag text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Pricing</span>
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
                <a href="#networks" onClick={(e) => { setIsMobileMenuOpen(false); handleSmoothScroll(e, 'networks'); }} className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-circle-nodes text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Networks</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                <a href="#advertisers" onClick={(e) => { setIsMobileMenuOpen(false); handleSmoothScroll(e, 'advertisers'); }} className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
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
                        <img 
                            src={user.photoURL || "https://placehold.co/100x100/0a1e4b/ffffff?text=User"} 
                            alt="Profile" 
                            className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200" 
                        />
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
        
        {/* 3D Background from Three.js snippet */}
        <iframe src="/three-bg.html" className="absolute inset-0 w-full h-full border-0 pointer-events-none z-0" title="3D Background"></iframe>

        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-70 z-0 pointer-events-none"></div>
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brandBlue/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span data-field="hero.location">London, UK</span> • SEPTEMBER 18-20, 2026
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                    <span data-field="hero.title"><span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026</span>
                </h1>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl font-normal" data-field="hero.description">
                    On the eve of 135th Birth Anniversary of Dr. B. R. Ambedkar, Vishwa Leader Techmedia Pvt. Ltd. coordinates global advocacy networks, academic research, and media ecosystems to amplify constitutional values and diaspora empowerment. 🎉
                </p>
                
                {/* CTA buttons for the three main calls */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 w-full">
                    <a id="btn-abstract" data-field="announcements.abstractLink" href="#conference-details" onClick={(e) => handleSmoothScroll(e, 'conference-details')} className="w-full sm:w-auto bg-brandBlue text-white font-bold px-6 py-4 rounded hover:bg-brandBlue/90 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-graduation-cap"></i> Submit Abstract
                    </a>
                    <a id="btn-business" data-field="announcements.businessLink" href="#business-summit" onClick={(e) => handleSmoothScroll(e, 'business-summit')} className="w-full sm:w-auto bg-amber-500 text-brandDark font-bold px-6 py-4 rounded hover:bg-amber-400 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-briefcase"></i> Business Participation
                    </a>
                    <a id="btn-nomination" data-field="announcements.awardLink" href="#awards" onClick={(e) => handleSmoothScroll(e, 'awards')} className="w-full sm:w-auto border border-slate-500 text-white bg-slate-900/60 font-bold px-6 py-4 rounded hover:bg-slate-800 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-sm flex items-center justify-center gap-2">
                        <i className="fa-solid fa-trophy"></i> Nominate for Award
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
                            <Image src={encodeURI(`/magazine-covers/${cover.src}`)} alt={cover.title} fill sizes="(max-width: 768px) 200px, 260px" className="object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
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
                                <span className="text-slate-450">Owner</span>
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
    <section id="schedule" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            {/* Event Schedule Header */}
            <div className="max-w-3xl mb-12 space-y-4 text-center mx-auto">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Event Schedule</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">Three-Day London Event Schedule</h2>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Overview of the main academic, business, and award events taking place in London from September 18th to September 20th, 2026.
                </p>
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
                        <a data-field="announcements.abstractLink" href="/call-for-papers" className="block text-center border border-slate-250 text-slate-700 bg-slate-50 hover:bg-brandBlue hover:text-white hover:border-brandBlue font-bold py-3 rounded text-xs uppercase tracking-wider transition-all">
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
                                <i className="fa-solid fa-location-dot"></i> <span data-field="events.event2_venue">Hotel Banquet Suite, London, UK</span>
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
                        <a data-field="announcements.businessLink" href="/business-summit" className="block text-center border border-slate-250 text-slate-700 bg-slate-50 hover:bg-brandBlue hover:text-white hover:border-brandBlue font-bold py-3 rounded text-xs uppercase tracking-wider transition-all">
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
                                <i className="fa-solid fa-location-dot"></i> <span data-field="events.event3_venue">Greenwood Theatre, Guys Campus, King&apos;s College, London, UK</span>
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
                        <a data-field="announcements.awardLink" href="/awards" className="block text-center border border-slate-250 text-slate-700 bg-slate-50 hover:bg-brandBlue hover:text-white hover:border-brandBlue font-bold py-3 rounded text-xs uppercase tracking-wider transition-all">
                            Nominate / Attend
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Academic Conference Section */}
    <section id="conference-details" className="py-20 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                    <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Academic Invitation</span>
                    <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        International Academic Conference
                    </h2>
                    <h3 className="text-lg font-bold text-slate-700 -mt-3">Call for Abstracts and Papers</h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                        Held on the eve of the <strong><span translate="no" className="notranslate">Vishwa Leader</span> Dr. B. R. Ambedkar International Awards 2026</strong> in London, UK. The organizing committee invites scholars, researchers, and activists to submit abstracts and full research papers for the academic conference at <strong>SOAS University of London</strong>.
                    </p>
                    <p className="text-slate-655 leading-relaxed text-sm">
                        Featuring sessions on social justice, human rights, economic inclusion, and constitutional values, reimagining Dr. B. R. Ambedkar's vision in the 21st century.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <a href="/call-for-papers" className="bg-brandBlue text-white font-bold px-6 py-3 rounded hover:bg-brandBlue/90 text-xs uppercase tracking-wider transition-all shadow-sm">
                            Read More & Details
                        </a>
                        <a href="/auth/member?tab=submissions" className="border border-slate-350 text-slate-700 bg-white hover:bg-slate-50 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider transition-all">
                            Submit Abstract
                        </a>
                    </div>
                </div>
                <div className="lg:col-span-5 order-2 lg:order-1">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
                        <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wide">Key Focus Areas</h4>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Social Justice & Human Rights Protection</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Economic Inclusion & Sustainable Growth</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Constitutional Values & Global Governance</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Diaspora Mobilization & Advocacy</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Business Summit Section */}
    <section id="business-summit" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                    <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Business Participation</span>
                    <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        International Business Summit & WLCC Networking 2026
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                        In association with the <strong>Global Bahujan Business Council (GBBC)</strong>, <strong>Dr. Ambedkar Chamber of Commerce (DACC)</strong>, and the <strong>WLCC (West London Chamber of Commerce)</strong>, the Business Summit connects global diaspora entrepreneurs, corporate partners, and institutional investors.
                    </p>
                    <p className="text-slate-655 leading-relaxed text-sm">
                        Featuring sessions on inclusive trade, venture funding, technology integration, and cross-border partnerships to empower business leaders and scale social enterprises globally.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <a href="/business-summit" className="bg-brandBlue text-white font-bold px-6 py-3 rounded hover:bg-brandBlue/90 text-xs uppercase tracking-wider transition-all shadow-sm">
                            Read More & Details
                        </a>
                        <a href="/auth/member" className="border border-slate-350 text-slate-700 bg-white hover:bg-slate-50 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider transition-all">
                            Register as Business Delegate
                        </a>
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
                        <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wide">Key Focus Areas</h4>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Global Diaspora Networking & WLCC Partnerships</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Venture Capital & Social Impact Funding Panels</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Inclusive Business Models & Supply Chain Diversity</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Cross-border Trade & Compliance Forums</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Awards Ceremony Section */}
    <section id="awards" className="py-20 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 order-2 lg:order-1">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
                        <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wide">Award Categories</h4>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex gap-2"><i className="fa-solid fa-trophy text-amber-500 mt-0.5"></i> <span>Social Justice Leadership</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-trophy text-amber-500 mt-0.5"></i> <span>Education and Empowerment</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-trophy text-amber-500 mt-0.5"></i> <span>Economic Development and Inclusion</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-trophy text-amber-500 mt-0.5"></i> <span>Human Rights Advocacy</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-trophy text-amber-500 mt-0.5"></i> <span>Innovative Community Service</span></li>
                        </ul>
                    </div>
                </div>
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                    <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Recognition & Culture</span>
                    <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        Dr. Ambedkar International Awards & Cultural Ceremony 2026
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                        A grand celebration hosted at the <strong>Greenwood Theatre (Guys Campus, King's College London)</strong>. Celebrating outstanding contributions in social justice, research, human rights, and community empowerment.
                    </p>
                    <p className="text-slate-655 leading-relaxed text-sm">
                        The event features international award distributions, cultural performances showcasing Dalit and Bahujan artistic heritage, and a grand celebratory banquet dinner.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <a href="/awards" className="bg-brandBlue text-white font-bold px-6 py-3 rounded hover:bg-brandBlue/90 text-xs uppercase tracking-wider transition-all shadow-sm">
                            Read More & Details
                        </a>
                        <a href="/auth/member" className="border border-slate-350 text-slate-700 bg-white hover:bg-slate-50 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider transition-all">
                            Nominate for Award
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
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-brandBlue/10 flex items-center justify-center mb-6">
                        <i className="fa-solid fa-rectangle-ad text-2xl text-brandBlue"></i>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Explore Advertising & Registration Packages</h3>
                    <p className="text-sm text-slate-600 mb-8 leading-relaxed max-w-sm">
                        Discover comprehensive delegate event passes, all-inclusive tour packages, and premium advertising opportunities in our Official Souvenir publication.
                    </p>
                    <a href="/pricing" className="inline-block bg-brandBlue text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-wider transition-all hover:bg-brandBlue/90 hover:shadow-lg shadow-brandBlue/20">
                        View Detailed Pricing
                    </a>
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
            
            <div className="max-w-5xl mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Tour Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-sm text-slate-300">
                    <div>
                        <p className="font-bold text-amber-400 mb-1">Day 1: Arrival</p>
                        <p className="text-xs mb-3">Arrival in London, check-in at Hotel and Inaugural Function.</p>
                        <p className="font-bold text-amber-400 mb-1">Day 2: Academic</p>
                        <p className="text-xs mb-3">Attend SOAS Conference.</p>
                        <p className="font-bold text-amber-400 mb-1">Day 3: Business Summit</p>
                        <p className="text-xs mb-3">Windsor Castle visit, International Business Summit.</p>
                        <p className="font-bold text-amber-400 mb-1">Day 4: Awards Ceremony</p>
                        <p className="text-xs mb-3">Morning leisure, Dr. Ambedkar Awards Ceremony at Greenwood Theatre.</p>
                    </div>
                    <div>
                        <p className="font-bold text-amber-400 mb-1">Day 5: City Tour</p>
                        <p className="text-xs mb-3">Guided City tour, Ambedkar Museum, Madame Tussauds, Oxford Street.</p>
                        <p className="font-bold text-amber-400 mb-1">Day 6: Institutions</p>
                        <p className="text-xs mb-3">LSE, India House, Grey's Inn, Tower of London.</p>
                        <p className="font-bold text-amber-400 mb-1">Day 7: Outskirts</p>
                        <p className="text-xs mb-3">Wolverhampton Buddha Vihara, Oxford Orientation tour.</p>
                        <p className="font-bold text-amber-400 mb-1">Day 8: Departure</p>
                        <p className="text-xs">Breakfast, check out, and transfer to airport.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-6 text-center">
                <a href="https://vishwaleader.vercel.app/tour-package" className="inline-block bg-brandBlue text-white font-bold px-6 py-3 rounded hover:bg-brandBlue/90 text-xs uppercase tracking-wider transition-all shadow-sm">
                    Read Full Tour Details
                </a>
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

    {/* Testimonials Section */}
    <section id="testimonials" className="py-24 bg-[#141414] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
            <div className="text-center mb-12">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Voices of the Community</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-white mt-2">Testimonials</h2>
            </div>
            
            {/* Carousel */}
            <div className="relative max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
                {(() => {
                    let displayData = testimonials.length > 0 ? [...testimonials] : [];
                    
                    if (displayData.length === 0) {
                        displayData = [
                            { id: 'e1', text: "Be the first to share your experience! We'd love to hear from you.", name: "Community Member", designation: "" },
                            { id: 'e2', text: "Your voice matters to us. Leave a testimonial below.", name: "Community Member", designation: "" },
                            { id: 'e3', text: "Join our community of thought leaders and share your journey.", name: "Community Member", designation: "" }
                        ];
                    } else if (displayData.length === 1) {
                        displayData = [displayData[0], displayData[0], displayData[0]];
                    } else if (displayData.length === 2) {
                        displayData = [displayData[0], displayData[1], displayData[0]];
                    }
                    
                    const getIndex = (offset: number) => (activeTestimonialIndex + offset + displayData.length) % displayData.length;
                    
                    const leftIndex = getIndex(-1);
                    const centerIndex = getIndex(0);
                    const rightIndex = getIndex(1);

                    return (
                        <div className="flex w-full items-center justify-center relative h-[360px]">
                            {/* Left Card */}
                            <div className="absolute left-0 w-[30%] lg:w-[28%] h-[300px] bg-[#1a1a1a] rounded-xl shadow-lg opacity-40 scale-90 transition-all duration-500 ease-in-out p-6 flex flex-col justify-between hidden md:flex items-center text-center cursor-pointer" onClick={() => setActiveTestimonialIndex(leftIndex)}>
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#333] mb-4">
                                    <img src={displayData[leftIndex]?.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <p className="text-sm text-slate-400 italic line-clamp-4">"{displayData[leftIndex]?.text}"</p>
                                <div className="mt-4">
                                    <p className="text-xs text-slate-500">- {displayData[leftIndex]?.name}{displayData[leftIndex]?.designation && `, ${displayData[leftIndex].designation}`}</p>
                                </div>
                            </div>

                            {/* Center Card */}
                            <div className="z-10 w-[90%] md:w-[45%] lg:w-[40%] h-[360px] bg-[#2a2a2a] rounded-xl shadow-2xl opacity-100 scale-100 transition-all duration-500 ease-in-out p-8 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-600 mb-6 shrink-0">
                                    {displayData[centerIndex]?.photoURL ? (
                                        <img src={displayData[centerIndex].photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-700 text-white flex items-center justify-center font-bold text-xl">{displayData[centerIndex]?.name?.charAt(0)}</div>
                                    )}
                                </div>
                                <p className="text-base text-white leading-relaxed flex-grow">"{displayData[centerIndex]?.text}"</p>
                                <div className="mt-6 shrink-0">
                                    <p className="text-sm text-slate-300">- {displayData[centerIndex]?.name}{displayData[centerIndex]?.designation && `, ${displayData[centerIndex].designation}`}</p>
                                </div>
                            </div>

                            {/* Right Card */}
                            <div className="absolute right-0 w-[30%] lg:w-[28%] h-[300px] bg-[#1a1a1a] rounded-xl shadow-lg opacity-40 scale-90 transition-all duration-500 ease-in-out p-6 flex flex-col justify-between hidden md:flex items-center text-center cursor-pointer" onClick={() => setActiveTestimonialIndex(rightIndex)}>
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#333] mb-4">
                                    <img src={displayData[rightIndex]?.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <p className="text-sm text-slate-400 italic line-clamp-4">"{displayData[rightIndex]?.text}"</p>
                                <div className="mt-4">
                                    <p className="text-xs text-slate-500">- {displayData[rightIndex]?.name}{displayData[rightIndex]?.designation && `, ${displayData[rightIndex].designation}`}</p>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-6 mt-8">
                <button 
                    onClick={() => setActiveTestimonialIndex(prev => prev === 0 ? (testimonials.length > 0 ? testimonials.length : 4) - 1 : prev - 1)}
                    className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <div className="flex gap-2">
                    {Array.from({ length: testimonials.length > 0 ? testimonials.length : 4 }).map((_, i) => (
                        <div key={i} onClick={() => setActiveTestimonialIndex(i)} className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${activeTestimonialIndex === i ? 'bg-white' : 'bg-slate-600'}`}></div>
                    ))}
                </div>
                <button 
                    onClick={() => setActiveTestimonialIndex(prev => (prev + 1) % (testimonials.length > 0 ? testimonials.length : 4))}
                    className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors">
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            {/* Write Testimonial Form */}
            <div className="max-w-2xl mx-auto mt-16">
                <Card className="bg-[#1c1c1c] border-white/10 text-white shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Share Your Experience</CardTitle>
                        <CardDescription className="text-slate-400">Join our community and let others know about your journey</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {!user ? (
                            <div className="text-center space-y-5 py-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500 mb-2">
                                    <i className="fa-solid fa-lock text-xl"></i>
                                </div>
                                <p className="text-sm text-slate-300">You must be signed in to submit a review.</p>
                                <Button onClick={handleGoogleSignIn} variant="secondary" className="font-semibold text-xs px-6 py-5 rounded-xl w-full sm:w-auto">
                                   <i className="fa-brands fa-google text-brandBlue mr-2"></i> Sign In to Write
                                </Button>
                            </div>
                        ) : testimonialStatus === 'success' ? (
                            <div className="text-center space-y-4 py-8">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <h3 className="text-xl font-bold text-white">Thank You!</h3>
                                <p className="text-sm text-slate-400">Your testimonial is now live and part of our global community.</p>
                                <Button onClick={() => setTestimonialStatus('idle')} variant="outline" className="text-brandBlue border-brandBlue/30 hover:bg-brandBlue/10 mt-4 rounded-xl text-xs font-bold">
                                    Write Another
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={submitTestimonial} className="space-y-5">
                                <div className="space-y-2">
                                    <Textarea 
                                        name="text" 
                                        rows={4} 
                                        required 
                                        placeholder="I attended the SOAS conference and..." 
                                        className="resize-none bg-[#2a2a2a] border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brandBlue rounded-xl p-4 text-sm"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={testimonialStatus === 'submitting'} 
                                    className="w-full bg-brandBlue hover:bg-brandBlue/90 text-white font-bold py-6 rounded-xl transition-all shadow-lg text-sm"
                                >
                                    {testimonialStatus === 'submitting' ? (
                                        <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Submitting...</>
                                    ) : (
                                        'Post Testimonial'
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
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
                    
                    {!user ? (
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
                            <button onClick={handleGoogleSignIn} className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm font-bold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-wider mx-auto">
                                <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                Sign In with Google
                            </button>
                        </div>
                    ) : inquiryStatus === 'success' ? (
                        <div id="inquiry-success-alert" className="text-center py-8 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-xl mx-auto">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-900">Message Sent Successfully</p>
                                <p className="text-[10px] text-slate-550 max-w-xs mx-auto leading-relaxed">
                                    Thank you! Your verified inquiry has been logged in our databases. The coordinator team will reach out directly to your Google email.
                                </p>
                            </div>
                            <button onClick={() => setInquiryStatus('idle')} className="text-[9px] font-bold text-brandBlue uppercase bg-brandBlue/10 hover:bg-brandBlue/20 px-3 py-1.5 rounded transition-all">
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <div id="inquiry-auth-container" className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} referrerPolicy="no-referrer" alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-brandBlue text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                                            {user.displayName ? user.displayName.charAt(0) : "VL"}
                                        </div>
                                    )}
                                    <div className="text-left leading-normal">
                                        <h4 className="text-xs font-bold text-slate-900">{user.displayName || "Verified User"}</h4>
                                        <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                                    <i className="fa-solid fa-circle-check text-[10px]"></i> Verified Sender
                                </span>
                            </div>

                            <form onSubmit={submitInquiry} className="space-y-4 text-xs">
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
                                <button type="submit" disabled={inquiryStatus === 'submitting'} className="w-full bg-brandDark text-white font-bold py-4 rounded hover:bg-brandDark/95 transition-colors uppercase tracking-wider text-xs disabled:opacity-50">
                                    {inquiryStatus === 'submitting' ? 'Submitting...' : 'Submit Verified Inquiry'}
                                </button>
                            </form>
                            
                            <div className="text-center pt-2">
                                <button onClick={handleLogout} className="text-[10px] text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wide">
                                    <i className="fa-solid fa-sign-out-alt"></i> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
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
            <p>© 2026 <span translate="no" className="notranslate">Vishwa Leader</span> Techmedia Private Limited. All Rights Reserved. Compiled under RNI & MCA guidelines.</p>
        </div>
    </footer>
    </>
  );
}
