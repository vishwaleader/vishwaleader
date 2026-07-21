"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit, where } from "firebase/firestore";
import Link from "next/link";
import { checkAdminSession, logoutAdmin } from "@/app/actions/adminAuth";
import { getTestimonials } from "@/app/actions/testimonials";
import { getRecentDonors } from "@/app/actions/donationActions";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import NetworkBackground from "@/components/NetworkBackground";
import AdPlaceholder from "@/components/AdPlaceholder";

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
  const [recentDonors, setRecentDonors] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchRecentDonors = async () => {
      try {
        const res = await getRecentDonors();
        if (res.success && res.data) {
          setRecentDonors(res.data as any);
        } else {
          console.error("Error fetching homepage recent donors via server action:", res.error);
        }
      } catch (e) {
        console.error("Error fetching homepage recent donors:", e);
      }
    };
    fetchRecentDonors();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/popup-blocked'
      ) {
        return;
      }
      console.error("Sign in failed", error);
    }
  };

  const submitInquiry = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setInquiryStatus('submitting');
    
    const formData = new FormData(e.target);
    const message = formData.get("message");
    const target = e.target;

    setTimeout(async () => {
      try {
        await addDoc(collection(db, "inquiries"), {
          message: message,
          name: user.displayName || 'Unknown',
          email: user.email,
          createdAt: serverTimestamp()
        });
        setInquiryStatus('success');
        target.reset();
      } catch (err) {
        console.error(err);
        setInquiryStatus('idle');
      }
    }, 0);
  };

  const submitTestimonial = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setTestimonialStatus('submitting');
    
    const formData = new FormData(e.target);
    const text = formData.get("text");
    const target = e.target;

    setTimeout(async () => {
      try {
        const newTestimonial = {
          text: text,
          name: user.displayName || 'Anonymous User',
          email: user.email,
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "testimonials"), newTestimonial);
        setTestimonialStatus('success');
        target.reset();
        // Optimistically update list
        setTestimonials(prev => [{ id: Math.random().toString(), ...newTestimonial }, ...prev].slice(0,6));
      } catch (err) {
        console.error(err);
        setTestimonialStatus('idle');
      }
    }, 0);
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
      

    
    
    {/* Main Hero Section */}
    <section id="home" className="relative py-20 md:py-28 bg-brandDark text-white border-b border-slate-900 overflow-hidden">
        
        {/* 2D Network connecting dots background */}
        <NetworkBackground />
        
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brandBlue/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-7 space-y-6"
            >
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
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="btn-abstract" data-field="announcements.abstractLink" href="#conference-details" onClick={(e: any) => handleSmoothScroll(e, 'conference-details')} className="w-full sm:w-auto bg-brandBlue text-white font-bold px-6 py-4 rounded hover:bg-brandBlue/90 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-graduation-cap"></i> Submit Abstract
                    </motion.a>
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="btn-business" data-field="announcements.businessLink" href="#business-summit" onClick={(e: any) => handleSmoothScroll(e, 'business-summit')} className="w-full sm:w-auto bg-amber-500 text-brandDark font-bold px-6 py-4 rounded hover:bg-amber-400 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-briefcase"></i> Business Participation
                    </motion.a>
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="btn-nomination" data-field="announcements.awardLink" href="#awards" onClick={(e: any) => handleSmoothScroll(e, 'awards')} className="w-full sm:w-auto border border-slate-500 text-white bg-slate-900/60 font-bold px-6 py-4 rounded hover:bg-slate-800 active:scale-[0.98] text-xs tracking-wider uppercase text-center transition-all shadow-sm flex items-center justify-center gap-2">
                        <i className="fa-solid fa-trophy"></i> Nominate for Award
                    </motion.a>
                </div>
            </motion.div>

            {/* Right Card: Interactive Event Box */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-5 relative"
            >
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
            </motion.div>
        </div>
    </section>

    <div className="max-w-7xl mx-auto px-6">
      <AdPlaceholder />
    </div>

    {/* Stats Bar */}
    <section className="bg-slate-50 border-b border-slate-200/60 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <span className="font-display block text-3xl font-black text-slate-900">2010</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Magazine Founded</span>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                <span className="font-display block text-3xl font-black text-slate-900">180+</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Media Photos</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                <span className="font-display block text-3xl font-black text-slate-900">SOAS University</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">London Conference Venue</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
                <span className="font-display block text-3xl font-black text-slate-900">Global</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Advocacy Scope</span>
            </motion.div>
        </div>
    </section>

    {/* Magazine Covers Train Ticker Section */}
    <section className="bg-slate-950 py-16 overflow-hidden border-b border-slate-900">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-6 mb-10 text-center">
            <div className="flex justify-center mb-6">
                <img src="/assets/images/vishwaleader-legacy-logo.png" 
                     alt="Old Vishwa Leader Logo" 
                     className="h-28 md:h-36 w-auto object-contain drop-shadow-2xl transition-all hover:scale-105" />
            </div>
            <span className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-full">Legacy Archive</span>
            <h3 className="font-display text-2xl md:text-3xl font-black text-white mt-3">Our Historical Print Publications</h3>
            <p className="text-slate-400 text-xs md:text-sm mt-3 max-w-3xl mx-auto leading-relaxed">
                These editions represent our foundational years in print publishing. As we evolve and scale into digital-first global advocacy campaigns and academic forums, our physical magazine print operations are currently paused. We preserve this archive as a testament to our editorial origins.
            </p>
        </motion.div>
        
        <div className="relative w-full overflow-hidden py-4 select-none">
            {/* Left & Right gradients for fading edge effect */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
            
            {/* Scrolling Track */}
            <div className="overflow-hidden w-full flex">
                <div id="ticker-track" className="animate-ticker-train flex w-max gap-6 hover:[animation-play-state:paused] py-2">
                    {[...magazineCoversList, ...magazineCoversList].map((cover, i) => (
                        <a key={i} href={`/archives/covers/MAGAZINE COVER-${cover.title}`} 
                           suppressHydrationWarning
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
            <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="max-w-3xl mb-16 space-y-4">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Core Operations</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">Corporate & Media Infrastructure</h2>
                <p className="text-slate-500 leading-relaxed">
                    Vishwa Leader connects grassroots publishing in Maharashtra with corporate-backed advocacy initiatives on the international stage.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
                {/* Magazine Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-2xl transition-all p-8 flex flex-col justify-between bg-slate-50/50">
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
                </motion.div>

                {/* Corporate Entity Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-2xl transition-all p-8 flex flex-col justify-between bg-slate-50/50">
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
                </motion.div>

                {/* Featured Publication */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-2xl transition-all p-8 flex flex-col justify-between bg-slate-50/50">
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
                </motion.div>
            </div>
        </div>
    </section>

    {/* Calling for Articles / SOAS Conference Section */}
    <section id="schedule" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            {/* Event Schedule Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mb-12 space-y-4 text-center mx-auto">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Event Schedule</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900">Three-Day London Event Schedule</h2>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Overview of the main academic, business, and award events taking place in London from September 18th to September 20th, 2026.
                </p>
            </motion.div>

            {/* Timeline / Cards Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Day 1 Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-brandBlue/30 transition-all flex flex-col justify-between group">
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
                </motion.div>

                {/* Day 2 Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-brandBlue/30 transition-all flex flex-col justify-between group">
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
                </motion.div>

                {/* Day 3 Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-brandBlue/30 transition-all flex flex-col justify-between group">
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
                </motion.div>
            </div>
        </div>
    </section>

    {/* Academic Conference Section */}
    <section id="conference-details" className="py-20 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-7 order-1 lg:order-2 space-y-6">
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
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-5 order-2 lg:order-1">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
                        <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wide">Key Focus Areas</h4>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Social Justice & Human Rights Protection</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Economic Inclusion & Sustainable Growth</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Constitutional Values & Global Governance</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-graduation-cap text-brandBlue mt-0.5"></i> <span>Diaspora Mobilization & Advocacy</span></li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>

    {/* Business Summit Section */}
    <section id="business-summit" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-7 space-y-6">
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
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-5">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
                        <h4 className="font-display font-bold text-slate-900 text-sm uppercase tracking-wide">Key Focus Areas</h4>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Global Diaspora Networking & WLCC Partnerships</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Venture Capital & Social Impact Funding Panels</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Inclusive Business Models & Supply Chain Diversity</span></li>
                            <li className="flex gap-2"><i className="fa-solid fa-circle-check text-brandBlue mt-0.5"></i> <span>Cross-border Trade & Compliance Forums</span></li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>

    {/* Awards Ceremony Section */}
    <section id="awards" className="py-20 md:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-5 order-2 lg:order-1">
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
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-7 order-1 lg:order-2 space-y-6">
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
                </motion.div>
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

    {/* Supported Organizations */}
    <section id="organizations" className="py-20 md:py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Global Network</span>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-2">Supported Organizations</h2>
                <p className="text-slate-550 mt-4 text-sm leading-relaxed max-w-2xl mx-auto">
                    We are proud to be associated with leading trade and commerce networks that build business bridges, explore international markets, and support socio-economic initiatives globally.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* WLCC */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="h-64 flex items-center justify-center mb-4">
                        <img src="/assets/images/WLCC.png" alt="West London Chambers of Commerce" className="max-h-32 object-contain" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-brandBlue mb-1">(WLCC)</span>
                    <h3 className="font-bold text-lg text-slate-900 mb-4 min-h-[3.5rem] flex items-center justify-center">West London Chambers of Commerce</h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed min-h-[4.5rem]">
                        A highly recognized, proactive, non-profit British business chamber supporting companies across the West London boroughs.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        They act as a massive networking and business growth hub, hosting over 100 events a year, giving our business a direct bridge to the UK/European market and international trade assistance.
                    </p>
                </div>

                {/* GBBC */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="h-64 flex items-center justify-center mb-4">
                        <img src="/assets/images/GBBC.png" alt="Global Bahujan Business Council" className="max-h-56 w-full object-contain" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-brandBlue mb-1">(GBBC)</span>
                    <h3 className="font-bold text-lg text-slate-900 mb-4 min-h-[3.5rem] flex items-center justify-center">Global Bahujan Business Council</h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed min-h-[4.5rem]">
                        A global trade network focused on socio-economic empowerment, connecting and elevating entrepreneurs from historically underrepresented backgrounds.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        They provide a collaborative ecosystem to foster trade relations globally, help small-to-medium businesses scale up, and connect businesses for cross-border investments and mentorship.
                    </p>
                </div>

                {/* DACC */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="h-64 flex items-center justify-center mb-4">
                        <img src="/assets/images/DACCI-2-hd.png" alt="Dr. Ambedkar Chamber of Commerce" className="max-h-64 w-full object-contain mix-blend-multiply" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-brandBlue mb-1">(DACC)</span>
                    <h3 className="font-bold text-lg text-slate-900 mb-4 min-h-[3.5rem] flex items-center justify-center">Dr. Ambedkar Chamber of Commerce</h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed min-h-[4.5rem]">
                        An Indian non-profit organization focused on promoting Economic Democracy and empowering first-generation entrepreneurs from marginalized communities.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        They provide resources, business training, financial inclusion guidance, and market linkages, pointing to a strong focus on inclusive business development and converting job seekers into job creators.
                    </p>
                </div>
            </div>
        </div>
    </section>

    {/* Azad TV Collaboration */}
    <section id="azad-tv-collaboration" className="pt-10 pb-20 md:pt-12 md:pb-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col gap-6 md:gap-8 items-center">
                
                {/* Logos Above Header */}
                <div className="flex items-center justify-center w-full max-w-4xl mx-auto">
                    <div className="flex-1 flex justify-end pr-5 md:pr-10">
                        <img src="/assets/images/Azad-TV.png" alt="Azad TV" className="h-24 md:h-32 lg:h-40 object-contain mix-blend-multiply" />
                    </div>
                    <div className="text-brandBlue text-4xl md:text-5xl shrink-0 flex items-center justify-center w-12 md:w-16">
                        <i className="fa-solid fa-handshake"></i>
                    </div>
                    <div className="flex-1 flex justify-start pl-5 md:pl-10">
                        <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-24 md:h-32 lg:h-40 object-contain" />
                    </div>
                </div>

                {/* Header Text */}
                <div className="text-center space-y-4">
                    <span className="text-xs font-bold tracking-widest text-brandBlue uppercase">Strategic Partnership</span>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                        Azad TV UK & Vishwa Leader
                    </h2>
                </div>
                    
                    {/* Collaboration Photo */}
                    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                        <img src="/assets/images/new-ramesh-klair-and-shirish-ramteke.png" alt="Ramesh Klair and Shirish Ramteke" className="w-full h-auto max-h-[600px] object-contain bg-slate-50" />
                        <div className="p-4 bg-white border-t border-slate-100 text-center">
                            <p className="text-sm font-semibold text-slate-800">Ramesh Klair <span className="text-slate-400 font-normal mx-2">|</span> Shirish Ramteke</p>
                            <p className="text-xs text-brandBlue uppercase tracking-wider mt-1 font-bold">Azad TV UK & Vishwa Leader</p>
                        </div>
                    </div>

                {/* Bottom Column - Text Content */}
                <div className="w-full space-y-8">
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm text-center">
                        <p className="text-slate-700 leading-relaxed text-lg font-medium">
                            Vishwa Leader, owned by <strong className="text-slate-900">Shirish Ramteke</strong>, is in strategic collaboration with Azad-TV UK, owned by <strong className="text-slate-900">Ramesh Klair</strong>, bridging the gap between global networks and community broadcasting.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-800 pb-2">
                                About Ramesh Chander Klair
                            </h3>
                            <div className="w-24 h-1 bg-brandBlue/20 mx-auto rounded-full mb-4"></div>
                            <p className="text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
                                Ramesh Chander Klair is a British broadcaster and businessman based in Southall, West London, who serves as the director and owner of Azad TV Limited. Here is a breakdown of his professional profile and corporate registrations based on UK official records:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <i className="fa-solid fa-building text-brandBlue"></i>
                                    Corporate Overview
                                </h4>
                                <ul className="space-y-4 text-sm text-slate-600">
                                    <li className="flex gap-3">
                                        <i className="fa-solid fa-check text-green-500 mt-1"></i>
                                        <span><strong>Azad TV Limited:</strong> Incorporated on June 11, 2019, under company number 12044250. The channel provides programming catering to the South Asian diaspora, primarily focused on the Punjabi and broader Asian communities in the UK and Europe.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <i className="fa-solid fa-check text-green-500 mt-1"></i>
                                        <span><strong>Role:</strong> He is listed as an active Director and holds significant control over the company.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <i className="fa-solid fa-check text-green-500 mt-1"></i>
                                        <span><strong>Registered Address:</strong> 65 Norwood Road, Southall, England, UB2 4EA.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <i className="fa-solid fa-globe text-brandBlue"></i>
                                    Other Ventures & Background
                                </h4>
                                <ul className="space-y-4 text-sm text-slate-600">
                                    <li className="flex gap-3">
                                        <i className="fa-solid fa-check text-green-500 mt-1"></i>
                                        <span><strong>Kanshi TV:</strong> Prior to establishing Azad TV, he was closely involved with Kanshi TV (another prominent UK-based Punjabi community channel), serving as a director there until his resignation in January 2019 shortly before launching Azad TV.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <i className="fa-solid fa-check text-green-500 mt-1"></i>
                                        <span><strong>Human Rights & Community Work:</strong> He served as a director for the Sri Guru Ravidass International Organization for Human Rights from 2002 until 2012. He was also previously involved with the British Asian Multicultural Society (UK) Limited. His work heavily intersects with the Punjabi media landscape, cultural broadcasting, and community advocacy in the Greater London area.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
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

    {/* Secured Payment Gateway Partners Section */}
    <section className="py-20 bg-slate-50 border-t border-slate-200 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-brandBlue uppercase flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secured Global Payments
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-2">Integrated Banking Partners</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-sm md:text-base">
                Vishwa Leader is seamlessly connected to all major domestic and international banks, credit card networks, and UPI platforms via Razorpay's bank-grade secure gateway.
            </p>
        </div>

        <div className="relative flex flex-col gap-6 select-none before:absolute before:inset-y-0 before:left-0 before:w-1/6 before:bg-gradient-to-r before:from-slate-50 before:to-transparent before:z-10 after:absolute after:inset-y-0 after:right-0 after:w-1/6 after:bg-gradient-to-l after:from-slate-50 after:to-transparent after:z-10">
            {/* Row 1 - Cards & Major Banks */}
            <div className="animate-ticker-logos-forward flex w-max hover:[animation-play-state:paused]">
                {[...Array(2)].map((_, i) => (
                    <div key={`row1-${i}`} className="flex gap-4 items-center pr-4">
                        {[
                            { name: 'Visa', logo: 'https://img.icons8.com/color/96/000000/visa.png' },
                            { name: 'Mastercard', logo: 'https://img.icons8.com/color/96/000000/mastercard.png' },
                            { name: 'American Express', logo: 'https://img.icons8.com/color/96/000000/amex.png' },
                            { name: 'RuPay', logo: '/assets/logos/rupay.png', scale: 'scale-[1.6]' },
                            { name: 'HDFC Bank', logo: 'https://cdn.razorpay.com/bank/HDFC.gif' },
                            { name: 'State Bank of India', logo: 'https://cdn.razorpay.com/bank/SBIN.gif' },
                            { name: 'ICICI Bank', logo: 'https://cdn.razorpay.com/bank/ICIC.gif' },
                            { name: 'Axis Bank', logo: 'https://cdn.razorpay.com/bank/UTIB.gif' },
                            { name: 'Bank of Baroda', logo: 'https://cdn.razorpay.com/bank/BARB.gif' },
                            { name: 'Kotak Mahindra', logo: 'https://cdn.razorpay.com/bank/KKBK.gif' },
                            { name: 'Citibank', logo: 'https://cdn.razorpay.com/bank/CITI.gif' },
                            { name: 'Standard Chartered', logo: 'https://cdn.razorpay.com/bank/SCBL.gif' },
                            { name: 'HSBC Bank', logo: 'https://cdn.razorpay.com/bank/HSBC.gif' },
                            { name: 'Federal Bank', logo: 'https://cdn.razorpay.com/bank/FDRL.gif' },
                            { name: 'Yes Bank', logo: 'https://cdn.razorpay.com/bank/YESB.gif' },
                            { name: 'IndusInd Bank', logo: 'https://cdn.razorpay.com/bank/INDB.gif' }
                        ].map((bank, j) => (
                            <div key={`b1-${j}`} className="flex items-center gap-3 px-6 py-2 whitespace-nowrap opacity-80 hover:opacity-100 transition-opacity">
                                <img src={bank.logo} alt={bank.name} className={`h-10 w-auto object-contain drop-shadow-sm ${bank.scale || ''}`} />
                                <span className="font-bold tracking-tight text-lg text-slate-700">{bank.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Row 2 - UPI & International */}
            <div className="animate-ticker-logos-backward flex w-max hover:[animation-play-state:paused]">
                {[...Array(2)].map((_, i) => (
                    <div key={`row2-${i}`} className="flex gap-4 items-center pr-4">
                        {[
                            { name: 'Google Pay', logo: 'https://img.icons8.com/color/96/000000/google-pay-india.png' },
                            { name: 'PhonePe', logo: '/assets/logos/phonepe-icon.svg?v=2' },
                            { name: 'Paytm', logo: '/assets/logos/paytm.svg' },
                            { name: 'Amazon Pay', logo: '/assets/logos/amazonpay.svg' },
                            { name: 'BHIM UPI', logo: 'https://img.icons8.com/color/96/000000/bhim.png' },
                            { name: 'Apple Pay', logo: 'https://img.icons8.com/ios-filled/96/000000/mac-os.png' },
                            { name: 'IDFC First Bank', logo: 'https://cdn.razorpay.com/bank/IDFB.gif' },
                            { name: 'RBL Bank', logo: 'https://cdn.razorpay.com/bank/RATN.gif' },
                            { name: 'SWIFT', logo: 'https://img.icons8.com/color/96/000000/swift.png' },
                            { name: 'SEPA (Europe)', logo: '/assets/logos/sepa.svg?v=3' },
                            { name: 'MobiKwik', logo: '/assets/logos/mobikwik-icon.png?v=2' },
                            { name: 'iMobile', logo: 'https://cdn.razorpay.com/bank/ICIC.gif' }
                        ].map((bank, j) => (
                            <div key={`b2-${j}`} className="flex items-center gap-3 px-6 py-2 whitespace-nowrap opacity-80 hover:opacity-100 transition-opacity">
                                <img src={bank.logo} alt={bank.name} className={`h-10 w-auto object-contain drop-shadow-sm ${(bank as any).scale || ''}`} />
                                <span className="font-bold tracking-tight text-lg text-slate-700">{bank.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-12 text-center opacity-80 flex justify-center items-center gap-2 grayscale brightness-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Secured by</span>
            <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-4 object-contain" />
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
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#333] mb-4 shrink-0">
                                    {displayData[leftIndex]?.photoURL ? (
                                        <img src={displayData[leftIndex].photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-700 text-white flex items-center justify-center font-bold text-lg">{displayData[leftIndex]?.name?.charAt(0) || "U"}</div>
                                    )}
                                </div>
                                <div className="flex-grow overflow-y-auto w-full px-2 mb-2 custom-scrollbar">
                                    <p className="text-sm text-slate-400 italic">"{displayData[leftIndex]?.text}"</p>
                                </div>
                                <div className="mt-2 shrink-0">
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
                                <div className="flex-grow overflow-y-auto w-full px-2 mb-4 custom-scrollbar">
                                    <p className="text-base text-white leading-relaxed">"{displayData[centerIndex]?.text}"</p>
                                </div>
                                <div className="mt-2 shrink-0">
                                    <p className="text-sm text-slate-300">- {displayData[centerIndex]?.name}{displayData[centerIndex]?.designation && `, ${displayData[centerIndex].designation}`}</p>
                                </div>
                            </div>

                            {/* Right Card */}
                            <div className="absolute right-0 w-[30%] lg:w-[28%] h-[300px] bg-[#1a1a1a] rounded-xl shadow-lg opacity-40 scale-90 transition-all duration-500 ease-in-out p-6 flex flex-col justify-between hidden md:flex items-center text-center cursor-pointer" onClick={() => setActiveTestimonialIndex(rightIndex)}>
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#333] mb-4 shrink-0">
                                    {displayData[rightIndex]?.photoURL ? (
                                        <img src={displayData[rightIndex].photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-700 text-white flex items-center justify-center font-bold text-lg">{displayData[rightIndex]?.name?.charAt(0) || "U"}</div>
                                    )}
                                </div>
                                <div className="flex-grow overflow-y-auto w-full px-2 mb-2 custom-scrollbar">
                                    <p className="text-sm text-slate-400 italic">"{displayData[rightIndex]?.text}"</p>
                                </div>
                                <div className="mt-2 shrink-0">
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

                    <div className="mt-8 rounded-xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-100">
                        <iframe 
                            src="https://maps.google.com/maps?q=Patanwala%20Industrial%20Estate,%20Mumbai&t=k&z=17&ie=UTF8&iwloc=&output=embed" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen={false} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
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
                            <div className="space-y-2 text-center md:text-left mb-4">
                                <h3 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">Send Us a Message</h3>
                                <p className="text-[13px] text-slate-550 leading-relaxed">
                                    We’d love to hear from you! Whether you need support, have a question, or are interested in working together, just enter your message in the field below. Please provide your name and email so we can follow up with you directly. Our coordination team aims to respond to all inquiries within one business day. We're here and ready to help!
                                </p>
                            </div>
                            
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

    {/* Patron Recognition Section */}
    <section id="patrons" className="py-24 bg-[#0a0f1d] text-white border-t border-white/5 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brandBlue/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brandBlue/10 text-brandBlue border border-brandBlue/20 rounded-full text-xs font-extrabold uppercase tracking-widest">
                    <i className="fa-solid fa-medal text-amber-400"></i> Patron Recognition
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
                    Our Valued Patrons &amp; Donors
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                    We extend our deepest gratitude to the visionary individuals and organizations who support our mission. 
                    Your contributions make international recognition and scholarly growth possible.
                </p>
            </div>

            {recentDonors.length === 0 ? (
                <div className="max-w-md mx-auto bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 text-center space-y-6">
                    <div className="size-16 rounded-full bg-slate-800/80 text-brandBlue flex items-center justify-center mx-auto shadow-inner">
                        <i className="fa-solid fa-heart-pulse text-3xl"></i>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">Become Our First Patron</h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Join us in supporting leadership excellence and scholarship. 
                            Choose to display your name here to inspire others.
                        </p>
                    </div>
                    <Link 
                        href="/donate" 
                        className="inline-flex items-center gap-2 bg-brandBlue text-white font-bold px-6 py-3 rounded-xl text-xs hover:bg-brandBlue/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brandBlue/20"
                    >
                        <i className="fa-solid fa-hand-holding-heart"></i> Become a Patron
                    </Link>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {recentDonors.map((donor, idx) => {
                            const nameInitial = donor.name ? donor.name.charAt(0).toUpperCase() : 'P';
                            const isHighPatron = donor.amount >= 2500 || donor.purpose === 'Patron Membership';
                            return (
                                <motion.div
                                    key={donor.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-brandBlue/35 p-5 rounded-2xl flex flex-col items-center text-center gap-3 transition-all hover:scale-[1.03] group relative"
                                >
                                    {isHighPatron && (
                                        <div className="absolute top-2 right-2 text-amber-400 text-xs animate-pulse">
                                            <i className="fa-solid fa-crown"></i>
                                        </div>
                                    )}
                                    <div className="size-12 rounded-full bg-gradient-to-tr from-brandBlue to-blue-500 text-white font-black font-display text-base flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        {nameInitial}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-slate-100 group-hover:text-brandBlue transition-colors line-clamp-1">{donor.name}</p>
                                        <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{donor.purpose}</p>
                                    </div>
                                    <div className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-brandBlue/90">
                                        ₹{donor.amount.toLocaleString('en-IN')}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="text-center">
                        <Link 
                            href="/donate" 
                            className="inline-flex items-center gap-2 bg-brandBlue text-white font-bold px-8 py-3.5 rounded-xl text-xs hover:bg-brandBlue/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brandBlue/20"
                        >
                            <i className="fa-solid fa-circle-dollar-to-slot"></i> Join Our Patron List
                        </Link>
                    </div>
                </div>
            )}
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
