"use client";

import React, { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/paymentActions";
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
  LayoutDashboard, User as UserIcon, FileText, LogOut, 
  MapPin, Plus, Trash2, CheckCircle, Clock, Upload, ShieldAlert, CreditCard, Camera, FileCheck 
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function MemberClientPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Registration and Firestore user document state
  const [memberData, setMemberData] = useState<any>({
    name: "",
    email: "",
    photoURL: "",
    designation: "Member Delegate",
    organization: "Independent Scholar",
    country: "India",
    phone: "",
    bio: "Delegate participating in Vishwa Leader research panels.",
    passportNumber: "",
    fullAddress: "",
    nominationCategory: "ambedkar-awards",
    dietaryNotes: "",
    paymentStatus: "Unpaid",
    headshotUrl: "",
    passportScanUrl: "",
    evidenceUrl: ""
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registration' | 'uploads' | 'payment' | 'submissions'>('dashboard');

  // Registration form field states
  const [profileName, setProfileName] = useState("");
  const [profileDesignation, setProfileDesignation] = useState("");
  const [profileOrganization, setProfileOrganization] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profilePassport, setProfilePassport] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCategory, setProfileCategory] = useState("ambedkar-awards");
  const [profileDietary, setProfileDietary] = useState("");
  const [profileCountry, setProfileCountry] = useState("India");

  // File Upload statuses
  const [headshotUploading, setHeadshotUploading] = useState(false);
  const [headshotProgress, setHeadshotProgress] = useState(0);

  const [passportUploading, setPassportUploading] = useState(false);
  const [passportProgress, setPassportProgress] = useState(0);

  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const [evidenceProgress, setEvidenceProgress] = useState(0);

  // Submissions lists states
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
        setLoading(false);

        // Fetch or create user document in firestore with local catch fallbacks
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMemberData((prev: any) => ({ ...prev, ...data }));
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
              bio: "Delegate participating in Vishwa Leader research panels.",
              passportNumber: "",
              fullAddress: "",
              nominationCategory: "ambedkar-awards",
              dietaryNotes: "",
              paymentStatus: "Unpaid",
              headshotUrl: "",
              passportScanUrl: "",
              evidenceUrl: ""
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
            bio: "Delegate participating in Vishwa Leader research panels.",
            passportNumber: "",
            fullAddress: "",
            nominationCategory: "ambedkar-awards",
            dietaryNotes: "",
            paymentStatus: "Unpaid",
            headshotUrl: "",
            passportScanUrl: "",
            evidenceUrl: ""
          });
        }
      } else {
        setMemberData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync state variables once memberData is loaded
  useEffect(() => {
    if (memberData) {
      setProfileName(memberData.name || "");
      setProfileDesignation(memberData.designation || "Member Delegate");
      setProfileOrganization(memberData.organization || "Independent Scholar");
      setProfilePhone(memberData.phone || "");
      setProfileBio(memberData.bio || "");
      setProfilePassport(memberData.passportNumber || "");
      setProfileAddress(memberData.fullAddress || "");
      setProfileCategory(memberData.nominationCategory || "ambedkar-awards");
      setProfileDietary(memberData.dietaryNotes || "");
      setProfileCountry(memberData.country || "India");
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

  // Dynamic Razorpay SDK loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Launch secure payment gateway checkout
  const handlePayment = async () => {
    if (!user) return;
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Could not load payment gateway script. Please verify your connection.");
      return;
    }

    // 1. Create order on the secure Server Action
    const feeINR = 5000; // Registration fee amount in INR
    const result = await createRazorpayOrder(feeINR);

    if (!result.success || !result.order) {
      alert(result.error || "Could not generate order order-id from checkout gateway.");
      return;
    }

    const { order } = result;

    // 2. Configure payment options with transaction verification callback
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Vishwa Leader Tech Media Pvt Ltd",
      description: "Dr. B. R. Ambedkar International Awards 2026 Registration",
      order_id: order.id,
      handler: async function (response: any) {
        setLoading(true);
        try {
          // 3. Verify Razorpay response signature securely on the server side
          const verifyRes = await verifyRazorpayPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
            user.uid
          );
          if (verifyRes.success) {
            setMemberData((prev: any) => ({ 
              ...prev, 
              paymentStatus: "Paid", 
              paymentId: response.razorpay_payment_id,
              paymentOrderId: response.razorpay_order_id 
            }));
            showToast("Payment completed and verified successfully!");
          } else {
            alert(`Signature verification failed: ${verifyRes.error}`);
          }
        } catch (e: any) {
          alert(`Verification error: ${e.message}`);
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: profileName || user.displayName || "",
        email: user.email || "",
        contact: profilePhone || ""
      },
      theme: {
        color: "#2563eb"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Firebase Storage upload helper
  const uploadFileToStorage = (file: File, type: 'headshot' | 'passportScan' | 'evidence') => {
    if (!user) return;
    
    // Set status
    if (type === 'headshot') { setHeadshotUploading(true); setHeadshotProgress(0); }
    if (type === 'passportScan') { setPassportUploading(true); setPassportProgress(0); }
    if (type === 'evidence') { setEvidenceUploading(true); setEvidenceProgress(0); }

    const storagePath = `users/${user.uid}/${type}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (type === 'headshot') setHeadshotProgress(progress);
        if (type === 'passportScan') setPassportProgress(progress);
        if (type === 'evidence') setEvidenceProgress(progress);
      }, 
      (error) => {
        console.error("Storage upload error:", error);
        showToast("File upload failed.");
        if (type === 'headshot') setHeadshotUploading(false);
        if (type === 'passportScan') setPassportUploading(false);
        if (type === 'evidence') setEvidenceUploading(false);
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save link directly to Firestore delegate profile
          const userRef = doc(db, "users", user.uid);
          const updateField = type === 'headshot' ? 'headshotUrl' : type === 'passportScan' ? 'passportScanUrl' : 'evidenceUrl';
          
          await updateDoc(userRef, { [updateField]: downloadURL });
          setMemberData((prev: any) => ({ ...prev, [updateField]: downloadURL }));
          showToast("Document loaded and registered successfully!");
        } catch (e) {
          console.error("Error setting firestore link:", e);
        } finally {
          if (type === 'headshot') setHeadshotUploading(false);
          if (type === 'passportScan') setPassportUploading(false);
          if (type === 'evidence') setEvidenceUploading(false);
        }
      }
    );
  };

  // Save delegate details form
  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const updatedData = {
        name: profileName,
        designation: profileDesignation,
        organization: profileOrganization,
        phone: profilePhone,
        bio: profileBio,
        passportNumber: profilePassport,
        fullAddress: profileAddress,
        nominationCategory: profileCategory,
        dietaryNotes: profileDietary,
        country: profileCountry
      };
      await updateDoc(userRef, updatedData);
      setMemberData((prev: any) => ({ ...prev, ...updatedData }));
      showToast("Delegate registration updated successfully!");
    } catch (err) {
      console.error("Error saving delegate form:", err);
      showToast("Failed to save registration.");
    }
  };

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

      {/* Authenticated View: Collapsible Sidebar + Shadcn layout panels in Admin White Theme */}
      {!loading && user && (
        <div className="w-full flex min-h-screen bg-slate-50 text-slate-900 font-sans">
          <SidebarProvider>
            
            {/* Sidebar wrapper */}
            <Sidebar variant="inset" collapsible="icon" className="border-r border-slate-200 bg-white">
              <SidebarHeader className="border-b border-slate-100 px-4 py-4 flex items-center justify-start shrink-0">
                <a href="/" className="flex items-center">
                  <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-9 w-auto object-contain" />
                </a>
              </SidebarHeader>

              <SidebarContent className="bg-white">
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
                              ? 'bg-slate-100 text-slate-900 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <LayoutDashboard className="size-4 shrink-0 mr-2 text-brandBlue" />
                          <span>Overview Dashboard</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'registration'} 
                          onClick={() => setActiveTab('registration')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'registration' 
                              ? 'bg-slate-100 text-slate-900 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <UserIcon className="size-4 shrink-0 mr-2 text-brandBlue" />
                          <span>Delegate Registration</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'uploads'} 
                          onClick={() => setActiveTab('uploads')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'uploads' 
                              ? 'bg-slate-100 text-slate-900 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <Upload className="size-4 shrink-0 mr-2 text-brandBlue" />
                          <span>Document Uploads</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'payment'} 
                          onClick={() => setActiveTab('payment')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'payment' 
                              ? 'bg-slate-100 text-slate-900 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <CreditCard className="size-4 shrink-0 mr-2 text-brandBlue" />
                          <span>Registration Payment</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          isActive={activeTab === 'submissions'} 
                          onClick={() => setActiveTab('submissions')}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                            activeTab === 'submissions' 
                              ? 'bg-slate-100 text-slate-900 font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <FileText className="size-4 shrink-0 mr-2 text-brandBlue" />
                          <span>SOAS Submissions</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-slate-100 p-3 bg-white">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => window.location.href = "/"}
                      className="w-full justify-start text-xs font-medium py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <LogOut className="size-4 rotate-180 shrink-0 mr-2" />
                      <span>Return to Website</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={handleLogout}
                      className="w-full justify-start text-xs font-medium py-2.5 px-3 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
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
            <SidebarInset className="bg-slate-50">
              {/* Sticky Header bar */}
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 gap-4 bg-white sticky top-0 z-30">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#" className="text-slate-550 hover:text-slate-700">Member Portal</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block text-slate-300" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-slate-900 capitalize font-semibold">
                          {activeTab === 'dashboard' && 'Dashboard Overview'}
                          {activeTab === 'registration' && 'Delegate Registration'}
                          {activeTab === 'uploads' && 'Document Upload Center'}
                          {activeTab === 'payment' && 'Fee Payment Gate'}
                          {activeTab === 'submissions' && 'Abstract Submissions'}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800">{memberData?.name || user.displayName || "Delegate"}</p>
                    <p className="text-[9px] text-slate-400 font-mono">Member ID: VL-2026-{(user.uid.substring(0, 4)).toUpperCase()}</p>
                  </div>
                  <img src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/100x100"} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                </div>
              </header>

              {/* Main Workspace Scroll View */}
              <main className="flex-grow p-6 md:p-8 space-y-6 max-w-6xl w-full">
                
                {/* ═════════════════════ TAB: DASHBOARD OVERVIEW ═════════════════════ */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Overview Dashboard</h2>
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
                              <img src="/assets/images/vishwaleader-logo-globe.png" className="h-5 w-auto brightness-0 invert" alt="Logo" />
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
                                src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/150x150/0a1e4b/ffffff?text=User"} 
                                className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-md bg-slate-950" 
                                alt="" 
                              />
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Session"></div>
                            </div>
                            <div className="flex-grow space-y-0.5 overflow-hidden">
                              <h3 className="font-display text-sm font-extrabold leading-tight truncate text-white">{memberData?.name || user.displayName || "Delegate User"}</h3>
                              <p className="text-[10px] text-slate-400 truncate">{memberData?.designation || "Member Delegate"}</p>
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
                              <div className="text-[7px] font-bold text-slate-600 uppercase tracking-wider">Registration Status</div>
                              <div className={`text-[10px] font-bold uppercase tracking-wider ${memberData?.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {memberData?.paymentStatus === 'Paid' ? 'Paid / Active' : 'Pending Payment'}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Right: Quick Stats & Bio (7 cols) */}
                      <div className="md:col-span-7 space-y-6">
                        <Card className="border-slate-200 bg-white p-6 rounded-2xl space-y-4 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Membership Summary</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-550">Paper Submissions</span>
                              <p className="text-2xl font-black text-slate-800">{submissions.length}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-550">Verification Status</span>
                              {memberData?.passportNumber ? (
                                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 font-bold border-0 mt-2 block w-fit text-[9px] uppercase tracking-wide">Verified Details</Badge>
                              ) : (
                                <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 font-bold border-0 mt-2 block w-fit text-[9px] uppercase tracking-wide">Awaiting Details</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1 border-t border-slate-100 pt-4">
                            <span className="text-[10px] uppercase font-bold text-slate-555 block">Professional Bio</span>
                            <p className="text-xs text-slate-600 leading-relaxed italic">{memberData?.bio || "No bio summary configured. Click 'Delegate Registration' tab in the sidebar menu to update your registration fields."}</p>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════ TAB: DELEGATE REGISTRATION FORM ═════════════════════ */}
                {activeTab === 'registration' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Delegate Registration</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Provide detailed contact, passport, and event details to finalize delegation registry.</p>
                      </div>
                    </div>

                    <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Detailed Registration Document</CardTitle>
                        <CardDescription className="text-xs text-slate-450">This information will be used for award certificate print and travel logs.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSaveRegistration} className="space-y-6">
                          
                          {/* Section 1: Professional Details */}
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-brandBlue uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                              <UserIcon className="size-4 shrink-0" />
                              <span>1. Professional Credentials</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Full Name (For Certificate)</label>
                                <Input 
                                  type="text" 
                                  value={profileName}
                                  onChange={(e) => setProfileName(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Full Name" 
                                  required 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Designation / Profession</label>
                                <Input 
                                  type="text" 
                                  value={profileDesignation}
                                  onChange={(e) => setProfileDesignation(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Profession / Job Title" 
                                  required 
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Organization / University</label>
                                <Input 
                                  type="text" 
                                  value={profileOrganization}
                                  onChange={(e) => setProfileOrganization(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Institution Name" 
                                  required 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Biography / Professional Profile</label>
                                <Input 
                                  type="text" 
                                  value={profileBio}
                                  onChange={(e) => setProfileBio(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Brief summary of achievements" 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Section 2: Contact & Travel Info */}
                          <div className="space-y-4 pt-2">
                            <h3 className="text-xs font-bold text-brandBlue uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                              <MapPin className="size-4 shrink-0" />
                              <span>2. Address & Travel Details</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Passport Number (For Visa Support)</label>
                                <Input 
                                  type="text" 
                                  value={profilePassport}
                                  onChange={(e) => setProfilePassport(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Enter Passport Number" 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Contact Number (WhatsApp Enabled)</label>
                                <Input 
                                  type="text" 
                                  value={profilePhone}
                                  onChange={(e) => setProfilePhone(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="e.g. +91 9876543210" 
                                  required 
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Full Residential / Postal Address</label>
                                <Input 
                                  type="text" 
                                  value={profileAddress}
                                  onChange={(e) => setProfileAddress(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Street, Landmark, City, State" 
                                  required 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Country of Residence</label>
                                <Input 
                                  type="text" 
                                  value={profileCountry}
                                  onChange={(e) => setProfileCountry(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Country" 
                                  required 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Section 3: Event Preferences */}
                          <div className="space-y-4 pt-2">
                            <h3 className="text-xs font-bold text-brandBlue uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                              <FileText className="size-4 shrink-0" />
                              <span>3. Award Nomination Preferences</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Nominated Award Category</label>
                                <select 
                                  value={profileCategory}
                                  onChange={(e) => setProfileCategory(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800"
                                >
                                  <option value="ambedkar-awards">Dr. B. R. Ambedkar International Awards</option>
                                  <option value="sociocultural-leadership">International Socio-Cultural Leadership Award</option>
                                  <option value="young-leader-academic">Young Leader Academic Excellence Award</option>
                                  <option value="constitutional-rights">Constitutional Rights Advocacy Prize</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Special Requests / Dietary Requirements</label>
                                <Input 
                                  type="text" 
                                  value={profileDietary}
                                  onChange={(e) => setProfileDietary(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Dietary requests (e.g. Vegetarian, Halal) or accessibility requests" 
                                />
                              </div>
                            </div>
                          </div>

                          <Button type="submit" className="w-full bg-brandBlue hover:bg-brandBlue/90 text-white font-bold h-11 rounded-xl text-xs uppercase tracking-wider shadow-md">
                            Save Registry Details
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ═════════════════════ TAB: DOCUMENT UPLOADS ═════════════════════ */}
                {activeTab === 'uploads' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Document Upload Center</h2>
                        <p className="text-xs text-slate-550 mt-0.5 font-medium">Securely upload photos, passport scans, and supporting documents to Firebase Storage.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Card 1: Professional Headshot */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. Professional Headshot</span>
                            <Camera className="size-4 text-brandBlue" />
                          </div>
                          
                          {memberData?.headshotUrl ? (
                            <div className="flex justify-center py-2">
                              <img src={memberData.headshotUrl} className="w-24 h-24 rounded-full border border-slate-200 object-cover shadow-sm bg-slate-50" alt="Headshot" />
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                              No image uploaded
                            </div>
                          )}

                          <p className="text-[10px] text-slate-500 leading-normal text-center">Upload a high-quality passport size headshot for the booklet.</p>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {headshotUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                <span>Uploading...</span>
                                <span>{headshotProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${headshotProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    uploadFileToStorage(e.target.files[0], 'headshot');
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200">
                                <Upload className="size-3.5" />
                                <span>Choose Image</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Card 2: Passport Scan Copy */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2. Passport Scan Copy</span>
                            <FileText className="size-4 text-brandBlue" />
                          </div>

                          {memberData?.passportScanUrl ? (
                            <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-700 uppercase">Passport Copy Uploaded</span>
                              <a href={memberData.passportScanUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">
                                Download Scanned Copy
                              </a>
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                              Awaiting passport PDF or image
                            </div>
                          )}

                          <p className="text-[10px] text-slate-500 leading-normal text-center">Required for visa invitation letters and international checks.</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {passportUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                <span>Uploading...</span>
                                <span>{passportProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${passportProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input 
                                type="file" 
                                accept="application/pdf,image/*" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    uploadFileToStorage(e.target.files[0], 'passportScan');
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200">
                                <Upload className="size-3.5" />
                                <span>Choose Document</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Card 3: Supporting Evidence */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. Supporting Evidence</span>
                            <FileText className="size-4 text-brandBlue" />
                          </div>

                          {memberData?.evidenceUrl ? (
                            <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-700 uppercase">Supporting Files Loaded</span>
                              <a href={memberData.evidenceUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">
                                Download Submitted Evidence
                              </a>
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                              Upload proof files
                            </div>
                          )}

                          <p className="text-[10px] text-slate-500 leading-normal text-center">Evidence, files, essays, or references for the award nomination.</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {evidenceUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                <span>Uploading...</span>
                                <span>{evidenceProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${evidenceProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input 
                                type="file" 
                                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    uploadFileToStorage(e.target.files[0], 'evidence');
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200">
                                <Upload className="size-3.5" />
                                <span>Choose Proof Files</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>

                    </div>
                  </div>
                )}

                {/* ═════════════════════ TAB: REGISTRATION PAYMENT PORTAL ═════════════════════ */}
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Registration Payment</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify registration fees and trigger payments securely using Razorpay gateway.</p>
                      </div>
                    </div>

                    <div className="max-w-xl mx-auto">
                      {memberData?.paymentStatus === 'Paid' ? (
                        <Card className="border-emerald-200 bg-emerald-50/20 p-6 rounded-2xl shadow-sm text-center space-y-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle className="size-6" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-black font-display text-emerald-800 uppercase tracking-tight">Payment Verified</h3>
                            <p className="text-xs text-emerald-600">Your registration fee has been successfully verified on the server.</p>
                          </div>
                          <div className="border-t border-emerald-100/50 pt-4 text-left grid grid-cols-2 gap-y-2 text-[10px] font-mono text-slate-600">
                            <span className="font-bold text-slate-550 uppercase">Transaction ID:</span>
                            <span className="text-right text-slate-800">{memberData.paymentId || "N/A"}</span>
                            <span className="font-bold text-slate-550 uppercase">Order ID:</span>
                            <span className="text-right text-slate-800">{memberData.paymentOrderId || "N/A"}</span>
                            <span className="font-bold text-slate-550 uppercase">Status:</span>
                            <span className="text-right text-emerald-600 font-bold uppercase">PAID & VERIFIED</span>
                          </div>
                        </Card>
                      ) : (
                        <Card className="border-slate-200 bg-white p-6 rounded-2xl shadow-sm space-y-6">
                          <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-brandBlue shadow-sm">
                              <CreditCard className="size-5" />
                            </div>
                            <h3 className="text-base font-bold uppercase tracking-wider text-slate-800 pt-1">Ambedkar Awards Delegation Fee</h3>
                            <p className="text-xs text-slate-400">Secure delegation fee payment process for nominees.</p>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Delegation Fee</span>
                              <p className="text-xs font-bold text-slate-700">Dr. Ambedkar International Awards 2026</p>
                            </div>
                            <span className="text-xl font-black text-brandBlue font-mono">₹5,000</span>
                          </div>

                          <div className="space-y-4">
                            <Button 
                              onClick={handlePayment} 
                              className="w-full bg-brandBlue hover:bg-brandBlue/90 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                            >
                              <CreditCard className="size-4" />
                              <span>Pay Delegation Fee via Razorpay</span>
                            </Button>
                            
                            <p className="text-[9px] text-slate-400 leading-relaxed text-center">
                              * Payments are encrypted and securely verified using digital signature handlers on the server side before updating active user flags.
                            </p>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* ═════════════════════ TAB: ABSTRACT SUBMISSIONS ═════════════════════ */}
                {activeTab === 'submissions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">SOAS Conference Submissions</h2>
                        <p className="text-xs text-slate-555 mt-0.5 font-medium">Submit abstracts and manage co-authors for the upcoming London Summit.</p>
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
                      <Card className="border-slate-200 bg-white p-6 rounded-2xl max-w-2xl shadow-sm">
                        <CardHeader className="px-0 pt-0 pb-4">
                          <CardTitle className="text-slate-800 text-base font-bold uppercase tracking-wider">New Submission Registration</CardTitle>
                          <CardDescription className="text-xs text-slate-500">Complete all abstract fields to submit your registration document.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                          <form onSubmit={handleAddSubmission} className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Abstract / Paper Title</label>
                              <Input 
                                type="text" 
                                value={subTitle}
                                onChange={(e) => setSubTitle(e.target.value)}
                                className="bg-slate-55 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800 focus:ring-1 focus:ring-brandBlue placeholder:text-slate-400" 
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
                                  className="bg-slate-55 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800 focus:ring-1 focus:ring-brandBlue placeholder:text-slate-400" 
                                  placeholder="e.g. Dr. John Smith, Prof. Jane Doe" 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conference Theme</label>
                                <select 
                                  value={subTheme}
                                  onChange={(e) => setSubTheme(e.target.value)}
                                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800"
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
                                className="w-full bg-slate-55 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue placeholder:text-slate-400" 
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
                                className="bg-slate-55 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800 focus:ring-1 focus:ring-brandBlue placeholder:text-slate-400" 
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
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-10 px-5 rounded-xl text-xs uppercase tracking-wider"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Submissions List Grid Table */}
                    <Card className="border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                      <CardContent className="p-0">
                        {submissions.length > 0 ? (
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[9px] py-4 pl-6">Abstract Title</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[9px] py-4">Theme</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[9px] py-4">Draft Reference</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[9px] py-4">Status</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[9px] py-4 text-right pr-6">Cancel</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {submissions.map((sub) => (
                                <TableRow key={sub.id} className="border-slate-100 hover:bg-slate-50/50">
                                  <TableCell className="font-medium text-slate-800 py-4 pl-6">
                                    <div>
                                      <p className="font-bold text-xs">{sub.title}</p>
                                      <p className="text-[9px] text-slate-500 mt-0.5">Co-authors: {sub.authors || "None"}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="capitalize text-slate-600 text-xs py-4">{sub.theme}</TableCell>
                                  <TableCell className="text-slate-555 font-mono text-[10px] py-4">{sub.fileName || "AbstractDraft.docx"}</TableCell>
                                  <TableCell className="py-4">
                                    {sub.status === 'pending' ? (
                                      <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-500/5 text-[8px] font-bold tracking-widest uppercase">
                                        <Clock className="size-3 mr-1" /> Pending Review
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5 text-[8px] font-bold tracking-widest uppercase">
                                        <CheckCircle className="size-3 mr-1" /> Approved
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right pr-6 py-4">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={() => handleDeleteSubmission(sub.id)}
                                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg size-8"
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
                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                              <FileText className="size-5" />
                            </div>
                            <h4 className="font-black text-slate-550 text-xs uppercase tracking-wider">No Submissions Found</h4>
                            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                              You haven&apos;t registered any research papers yet. Click &apos;New Submission Draft&apos; to submit.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

              </main>

              {/* Corporate Footer */}
              <footer className="border-t border-slate-200 bg-white py-6 text-center text-[10px] text-slate-500 font-normal">
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
