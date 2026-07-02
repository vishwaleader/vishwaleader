"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import Preloader from "@/components/Preloader";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader, SidebarFooter, SidebarRail, SidebarInset, SidebarTrigger
} from "@/components/ui/sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  LayoutDashboard, User as UserIcon, FileText, BookOpen, LogOut, Search, 
  MapPin, Calendar, Mail, Phone, Bookmark, Trash2, Plus, Download, CheckCircle, Clock 
} from "lucide-react";

export default function MemberClientPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any>({
    name: "",
    email: "",
    photoURL: "",
    designation: "Member Delegate",
    organization: "Independent Scholar",
    country: "India",
    phone: "",
    bio: "Delegate participating in Vishwa Leader research panels."
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'submissions' | 'vault'>('dashboard');

  // Profile forms state
  const [profileName, setProfileName] = useState("");
  const [profileDesignation, setProfileDesignation] = useState("");
  const [profileOrganization, setProfileOrganization] = useState("");
  const [profileCountry, setProfileCountry] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subTitle, setSubTitle] = useState("");
  const [subAuthors, setSubAuthors] = useState("");
  const [subTheme, setSubTheme] = useState("equality");
  const [subAbstract, setSubAbstract] = useState("");
  const [subFileName, setSubFileName] = useState("");

  // Toast status alert
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // Auth subscriber hook
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document in firestore with local catch fallbacks
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMemberData(data);
          } else {
            const newMember = {
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
              role: 'member',
              joinedAt: new Date().toISOString(),
              designation: "Member Delegate",
              organization: "Independent Scholar",
              country: "India",
              phone: "",
              bio: "Delegate participating in Vishwa Leader research panels."
            };
            await setDoc(userRef, newMember);
            setMemberData(newMember);
          }
        } catch (e) {
          console.error("Error fetching firestore document:", e);
          // Set standard defaults so dashboard is NEVER blank
          setMemberData({
            name: currentUser.displayName || "Delegate",
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || "",
            role: 'member',
            joinedAt: new Date().toISOString(),
            designation: "Member Delegate",
            organization: "Independent Scholar",
            country: "India",
            phone: "",
            bio: "Delegate participating in Vishwa Leader research panels."
          });
        }
      } else {
        setMemberData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync state variables once memberData is loaded
  useEffect(() => {
    if (memberData) {
      setProfileName(memberData.name || "");
      setProfileDesignation(memberData.designation || "Member Delegate");
      setProfileOrganization(memberData.organization || "Independent Scholar");
      setProfileCountry(memberData.country || "India");
      setProfilePhone(memberData.phone || "");
      setProfileBio(memberData.bio || "Delegate participating in Vishwa Leader research panels.");
    }
  }, [memberData]);

  // Load submissions list dynamically from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchSubmissions = async () => {
      try {
        const q = query(collection(db, "submissions"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setSubmissions(list);
      } catch (err) {
        console.error("Error loading submissions:", err);
      }
    };
    fetchSubmissions();
  }, [user]);

  // Google Login action
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      showToast("Authentication failed.");
    }
  };

  // Sign out action
  const handleLogout = async () => {
    await signOut(auth);
    showToast("Signed out successfully.");
  };

  // Update profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const updatedData = {
        name: profileName,
        designation: profileDesignation,
        organization: profileOrganization,
        country: profileCountry,
        phone: profilePhone,
        bio: profileBio
      };
      await updateDoc(userRef, updatedData);
      setMemberData((prev: any) => ({ ...prev, ...updatedData }));
      showToast("Profile details updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Failed to save profile settings.");
    }
  };

  // Add paper submission handler
  const handleAddSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const newSub = {
        title: subTitle,
        authors: subAuthors,
        theme: subTheme,
        abstract: subAbstract,
        fileName: subFileName || "AbstractDraft.docx",
        status: "pending",
        userId: user.uid,
        userEmail: user.email,
        submittedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "submissions"), newSub);
      setSubmissions((prev) => [...prev, { id: docRef.id, ...newSub }]);
      
      // Reset form
      setSubTitle("");
      setSubAuthors("");
      setSubTheme("equality");
      setSubAbstract("");
      setSubFileName("");
      setShowSubForm(false);
      
      showToast("Abstract draft registered successfully!");
    } catch (err) {
      console.error("Error creating submission:", err);
      showToast("Failed to save submission draft.");
    }
  };

  // Cancel/Delete paper submission
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this submission?")) return;
    try {
      await deleteDoc(doc(db, "submissions", id));
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      showToast("Submission cancelled.");
    } catch (err) {
      console.error("Error deleting submission:", err);
      showToast("Failed to cancel submission.");
    }
  };

  // Publications mock list
  const vaultPublications = [
    {
      title: "SOAS London Summit Brochure 2026",
      desc: "Official delegate handbook containing schedule breakdowns, seminar maps, and guest listings.",
      format: "PDF Document",
      size: "4.8 MB",
      date: "2026-06-15",
      file: "/magazine-covers/1001702555.jpg"
    },
    {
      title: "Vishwa Leader Ambedkar Memorial Issue",
      desc: "Mahaparinirvan Din special compilation covering human rights and social justice essays.",
      format: "PDF Document",
      size: "9.1 MB",
      date: "2016-12-06",
      file: "/magazine-covers/1001702550.jpg"
    },
    {
      title: "Ambedkar Journal of Legal Equality Vol. 12",
      desc: "Scholarly publications registry including constitutional safeguards and inclusive developments.",
      format: "PDF Document",
      size: "12.4 MB",
      date: "2016-04-14",
      file: "/magazine-covers/1001702539.jpg"
    }
  ];

  return (
    <>
      <Preloader loading={loading} />

      {/* Unauthenticated View: Sign In */}
      {!loading && !user && (
        <div className="animate-fade-in-slow w-full flex justify-center items-center">
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
                  .cp-mbtn-google { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 12px 16px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; color: #334155; font-size: 14px; font-weight: 700; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s ease-in-out; text-shadow: none; }
                  .cp-mbtn-google:hover { background-color: #f8fafc; border-color: #94a3b8; }
                  .cp-mbtn-google:active { transform: scale(0.98); }
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
                  <button onClick={handleGoogleLogin} className="cp-mbtn-google">
                      <svg style={{ width:18, height:18, flexShrink:0 }} viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
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
        </div>
      )}

      {/* Authenticated View: Collapsible Sidebar + Shadcn layout panels */}
      {!loading && user && (
        <div className="w-full flex min-h-screen bg-slate-950 text-slate-100 font-sans">
          <SidebarProvider>
            
            {/* Sidebar wrapper */}
            <Sidebar variant="inset" collapsible="icon" className="border-r border-slate-900 bg-slate-950">
              <SidebarHeader className="border-b border-slate-900 px-4 py-3">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" render={<div />} className="hover:bg-slate-900/50">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                        <img src="/assets/images/vishwaleader-logo-globe.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-bold text-sm tracking-tight text-white">VishwaLeader Member</span>
                        <span className="text-[9px] text-slate-500 font-mono tracking-wider">PANEL PORTAL</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>

              <SidebarContent>
                {/* Operations tabs selectors */}
                <SidebarGroup>
                  <SidebarGroupLabel className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-3 mb-1">Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'dashboard'} 
                          onClick={() => setActiveTab('dashboard')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'dashboard' 
                              ? 'bg-brandBlue text-white shadow-lg shadow-brandBlue/15 font-semibold' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                          }`}
                        >
                          <LayoutDashboard className="size-4 shrink-0 mr-2" />
                          <span>Overview Dashboard</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'profile'} 
                          onClick={() => setActiveTab('profile')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'profile' 
                              ? 'bg-brandBlue text-white shadow-lg shadow-brandBlue/15 font-semibold' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                          }`}
                        >
                          <UserIcon className="size-4 shrink-0 mr-2" />
                          <span>Edit Profile Settings</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'submissions'} 
                          onClick={() => setActiveTab('submissions')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'submissions' 
                              ? 'bg-brandBlue text-white shadow-lg shadow-brandBlue/15 font-semibold' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                          }`}
                        >
                          <FileText className="size-4 shrink-0 mr-2" />
                          <span>SOAS Submissions</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'vault'} 
                          onClick={() => setActiveTab('vault')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'vault' 
                              ? 'bg-brandBlue text-white shadow-lg shadow-brandBlue/15 font-semibold' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                          }`}
                        >
                          <BookOpen className="size-4 shrink-0 mr-2" />
                          <span>Publications Vault</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-slate-900 p-3">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => window.location.href = "/"}
                      className="w-full justify-start text-xs font-medium py-2 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                    >
                      <LogOut className="size-4 rotate-180 shrink-0 mr-2" />
                      <span>Return to Website</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={handleLogout}
                      className="w-full justify-start text-xs font-medium py-2.5 px-3 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-950/20"
                    >
                      <LogOut className="size-4 shrink-0 mr-2" />
                      <span>Sign Out Session</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
              <SidebarRail />
            </Sidebar>

            {/* Inset Main Pane */}
            <SidebarInset className="bg-slate-950">
              {/* Sticky Header bar */}
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-900 px-6 gap-4 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="text-slate-400 hover:text-white" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#" className="text-slate-500 hover:text-slate-300">Member Portal</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block text-slate-700" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-white capitalize font-semibold">
                          {activeTab === 'dashboard' && 'Dashboard Overview'}
                          {activeTab === 'profile' && 'Profile Settings'}
                          {activeTab === 'submissions' && 'Abstract Submissions'}
                          {activeTab === 'vault' && 'Publications Vault'}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-200">{memberData?.name || user.displayName || "Delegate"}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Member ID: VL-2026-{(user.uid.substring(0, 4)).toUpperCase()}</p>
                  </div>
                  <img src={user.photoURL || "https://placehold.co/100x100"} alt="" className="w-8 h-8 rounded-full border border-slate-800 object-cover" />
                </div>
              </header>

              {/* Main Workspace Scroll View */}
              <main className="flex-grow p-6 md:p-8 space-y-6 max-w-6xl w-full">
                
                {/* ═════════════════════ TAB: DASHBOARD OVERVIEW ═════════════════════ */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">Overview Dashboard</h2>
                        <p className="text-xs text-slate-550 mt-0.5 font-medium">Welcome back! Review your active credentials and details below.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Left: ID Card widget (5 cols) */}
                      <div className="md:col-span-5 space-y-4">
                        <Card className="border-slate-800 bg-slate-900 text-white relative overflow-hidden p-6 rounded-2xl shadow-xl flex flex-col justify-between aspect-[1.586/1] w-full select-none group">
                          {/* Ambient glow details */}
                          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-brandBlue/20 blur-3xl pointer-events-none transition-all group-hover:scale-125"></div>
                          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none transition-all group-hover:scale-125"></div>
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent"></div>

                          {/* Card Top */}
                          <div className="flex items-center justify-between border-b border-white/10 pb-3.5 relative z-10">
                            <div className="flex items-center gap-2">
                              <img src="/assets/images/vishwaleader-logo-globe.png" className="h-5 w-auto" alt="Logo" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Vishwa Leader</span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/5">
                              Member Card
                            </span>
                          </div>

                          {/* Card Middle */}
                          <div className="flex gap-4 items-center my-3 relative z-10">
                            <div className="relative shrink-0">
                              <img 
                                src={user.photoURL || "https://placehold.co/150x150/0a1e4b/ffffff?text=User"} 
                                className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-md bg-slate-950" 
                                alt="" 
                              />
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Session"></div>
                            </div>
                            <div className="flex-grow space-y-0.5 overflow-hidden">
                              <h3 className="font-display text-sm font-extrabold leading-tight truncate text-white">{memberData?.name || user.displayName || "Delegate User"}</h3>
                              <p className="text-[10px] text-slate-405 truncate">{memberData?.designation || "Member Delegate"}</p>
                              <p className="text-[9px] text-slate-500 leading-none flex items-center gap-1">
                                <MapPin className="size-3 text-slate-600" />
                                <span>{memberData?.country || "India"}</span>
                              </p>
                            </div>
                          </div>

                          {/* Card Bottom */}
                          <div className="flex items-end justify-between border-t border-white/10 pt-3 relative z-10">
                            <div className="space-y-0.5">
                              <div className="text-[7px] font-bold text-slate-600 uppercase tracking-wider">Member ID</div>
                              <div className="text-[10px] font-mono font-bold text-brandBlue">
                                VL-2026-{(user.uid.substring(0, 5)).toUpperCase()}
                              </div>
                            </div>
                            <div className="space-y-0.5 text-right">
                              <div className="text-[7px] font-bold text-slate-600 uppercase tracking-wider">Member Since</div>
                              <div className="text-[10px] font-mono font-bold text-slate-350">
                                {memberData?.joinedAt ? new Date(memberData.joinedAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : '2026'}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Right: Quick Stats & Bio (7 cols) */}
                      <div className="md:col-span-7 space-y-6">
                        <Card className="border-slate-900 bg-slate-900/30 p-6 rounded-2xl space-y-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Membership Summary</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Draft Submissions</span>
                              <p className="text-2xl font-black text-white">{submissions.length}</p>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Vault Publications</span>
                              <p className="text-2xl font-black text-white">{vaultPublications.length}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1 border-t border-slate-900 pt-4">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Short Bio / Profile Statement</span>
                            <p className="text-xs text-slate-300 leading-relaxed italic">{memberData?.bio || "No biography provided. Click 'Edit Profile Settings' in the sidebar navigation to define one."}</p>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════ TAB: PROFILE SETTINGS ═════════════════════ */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">Edit Profile</h2>
                        <p className="text-xs text-slate-555 mt-0.5 font-medium">Customize your delegate details saved in the registry.</p>
                      </div>
                    </div>

                    <Card className="border-slate-900 bg-slate-900/20 max-w-2xl rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Membership profile information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                              <Input 
                                type="text" 
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="bg-slate-900 border-slate-800 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue outline-none placeholder:text-slate-500" 
                                placeholder="Full Name" 
                                required 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Designation / Profession</label>
                              <Input 
                                type="text" 
                                value={profileDesignation}
                                onChange={(e) => setProfileDesignation(e.target.value)}
                                className="bg-slate-900 border-slate-800 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue outline-none placeholder:text-slate-500" 
                                placeholder="Profession / Job Title" 
                                required 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Organization / University</label>
                              <Input 
                                type="text" 
                                value={profileOrganization}
                                onChange={(e) => setProfileOrganization(e.target.value)}
                                className="bg-slate-900 border-slate-800 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue outline-none placeholder:text-slate-500" 
                                placeholder="Organization Name" 
                                required 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone number</label>
                              <Input 
                                type="text" 
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                className="bg-slate-900 border-slate-800 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue outline-none placeholder:text-slate-500" 
                                placeholder="Phone number" 
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Country of Residence</label>
                            <Input 
                              type="text" 
                              value={profileCountry}
                              onChange={(e) => setProfileCountry(e.target.value)}
                              className="bg-slate-900 border-slate-800 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue outline-none placeholder:text-slate-500" 
                              placeholder="Country Name" 
                              required 
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Short Biography Statement</label>
                            <textarea 
                              value={profileBio}
                              onChange={(e) => setProfileBio(e.target.value)}
                              rows={3}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-slate-100 placeholder:text-slate-500"
                              placeholder="Tell the registry about your background, publications, or research fields..."
                            />
                          </div>

                          <Button type="submit" className="w-full bg-brandBlue hover:bg-brandBlue/90 text-white font-bold h-11 rounded-xl text-xs uppercase tracking-wider">
                            Save Profile Settings
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ═════════════════════ TAB: ABSTRACT SUBMISSIONS ═════════════════════ */}
                {activeTab === 'submissions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">SOAS Conference Submissions</h2>
                        <p className="text-xs text-slate-550 mt-0.5 font-medium">Submit abstracts and manage co-authors for the upcoming London Summit.</p>
                      </div>
                      
                      {!showSubForm && (
                        <Button 
                          onClick={() => setShowSubForm(true)}
                          className="bg-brandBlue/10 hover:bg-brandBlue/20 text-brandBlue hover:text-brandBlue font-bold px-4 py-2 text-xs rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Plus className="size-4" />
                          <span>New Submission Draft</span>
                        </Button>
                      )}
                    </div>

                    {/* New Draft Form Panel */}
                    {showSubForm && (
                      <Card className="border-slate-800 bg-slate-900/60 p-6 rounded-2xl max-w-2xl">
                        <CardHeader className="px-0 pt-0 pb-4">
                          <CardTitle className="text-white text-base font-bold uppercase tracking-wider">New Submission Registration</CardTitle>
                          <CardDescription className="text-xs text-slate-455">Complete all abstract fields to submit your registration document.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                          <form onSubmit={handleAddSubmission} className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Abstract / Paper Title</label>
                              <Input 
                                type="text" 
                                value={subTitle}
                                onChange={(e) => setSubTitle(e.target.value)}
                                className="bg-slate-900 border-slate-850 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue placeholder:text-slate-500" 
                                placeholder="Paper Title" 
                                required 
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Co-Authors (If Any)</label>
                                <Input 
                                  type="text" 
                                  value={subAuthors}
                                  onChange={(e) => setSubAuthors(e.target.value)}
                                  className="bg-slate-900 border-slate-850 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue placeholder:text-slate-500" 
                                  placeholder="e.g. Dr. John Smith, Prof. Jane Doe" 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conference Theme</label>
                                <select 
                                  value={subTheme}
                                  onChange={(e) => setSubTheme(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-100"
                                >
                                  <option value="equality">Reimagining Equality and Justice</option>
                                  <option value="empowerment">Diaspora Empowerment & Global Alliances</option>
                                  <option value="constitutionalism">Constitutional Values & Human Rights</option>
                                  <option value="representation">Inclusive Development & Economic Partnerships</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Abstract Description (Max 500 words)</label>
                              <textarea 
                                value={subAbstract}
                                onChange={(e) => setSubAbstract(e.target.value)}
                                rows={4} 
                                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue placeholder:text-slate-500" 
                                placeholder="Outline thesis statements, research systems, and target conclusions..." 
                                required 
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Name reference (e.g. abstract_draft.pdf)</label>
                              <Input 
                                type="text" 
                                value={subFileName}
                                onChange={(e) => setSubFileName(e.target.value)}
                                className="bg-slate-900 border-slate-850 text-xs rounded-xl focus:border-brandBlue text-slate-100 focus:ring-1 focus:ring-brandBlue placeholder:text-slate-500" 
                                placeholder="e.g. global_alliances_draft.pdf" 
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button type="submit" className="flex-grow bg-brandBlue hover:bg-brandBlue/90 text-white font-bold h-10 rounded-xl text-xs uppercase tracking-wider">
                                Register Submission Document
                              </Button>
                              <Button 
                                type="button" 
                                onClick={() => setShowSubForm(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold h-10 px-5 rounded-xl text-xs uppercase tracking-wider"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Submissions List Grid Table */}
                    <Card className="border-slate-900 bg-slate-900/20 rounded-2xl overflow-hidden">
                      <CardContent className="p-0">
                        {submissions.length > 0 ? (
                          <Table>
                            <TableHeader className="bg-slate-900/50">
                              <TableRow className="border-slate-850 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-4 pl-6">Abstract Title</TableHead>
                                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-4">Theme</TableHead>
                                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-4">Draft Reference</TableHead>
                                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-4">Status</TableHead>
                                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-4 text-right pr-6">Cancel</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {submissions.map((sub) => (
                                <TableRow key={sub.id} className="border-slate-900 hover:bg-slate-900/10">
                                  <TableCell className="font-medium text-slate-100 py-4 pl-6">
                                    <div>
                                      <p className="font-bold text-xs">{sub.title}</p>
                                      <p className="text-[9px] text-slate-500 mt-0.5">Co-authors: {sub.authors || "None"}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="capitalize text-slate-350 text-xs py-4">{sub.theme}</TableCell>
                                  <TableCell className="text-slate-400 font-mono text-[10px] py-4">{sub.fileName || "AbstractDraft.docx"}</TableCell>
                                  <TableCell className="py-4">
                                    {sub.status === 'pending' ? (
                                      <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5 text-[8px] font-bold tracking-widest uppercase">
                                        <Clock className="size-3 mr-1" /> Pending Review
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 text-[8px] font-bold tracking-widest uppercase">
                                        <CheckCircle className="size-3 mr-1" /> Approved
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right pr-6 py-4">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={() => handleDeleteSubmission(sub.id)}
                                      className="text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg size-8"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-20 space-y-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-600 mx-auto">
                              <FileText className="size-5" />
                            </div>
                            <h4 className="font-black text-slate-400 text-xs uppercase tracking-wider">No Submissions Found</h4>
                            <p className="text-[11px] text-slate-550 max-w-xs mx-auto">
                              You haven&apos;t registered any research papers yet. Click &apos;New Submission Draft&apos; to submit.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ═════════════════════ TAB: PUBLICATIONS VAULT ═════════════════════ */}
                {activeTab === 'vault' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">Publications Vault</h2>
                        <p className="text-xs text-slate-550 mt-0.5 font-medium">Access exclusive publications and PDF issues compiled by Vishwa Leader.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {vaultPublications.map((pub) => (
                        <Card key={pub.title} className="border-slate-900 bg-slate-900/30 flex flex-col justify-between rounded-2xl overflow-hidden hover:border-slate-800 transition-colors">
                          <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden shrink-0">
                            <img src={pub.file} alt={pub.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                          </div>
                          
                          <CardHeader className="p-4 space-y-1">
                            <CardTitle className="text-white text-sm font-bold line-clamp-1">{pub.title}</CardTitle>
                            <CardDescription className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-light">{pub.desc}</CardDescription>
                          </CardHeader>

                          <CardContent className="px-4 pb-4 pt-0">
                            <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 text-[9px] font-mono text-slate-555 font-medium">
                              <span>{pub.format} ({pub.size})</span>
                              <span>{pub.date}</span>
                            </div>
                          </CardContent>

                          <CardFooter className="px-4 pb-4 pt-0">
                            <Button 
                              onClick={() => {
                                window.open(pub.file, '_blank');
                                showToast("Initiating PDF document view!");
                              }}
                              className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2"
                            >
                              <Download className="size-3.5" />
                              <span>Download Document</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              </main>

              {/* Corporate Footer */}
              <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-[10px] text-slate-650 font-normal">
                <p>© 2026 Vishwa Leader Techmedia Private Limited. All Rights Reserved.</p>
              </footer>

            </SidebarInset>

          </SidebarProvider>
        </div>
      )}

      {/* Floating status alert toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 border border-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 animate-slide-up flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}
