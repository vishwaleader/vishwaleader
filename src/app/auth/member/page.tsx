"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";


export default function Page() {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setMemberData(docSnap.data());
        } else {
          const newMember = {
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            role: 'member',
            joinedAt: new Date().toISOString()
          };
          await setDoc(userRef, newMember);
          setMemberData(newMember);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      

    
    
    {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}


    {/* Navigation Header */}
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
                <a href="/" className="group flex items-center gap-2 md:gap-3">
                    <img src="/assets/images/vishwaleader-logo-hd.png" 
                         alt="Vishwa Leader Logo" 
                         className="h-9 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
                          />
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="text-base md:text-lg font-black tracking-tight text-brandBlue font-display">Vishwa Leader</span>
                        <span className="text-[9px] md:text-[10px] font-black tracking-widest text-brandBlue uppercase border border-brandBlue/20 px-2 py-0.5 rounded bg-brandBlue/5 self-start">Techmedia</span>
                    </div>
                </a>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                <a href="/" className="hover:text-brandBlue transition-colors">Home</a>
                <a href="gallery" className="hover:text-brandBlue transition-colors">Gallery</a>
                <a href="archives" className="hover:text-brandBlue transition-colors">Archive</a>

                {user && (
                <div id="header-user-badge" className="flex items-center gap-3 border-l border-slate-200 pl-6">
                    <span id="header-username" className="text-xs font-bold text-slate-700">{user?.displayName}</span>
                    <button  className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-rose-500 font-bold transition-all uppercase tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-sign-out-alt"></i> Out
                    </button>
                </div>
                )}
            </nav>

            {/* Mobile Hamburger Menu Button */}
            <button id="menuBtn" className="md:hidden relative w-10 h-10 text-slate-800 hover:text-brandBlue focus:outline-none flex items-center justify-center" aria-label="Toggle Menu">
                <div className="w-6 h-4 flex flex-col justify-between items-center relative">
                    <span className="w-full h-0.5 bg-slate-800 rounded transition-all duration-300 transform" id="bar1"></span>
                    <span className="w-full h-0.5 bg-slate-800 rounded transition-all duration-300 transform" id="bar2"></span>
                    <span className="w-full h-0.5 bg-slate-800 rounded transition-all duration-300 transform" id="bar3"></span>
                </div>
            </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div id="mobileMenu" className="md:hidden max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-200 px-4 space-y-1 shadow-inner">
            <div className="py-3 space-y-1.5">
                <a href="/" className="flex items-center py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-brandBlue active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-house text-slate-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Home</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
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
                <a href="admin" className="flex items-center py-2.5 px-3 text-sm font-semibold text-indigo-600 hover:text-indigo-750 active:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                    <i className="fa-solid fa-user-shield text-indigo-400 mr-3 w-5 text-center text-xs"></i>
                    <span>Login as Team</span>
                    <i className="fa-solid fa-chevron-right text-slate-300 ml-auto text-[9px]"></i>
                </a>
                {user && (
<div id="mobile-user-badge" className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-brandBlue shrink-0"><i className="fa-solid fa-user"></i></div>
                        <div className="overflow-hidden flex-1">
                            <p id="mobile-username" className="text-xs font-bold text-slate-900 truncate">{user?.displayName}</p>
                            <p className="text-[9px] font-extrabold uppercase tracking-wider text-brandBlue">Active Session</p>
                        </div>
                    </div>
                    <button  className="flex items-center py-2.5 px-3 text-sm font-semibold text-rose-600 hover:text-rose-750 active:bg-rose-50 rounded-xl transition-all w-full text-left">
                        <i className="fa-solid fa-right-from-bracket text-rose-500 mr-3 w-5 text-center text-xs"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
)}
            </div>
        </div>
    </header>

    <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-12 flex flex-col justify-center items-center">
        {loading ? (
          <>
            <div id="auth-spinner" className="flex flex-col items-center gap-4 py-20">
            <i className="fa-solid fa-circle-notch animate-spin text-4xl text-brandBlue"></i>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verifying Membership Session...</p>
        </div>
        </>
) : !user ? (
          <>
        {/* Unauthenticated View: Sign In */}
        <div id="login-card" className="block cp-member-login-wrapper" style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, top: 0, zIndex: 9999,
            fontFamily: "'Open Sans', sans-serif", overflow: 'hidden',
            background: "url('/assets/images/EkJYDaGD-fond-decran-Bouddha-54.png') no-repeat center center",
            backgroundSize: 'cover'
        }}>
            <style dangerouslySetInnerHTML={{__html: `
                .cp-mbtn { display: inline-block; padding: 4px 10px 4px; margin-bottom: 0; font-size: 13px; line-height: 18px; color: #333333; text-align: center; text-shadow: 0 1px 1px rgba(255,255,255,0.75); vertical-align: middle; background-color: #f5f5f5; background-image: linear-gradient(to bottom, #ffffff, #e6e6e6); border: 1px solid #e6e6e6; border-radius: 4px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.05); cursor: pointer; }
                .cp-mbtn:hover { background-color: #e6e6e6; }
                .cp-mbtn-large { padding: 9px 14px; font-size: 15px; line-height: normal; border-radius: 5px; }
                .cp-mbtn-primary { background-color: #2563eb; background-image: linear-gradient(to bottom, #3b82f6, #1d4ed8); border: 1px solid #1e40af; text-shadow: 1px 1px 1px rgba(0,0,0,0.4); color: #ffffff; }
                .cp-mbtn-primary:hover { background-color: #1d4ed8; background-image: none; }
                .cp-mbtn-block { width: 100%; display: block; }
                .cp-mlogin { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 340px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); padding: 30px 20px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.4); }
                .cp-mlogin-logo { display: block; width: 160px; height: 160px; margin: 0 auto 16px auto; object-fit: contain; }
                .cp-mlogin h1 { color: #0f172a; letter-spacing: 1px; text-align: center; padding-bottom: 20px; font-weight: bold; margin: 0; font-size: 22px; }
                .cp-mback { text-align: center; margin-top: 15px; }
                .cp-mback a { font-size: 11px; font-weight: bold; color: #64748b; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
                .cp-mback a:hover { color: #2563eb; }
            `}} />
            <div className="cp-mlogin">
                <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="cp-mlogin-logo" />
                <h1>Member Login</h1>
                <button onClick={handleGoogleLogin} className="cp-mbtn cp-mbtn-primary cp-mbtn-block cp-mbtn-large">
                    <svg style={{ width:16, height:16, flexShrink:0 }} viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.31 7.37 9 5.04 12 5.04z"/>
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.96h3.9c2.28-2.1 3.55-5.19 3.55-8.68z"/>
                        <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.55 8.79 0 10.9 0 13.1c0 2.2.55 4.31 1.5 6.2l3.86-2.8z"/>
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.9-2.96c-1.08.72-2.47 1.16-4.06 1.16-3 0-5.69-2.33-6.64-5.46L1.5 15.69C3.4 19.54 7.35 23 12 23z"/>
                    </svg>
                    Continue with Google
                </button>
                <div className="cp-mback mt-3">
                    <a href="/auth/admin"><i className="fa-solid fa-user-shield"></i> Login as Team</a>
                </div>
                <div className="cp-mback">
                    <a href="/"><i className="fa-solid fa-arrow-left"></i> Back to Home</a>
                </div>
            </div>
        </div>
        </>
) : (
          <>
        {/* Authenticated View: Member Dashboard */}
        <div id="member-dashboard" className="block w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Panel: Profile and ID Card (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* Premium Member ID Card Widget */}
                <div className="relative overflow-hidden bg-brandDark text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-900 h-auto sm:aspect-[1.586/1] w-full flex flex-col justify-between group select-none">
                    {/* Subtle ambient glows */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brandBlue/20 blur-3xl pointer-events-none transition-all group-hover:scale-125"></div>
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none transition-all group-hover:scale-125"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent"></div>

                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                        <div className="flex items-center gap-2.5">
                            <img src="/assets/images/vishwaleader-logo-hd.png" className="h-6 w-auto brightness-0 invert" alt="Logo" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-350">Vishwa Leader</span>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-accentGold border border-accentGold/20 px-2 py-0.5 rounded bg-accentGold/5">
                            Member Card
                        </span>
                    </div>

                    {/* Card Body */}
                    <div className="flex gap-4 items-center my-4 relative z-10">
                        <div className="relative">
                            <img id="card-photo" src="https://placehold.co/150x150/0a1e4b/ffffff?text=User" className="w-16 h-16 rounded-xl object-cover border border-white/20 shadow-md bg-slate-900" alt="Profile" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-brandDark flex items-center justify-center" title="Online Member"></div>
                        </div>
                        <div className="flex-grow space-y-1 overflow-hidden">
                            <h3 id="card-name" className="font-display text-base font-extrabold leading-tight truncate">{user.displayName}</h3>
                            <p id="card-title" className="text-[10px] text-slate-300 font-medium truncate">Professional Title</p>
                            <p id="card-country" className="text-[9px] text-slate-450 leading-none"><i className="fa-solid fa-earth-americas mr-0.5"></i> Country</p>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-end justify-between border-t border-white/10 pt-4 relative z-10">
                        <div className="space-y-0.5">
                            <div className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Member Reference</div>
                            <div id="card-id" className="text-[10px] font-mono font-bold text-accentGold">VL-2026-XXXX</div>
                        </div>
                        <div className="space-y-0.5 text-right">
                            <div className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Member Since</div>
                            <div id="card-since" className="text-[10px] font-mono font-bold text-slate-300">Jun 30, 2026</div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                        <i className="fa-solid fa-id-card text-brandBlue text-sm"></i>
                        <h3 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">Membership Profile</h3>
                    </div>
                    
                    <form id="profile-form" className="space-y-4">
                        {/* Profile Pic */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Avatar Photo</label>
                            <div className="flex items-center gap-3">
                                <input type="file" id="profile-file-input" accept="image/*" className="hidden" />
                                <button type="button" className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg border border-slate-200 transition-colors">
                                    Choose Photo
                                </button>
                                <span id="profile-file-status" className="text-[10px] text-slate-400 italic">No file chosen</span>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <input type="text" id="profile-name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brandBlue focus:bg-white" placeholder="e.g. John Doe" required />
                        </div>

                        {/* Designation / Title */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Designation / Profession</label>
                            <input type="text" id="profile-designation" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brandBlue focus:bg-white" placeholder="e.g. Research Fellow" required />
                        </div>

                        {/* Company / Organization */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Organization / University</label>
                            <input type="text" id="profile-organization" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brandBlue focus:bg-white" placeholder="e.g. SOAS University of London" required />
                        </div>

                        {/* Country & Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Country</label>
                                <input type="text" id="profile-country" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brandBlue focus:bg-white" placeholder="e.g. United Kingdom" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                                <input type="text" id="profile-phone" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brandBlue focus:bg-white" placeholder="e.g. +44 7911 123456" required />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Short Bio</label>
                            <textarea id="profile-bio" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brandBlue focus:bg-white" placeholder="Introduce yourself to the global member registry..."></textarea>
                        </div>

                        <button type="submit" id="profile-save-btn" className="w-full bg-brandBlue hover:bg-brandBlue/90 text-white font-bold py-3 rounded-xl transition-all shadow text-xs uppercase tracking-wider">
                            Save Profile Settings
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Panel: Publications, Summit Registration, Paper Submissions (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Section 1: Member Downloads (Publications & PDF Archives) */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <i className="fa-solid fa-cloud-arrow-down text-brandBlue text-lg"></i>
                        <div>
                            <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wide">Member Publications Vault</h3>
                            <p className="text-[10px] text-slate-400">Access exclusive digital magazines, research books, and PDFs published by Vishwa Leader.</p>
                        </div>
                    </div>

                    {/* Grid of publication items */}
                    <div id="publications-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dynamic publication files loaded here */}
                    </div>

                    {/* Empty state */}
                    <div id="publications-empty" className="hidden text-center py-8 space-y-2">
                        <i className="fa-solid fa-file-pdf text-xl text-slate-300"></i>
                        <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">No member publications currently in vault</p>
                    </div>
                </div>

                {/* Section 2: SOAS London Conference Submission Portal */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-file-signature text-brandBlue text-lg"></i>
                            <div>
                                <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wide">SOAS Conference Submissions</h3>
                                <p className="text-[10px] text-slate-400">Register abstracts, co-authors, and human rights papers for the upcoming London Summit.</p>
                            </div>
                        </div>
                        <button id="new-sub-btn" className="bg-brandBlue/10 hover:bg-brandBlue/15 text-brandBlue font-bold px-4 py-2 rounded-xl transition-all text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <i className="fa-solid fa-plus"></i> New Draft
                        </button>
                    </div>

                    {/* Submission Form (Collapsed by default) */}
                    <form id="submission-form" className="hidden bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                        <input type="hidden" id="submission-id" value="" />
                        
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Paper / Abstract Title</label>
                            <input type="text" id="sub-title" className="w-full bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brandBlue" placeholder="e.g. Reevaluating Constitutional Protections for Marginalized Communities" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Co-Authors (If Any)</label>
                                <input type="text" id="sub-authors" className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none" placeholder="e.g. Prof. Jane Doe, Dr. Alice Smith" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Conference Theme</label>
                                <select id="sub-theme" className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none">
                                    <option value="equality">Reimagining Equality and Justice</option>
                                    <option value="empowerment">Diaspora Empowerment & Global Alliances</option>
                                    <option value="constitutionalism">Constitutional Values & Human Rights</option>
                                    <option value="representation">Inclusive Development & Economic Partnerships</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Abstract Description (Max 500 words)</label>
                            <textarea id="sub-abstract" rows={4} className="w-full bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brandBlue" placeholder="Outline the thesis statement, research methods, and findings of your proposed presentation..." required></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Draft File (.pdf, .doc, .docx)</label>
                                <div className="flex items-center gap-3">
                                    <input type="file" id="sub-file-input" accept=".pdf,.doc,.docx" className="hidden" />
                                    <button type="button" className="text-xs bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-lg border border-slate-250 transition-colors">
                                        Select File
                                    </button>
                                    <span id="sub-file-status" className="text-[10px] text-slate-405 italic truncate max-w-[150px]">No file selected</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" id="sub-save-btn" className="flex-grow bg-brandBlue hover:bg-brandBlue/90 text-white font-bold py-2.5 rounded-xl transition-all shadow text-[10px] uppercase tracking-wider">
                                    Submit Registration
                                </button>
                                <button type="button" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all text-[10px] uppercase tracking-wider">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Active Submissions Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                                    <th className="pb-3">Abstract Title</th>
                                    <th className="pb-3 pl-4">Theme</th>
                                    <th className="pb-3">Draft File</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="submissions-list-body" className="divide-y divide-slate-100">
                                {/* Dynamic submissions loaded here */}
                            </tbody>
                        </table>

                        {/* Empty state */}
                        <div id="submissions-empty" className="hidden text-center py-12 space-y-2">
                            <i className="fa-solid fa-file-lines text-2xl text-slate-200"></i>
                            <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">No conference registrations submitted yet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
)}
    </main>

    {/* Floating status alerts toast */}
    <div id="toast" className="fixed bottom-6 right-6 z-50 bg-emerald-500 border border-emerald-400 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-2xl transition-all duration-300 opacity-0 pointer-events-none translate-y-2 flex items-center gap-2">
        <i id="toast-icon" className="fa-solid fa-circle-check text-sm"></i>
        <span id="toast-msg">Success!</span>
    </div>

    {/* Corporate Footer */}
    <footer className="bg-brandDark text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs mb-8">
            <div className="md:col-span-4 space-y-4">
                <div className="flex items-center gap-3">
                    <img src="/assets/images/vishwaleader-logo-hd.png" className="h-10 w-auto brightness-0 invert" alt="Logo" />
                    <span className="text-[10px] font-black tracking-widest text-white uppercase border border-white/20 px-2 py-0.5 rounded bg-white/5">Member</span>
                </div>
                <p className="leading-relaxed text-slate-500">Connecting Ambedkarite intellectuals, entrepreneurs, and networks on a unified corporate and social platform.</p>
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

    {/* Script Block */}
    

    </>
  )
}
