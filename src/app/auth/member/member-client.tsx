"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createDynamicOrder, verifyDynamicPayment } from "@/app/actions/paymentActions";
import Preloader from "@/components/Preloader";
import NetworkBackground from "@/components/NetworkBackground";
import AdPlaceholder from "@/components/AdPlaceholder";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader, SidebarFooter, SidebarRail, SidebarInset, SidebarTrigger, useSidebar
} from "@/components/ui/sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  LayoutDashboard, User as UserIcon, FileText, LogOut, 
  MapPin, Plus, Trash2, CheckCircle, Clock, Upload, ShieldAlert, CreditCard, Camera, FileCheck, Settings, Wifi, Check, ChevronDown, X, Download, Lock, Bell, Heart, Loader2, AlertCircle
} from "lucide-react";
import { ProfilePDF } from '@/components/ProfilePDF';

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), { ssr: false });

const CustomPDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => {
  return function Viewer({ doc }: { doc: React.ReactElement }) {
    const [instance] = mod.usePDF({ document: doc as any });
    if (instance.loading) return <div className="flex items-center justify-center h-full text-slate-400">Generating Profile Dossier...</div>;
    if (instance.error) return <div className="flex items-center justify-center h-full text-rose-500">Error generating PDF</div>;
    return <iframe src={`${instance.url}#pagemode=thumbs`} width="100%" height="100%" className="border-none absolute inset-0 bg-white" />;
  };
}), { ssr: false });
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface GuestProfile {
  id: string;
  name: string;
  title: string;
  gender: string;
  relationship: string;
  age: string;
  passportNumber: string;
  headshotUrl: string;
  passportFrontUrl: string;
  passportBackUrl: string;
  nationalIdUrl: string;
}

const MobileCloseSidebarMenuButton = ({ onClick, children, ...props }: any) => {
  const { setOpenMobile, isMobile } = useSidebar();
  return (
    <SidebarMenuButton 
      onClick={(e) => {
        if (onClick) onClick(e);
        if (isMobile) setOpenMobile(false);
      }} 
      {...props}
    >
      {children}
    </SidebarMenuButton>
  );
};


const COUNTRIES_LIST = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the",
  "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe"
];

const INTENT_OPTIONS = [
  { id: "Conference Presenter", category: "Conference", label: "I want to present a paper at the International Conference", price: "₹5,000 + GST", keywords: ['present', 'paper', 'research', 'speak', 'academic', 'conference'] },
  { id: "Conference Delegate", category: "Conference", label: "I want to attend the International Conference as a Delegate", price: "₹5,000 + GST", keywords: ['attend', 'delegate', 'conference', 'listen', 'audience', 'participate'] },
  { id: "Business Summit Presenter", category: "Business Summit", label: "I want to present a Business proposal at the International Business Summit", price: "₹10,000 + GST", keywords: ['present', 'business', 'proposal', 'pitch', 'summit', 'invest', 'startup'] },
  { id: "Business Summit Delegate", category: "Business Summit", label: "I want to attend the International Business Summit as a Delegate", price: "₹10,000 + GST", keywords: ['attend', 'business', 'delegate', 'summit', 'network', 'participate'] },
  { id: "Award Nominee", category: "Award Event", label: "I want to attend the International Award Event as a nominee", price: "₹5,000 + GST", keywords: ['award', 'nominee', 'nomination', 'prize', 'win', 'recognition', 'event'] },
  { id: "Award Delegate", category: "Award Event", label: "I want to attend the International Award Event as a Delegate", price: "₹5,000 + GST", keywords: ['award', 'delegate', 'attend', 'event', 'gala', 'ceremony'] },
  { id: "Souvenir Article", category: "Souvenir", label: "I want to give an article in the souvenir", price: "₹5,000 + GST", keywords: ['souvenir', 'article', 'write', 'publish', 'magazine', 'booklet'] },
  { id: "Souvenir Advertisement", category: "Souvenir", label: "I want to give an advertisement in the Event Souvenir", price: "₹5,000 + GST", keywords: ['souvenir', 'advertisement', 'ad', 'promote', 'marketing', 'sponsor'] },
  { id: "Donation Patron", category: "High-Level Patronage", label: "I want to support the global vision of Dr. B. R. Ambedkar through Vishwa Leader", price: "₹1,00,000 + GST", keywords: ['ambedkar', 'dr', 'mission', 'vishwa', 'leader', 'donate', 'support', 'give'] }
];

const getPackageName = (pkg: string) => {
  if (pkg === 'pkg_1') return 'Tour (Mumbai - London - Mumbai 7N/8D)';
  if (pkg === 'pkg_2') return 'Tour (Mumbai - London - Mumbai 4N/5D)';
  if (pkg === 'pkg_3' || pkg === 'From Outside India') return 'Land (London Only, 7N/8D)';
  if (pkg === 'pkg_4' || pkg === 'From India') return 'Land (London Only, 4N/5D)';
  return pkg;
};

const getPackagePrice = (pkg: string) => {
  if (pkg === 'pkg_1') return 310000;
  if (pkg === 'pkg_2') return 235000;
  if (pkg === 'pkg_3' || pkg === 'From Outside India') return 200501;
  if (pkg === 'pkg_4' || pkg === 'From India') return 131000;
  return 0;
};

const PHONE_CODES_LIST = [
  "+91 (India)", "+1 (USA/Canada)", "+44 (UK)", "+61 (Australia)", "+971 (UAE)", "+49 (Germany)", "+33 (France)", "+81 (Japan)",
  "+86 (China)", "+27 (South Africa)", "+65 (Singapore)", "+64 (New Zealand)", "+39 (Italy)", "+34 (Spain)", "+41 (Switzerland)",
  "+46 (Sweden)", "+31 (Netherlands)", "+55 (Brazil)", "+52 (Mexico)", "+7 (Russia/Kazakhstan)", "+20 (Egypt)", "+234 (Nigeria)",
  "+254 (Kenya)"
];

const AutocompleteInput = ({ value, onChange, options, placeholder, required, className }: any) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  const filteredOptions = options.filter((opt: string) => opt.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [value, showDropdown]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e: any) => {
          onChange(e);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={(e: any) => {
          if (!showDropdown && filteredOptions.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setShowDropdown(true);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (showDropdown && selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
              const opt = filteredOptions[selectedIndex];
              const finalValue = opt.split(' (')[0];
              onChange({ target: { value: finalValue + (opt.includes('(') ? ' ' : '') } });
              setShowDropdown(false);
            }
          } else if (e.key === 'Escape') {
            setShowDropdown(false);
          }
        }}
        className={className}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {showDropdown && filteredOptions.length > 0 && (
        <ul ref={listRef} className="absolute z-[100] w-full mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg text-lg md:text-xl text-slate-800">
          {filteredOptions.map((opt: string, i: number) => (
            <li 
              key={i} 
              className={`px-3 py-2 cursor-pointer transition-colors duration-150 ${i === selectedIndex ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const finalValue = opt.split(' (')[0];
                onChange({ target: { value: finalValue + (opt.includes('(') ? ' ' : '') } });
                setShowDropdown(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

let globalAuthChecked = false;
let globalUser: any = null;
let globalMemberData: any = null;

export default function MemberClientPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const urlTab = (params?.tab as string) || searchParams.get('tab');
  const defaultTab = urlTab as 'dashboard' | 'registration' | 'checkout' | 'uploads' | 'submissions' | 'settings' | 'donations' || 'dashboard';

  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(!globalAuthChecked);
  // null = not yet fetched from Firestore
  const [memberData, setMemberData] = useState<any>(globalMemberData);

  useEffect(() => {
    if (user) globalUser = user;
    if (memberData) globalMemberData = memberData;
    if (!loading) globalAuthChecked = true;
  }, [user, memberData, loading]);
  // true = brand-new account that hasn't seen the wizard yet
  const [isNewMember, setIsNewMember] = useState(false);
  
  const [paymentImageLoaded, setPaymentImageLoaded] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [reRegisterMode, setReRegisterMode] = useState(false);
  const [showReRegisterModal, setShowReRegisterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registration' | 'checkout' | 'uploads' | 'submissions' | 'settings' | 'donations'>(defaultTab);

  useEffect(() => {
    const tab = (params?.tab as string) || searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab as typeof activeTab);
    }
  }, [params?.tab, searchParams]);

  useEffect(() => {
    if (user && activeTab && params?.tab !== activeTab) {
      router.push(`/auth/member/${activeTab}`);
    }
  }, [activeTab, params?.tab, user, router]);
  const [donations, setDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [userVal, setUserVal] = useState('');
  const [passVal, setPassVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [userError, setUserError] = useState<'warning' | 'save' | 'close' | null>(null);
  const [passError, setPassError] = useState<'warning' | 'save' | 'close' | null>(null);

  // Handle traditional email/password login and signup
  const handleDoLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInfoOpen(false);
    setUserError(null);
    setPassError(null);
    setInlineError('');

    let proceed = true;
    if (!userVal.trim()) {
        setUserError('warning');
        proceed = false;
    }
    if (!passVal.trim()) {
        setPassError('warning');
        proceed = false;
    }
    if (!proceed) return;

    setIsProcessing(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, userVal.trim(), passVal);
        setUserError('save');
        setPassError('save');
      } else {
        await createUserWithEmailAndPassword(auth, userVal.trim(), passVal);
        setUserError('save');
        setPassError('save');
        alert('Account created successfully!');
      }
    } catch (err: any) {
      setPassError('close');
      setInlineError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPerPersonCost = (intents: string[], tour: string) => {
    let perPersonSubtotal = 0; 
    const isTourSelected = (tour && tour !== 'None');

    if (!isTourSelected) {
      if (intents.some(i => i.startsWith('Conference'))) perPersonSubtotal += 5900;
      if (intents.some(i => i.startsWith('Business'))) perPersonSubtotal += 11800;
      if (intents.some(i => i.startsWith('Award'))) perPersonSubtotal += 5900;
    }
    
    if (tour === 'pkg_1') perPersonSubtotal += 310000;
    if (tour === 'pkg_2') perPersonSubtotal += 235000;
    if (tour === 'pkg_3') perPersonSubtotal += 200501;
    if (tour === 'pkg_4') perPersonSubtotal += 131000;
    if (tour === 'From India') perPersonSubtotal += 131000;
    if (tour === 'From Outside India') perPersonSubtotal += 200501;
    
    return perPersonSubtotal;
  };

  const calculateWizardTotal = () => {
    let oneTimeSubtotal = 0;

    if (wizardIntents.includes('Souvenir Article')) oneTimeSubtotal += 5900;
    if (wizardIntents.includes('Souvenir Advertisement')) {
      if (profileAdSize === 'ad_front_cover') oneTimeSubtotal += 500000;
      else if (profileAdSize === 'ad_back_cover') oneTimeSubtotal += 200000;
      else if (profileAdSize === 'ad_inside_cover') oneTimeSubtotal += 150000;
      else if (profileAdSize === 'ad_double_spread') oneTimeSubtotal += 100000;
      else if (profileAdSize === 'ad_full_page') oneTimeSubtotal += 50000;
      else if (profileAdSize === 'ad_half_page') oneTimeSubtotal += 25000;
      else if (profileAdSize === 'ad_quarter_page') oneTimeSubtotal += 15000;
    }
    if (wizardIntents.includes('Donation Patron')) oneTimeSubtotal += (Number(patronAmount) || 100000);
    
    const perPersonSubtotal = getPerPersonCost(wizardIntents, profilePackageTour);
    
    return (perPersonSubtotal * (numDelegates || 1)) + oneTimeSubtotal;
  };

  // Wizard Intents (What brings you here)
  const [wizardIntents, setWizardIntents] = useState<string[]>([]);
  const [wizardEventCategories, setWizardEventCategories] = useState<string[]>([]);
  
  // Registration form field states
  const [profileOrigin, setProfileOrigin] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileNationality, setProfileNationality] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileState, setProfileState] = useState("");
  const [profileWheelchair, setProfileWheelchair] = useState(false);
  const [profileDesignation, setProfileDesignation] = useState("");
  const [profileOrganization, setProfileOrganization] = useState("");
  const [profileSector, setProfileSector] = useState("Academic/Research");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profilePassport, setProfilePassport] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCategory, setProfileCategory] = useState("social-justice-leadership");
  const [profileVisaSupport, setProfileVisaSupport] = useState(false);
  const [profileAccommodation, setProfileAccommodation] = useState(false);
  const [profilePackageTour, setProfilePackageTour] = useState<string>('None');
  const [intentSearchQuery, setIntentSearchQuery] = useState<string>('');
  const [profileDietary, setProfileDietary] = useState("");
  const [profileCountry, setProfileCountry] = useState("India");
  const [profileAdSize, setProfileAdSize] = useState("ad_quarter_page");
  const [patronAmount, setPatronAmount] = useState<number | ''>(100000);
  const [profileLegalConsent, setProfileLegalConsent] = useState(false);
  const [groupType, setGroupType] = useState<'none' | 'family' | 'group'>('none');
  const [numDelegates, setNumDelegates] = useState<number | ''>(1);
  const [guestProfiles, setGuestProfiles] = useState<GuestProfile[]>([]);

  const [showFamilyWizard, setShowFamilyWizard] = useState(false);
  const [familyWizardStep, setFamilyWizardStep] = useState(0);
  const [wizardStep, setWizardStep] = useState(0);
  const [showGstDetails, setShowGstDetails] = useState(false);

  const [headshotUploading, setHeadshotUploading] = useState(false);
  const [headshotProgress, setHeadshotProgress] = useState(0);

  const [nationalIdUploading, setNationalIdUploading] = useState(false);
  const [nationalIdProgress, setNationalIdProgress] = useState(0);

  const [passportFrontUploading, setPassportFrontUploading] = useState(false);
  const [passportFrontProgress, setPassportFrontProgress] = useState(0);
  const [passportBackUploading, setPassportBackUploading] = useState(false);
  const [passportBackProgress, setPassportBackProgress] = useState(0);

  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const [evidenceProgress, setEvidenceProgress] = useState(0);

  const [businessDeckUploading, setBusinessDeckUploading] = useState(false);
  const [businessDeckProgress, setBusinessDeckProgress] = useState(0);

  // Submissions states
  const [subTitle, setSubTitle] = useState("");
  const [subAuthors, setSubAuthors] = useState("");
  const [guestUploadState, setGuestUploadState] = useState<Record<string, { uploading: boolean, progress: number }>>({});
  const [subTheme, setSubTheme] = useState("primary");
  const [subAbstract, setSubAbstract] = useState("");
  const [businessProposalText, setBusinessProposalText] = useState("");
  
  // Legacy states to appease compiler
  const [profileDelegateType, setProfileDelegateType] = useState("conference");
  const [profileParticipationCategories, setProfileParticipationCategories] = useState<string[]>([]);
  const [profileEventDays, setProfileEventDays] = useState<string[]>([]);
  const [profilePurpose, setProfilePurpose] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showSubForm, setShowSubForm] = useState(true);

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
    // Safety net: never leave the page blank for more than 5 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document in firestore with local catch fallbacks
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMemberData((prev: any) => ({ ...(prev || {}), ...data }));
            setIsNewMember(false); // existing member → skip wizard
          } else {
            const newMember = {
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
              gender: "",
              age: "",
              nationality: "",
              city: "",
              wheelchairSupport: false,
              role: 'member',
              joinedAt: new Date().toISOString(),
              designation: "Member Delegate",
              organization: "Independent Scholar",
              sector: "Academic/Research",
              country: "India",
              phone: "",
              bio: "",
              passportNumber: "",
              fullAddress: "",
              wizardIntents: [],
              nominationCategory: "social-justice-leadership",
              visaSupport: false,
              accommodationSupport: false,
              packageTour: "None",
              dietaryNotes: "",
              paymentStatus: "Unpaid",
              legalConsent: false,
              headshotUrl: "",
              passportFrontUrl: "", passportBackUrl: "",
              nationalIdUrl: "",
              evidenceUrl: ""
            };
            await setDoc(userRef, newMember);
            setMemberData(newMember);
            setIsNewMember(true); // brand new → show wizard
            localStorage.removeItem('vishwa_wizard_draft');
            sessionStorage.removeItem('wizardDraft');
            setWizardStep(0);
            // Log join activity for admin feed
            try {
              await addDoc(collection(db, 'adminActivity'), {
                type: 'user_joined',
                userId: currentUser.uid,
                userName: newMember.name || currentUser.email,
                userEmail: currentUser.email,
                timestamp: serverTimestamp()
              });
            } catch (_) {}
          }
          // Mark user as online with presence
          try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
              isOnline: true,
              lastSeen: serverTimestamp()
            });
          } catch (_) {}
        } catch (e) {
          console.error("Error fetching firestore document:", e);
          // On Firestore error: use minimal data — old members see dashboard, new see login
          setIsNewMember(false);
          setMemberData({
            name: currentUser.displayName || "Delegate",
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || "",
            paymentStatus: "Unpaid",
            legalConsent: false,
            wizardIntents: []
          });
        }
        setLoading(false);
      } else {
        setMemberData(null);
        setLoading(false);
      }
    });
    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  // Fetch user donations on tab select
  useEffect(() => {
    if (activeTab === 'donations' && user?.email) {
      const fetchDonations = async () => {
        setDonationsLoading(true);
        try {
          const q = query(
            collection(db, "donations"),
            where("email", "==", user.email)
          );
          const snap = await getDocs(q);
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setDonations(list);
        } catch (e) {
          console.error("Error fetching user donations:", e);
        } finally {
          setDonationsLoading(false);
        }
      };
      fetchDonations();
    }
  }, [activeTab, user]);

  // Sync state variables once memberData is loaded
  useEffect(() => {
    if (memberData) {
      const data = memberData;

      let draft: any = {};
      try {
        const saved = localStorage.getItem('vishwa_wizard_draft');
        if (saved) draft = JSON.parse(saved);
      } catch (e) {}

      setProfileName(draft.profileName || data.name || "");
      setProfileGender(draft.profileGender || data.gender || "");
      setProfileAge(draft.profileAge || data.age || "");
      setProfileNationality(draft.profileNationality || data.nationality || "");
      setWizardIntents(draft.wizardIntents || data.wizardIntents || []);
      setWizardEventCategories(draft.wizardEventCategories || []);
      setProfilePassport(draft.profilePassport || data.passportNumber || "");
      setWizardStep(draft.wizardStep !== undefined ? draft.wizardStep : 0);

      setProfileCity(draft.profileCity || data.city || "");
      setProfileState(draft.profileState || data.state || "");
      setProfileWheelchair(draft.profileWheelchair !== undefined ? draft.profileWheelchair : (data.wheelchairSupport || false));
      setProfileDesignation(draft.profileDesignation || data.designation || "");
      setProfileOrganization(draft.profileOrganization || data.organization || "");
      setProfileSector(draft.profileSector || data.sector || "Academic/Research");
      setProfilePhone(draft.profilePhone || data.phone || "");
      setProfileBio(draft.profileBio || data.bio || "");
      setProfileAddress(draft.profileAddress || data.fullAddress || "");
      setProfileCategory(draft.profileCategory || data.nominationCategory || "social-justice-leadership");
      setProfileVisaSupport(draft.profileVisaSupport !== undefined ? draft.profileVisaSupport : (data.visaSupport || false));
      setProfileAccommodation(draft.profileAccommodation !== undefined ? draft.profileAccommodation : (data.accommodationSupport || false));
      setProfilePackageTour(draft.profilePackageTour || data.packageTour || "None");
      setProfileDietary(draft.profileDietary || data.dietaryNotes || "");
      
      if (draft.numDelegates !== undefined) setNumDelegates(draft.numDelegates);
      if (draft.groupType) setGroupType(draft.groupType);
      if (draft.patronAmount !== undefined) setPatronAmount(draft.patronAmount);
      if (draft.profileAdSize) setProfileAdSize(draft.profileAdSize);
      if (draft.guestProfiles) setGuestProfiles(draft.guestProfiles);
      if (draft.profileOrigin) setProfileOrigin(draft.profileOrigin);
      setProfileCountry(data.country || "India");
      setProfileLegalConsent(data.legalConsent || false);
      
      // Load pre-existing submission drafts if any
      setBusinessProposalText(data.businessProposalText || "");
      setSubTitle(data.subTitle || "");
      setSubAuthors(data.subAuthors || "");
      setSubAbstract(data.subAbstract || "");
    }
  }, [memberData]);

  // Auto-save wizard progress to local storage
  useEffect(() => {
    if (!loading && memberData) {
      localStorage.setItem('vishwa_wizard_draft', JSON.stringify({
        wizardStep,
        wizardIntents,
        wizardEventCategories,
        profileName,
        profileGender,
        profileAge,
        profileNationality,
        profilePassport,
        profilePackageTour,
        patronAmount,
        profileAdSize,
        groupType,
        numDelegates,
        guestProfiles,
        profileOrigin,
        profileCountry,
        profileDietary,
        profileWheelchair,
        profileDesignation,
        profileOrganization,
        profileSector,
        profilePhone,
        profileBio,
        profileAddress,
        profileCategory,
        profileVisaSupport,
        profileAccommodation,
        profileCity,
        profileState
      }));
    }
  }, [wizardStep, wizardIntents, wizardEventCategories, profileName, profileGender, profileAge, profileNationality, profilePassport, profilePackageTour, patronAmount, profileAdSize, groupType, numDelegates, guestProfiles, profileOrigin, profileCountry, profileDietary, profileWheelchair, profileDesignation, profileOrganization, profileSector, profilePhone, profileBio, profileAddress, profileCategory, profileVisaSupport, profileAccommodation, profileCity, profileState, loading, memberData]);

  // Handle slide rendering and navigation

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
    
    // Auto-calculate selections from wizard state
    if (!profileLegalConsent) return showToast("You must agree to the Terms and Conditions.");
    const selectedItems: string[] = [];
    const isTourSelected = (profilePackageTour !== 'None');

    for (let i = 0; i < (numDelegates || 1); i++) {
      if (!isTourSelected) {
        if (wizardIntents.some(i => i.startsWith('Conference'))) selectedItems.push('reg_conference');
        if (wizardIntents.some(i => i.startsWith('Business'))) selectedItems.push('reg_business');
        if (wizardIntents.some(i => i.startsWith('Award'))) selectedItems.push('reg_award');
      }

      if (wizardIntents.includes('Souvenir Article')) selectedItems.push('reg_souvenir');
      if (wizardIntents.includes('Souvenir Advertisement')) selectedItems.push(profileAdSize);
      
      if (wizardIntents.includes('Donation Patron')) selectedItems.push('donation_patron');

      if (profilePackageTour === 'pkg_1') selectedItems.push('pkg_1');
      if (profilePackageTour === 'pkg_2') selectedItems.push('pkg_2');
      if (profilePackageTour === 'pkg_3') selectedItems.push('pkg_3');
      if (profilePackageTour === 'pkg_4') selectedItems.push('pkg_4');
      // Legacy support
      if (profilePackageTour === 'From India') selectedItems.push('pkg_4');
      if (profilePackageTour === 'From Outside India') selectedItems.push('pkg_3');
    }


    if (selectedItems.length === 0) {
      showToast("Please select your event intent in the wizard to calculate total.");
      return;
    }

    if (wizardIntents.includes('Donation Patron') && (Number(patronAmount) || 0) < 100) {
      showToast("Minimum Patron Contribution amount is ₹100.");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Could not load payment gateway script. Please verify your connection.");
      return;
    }

    // 1. Create order on the secure Server Action
    const result = await createDynamicOrder(selectedItems, Number(patronAmount) || 100000);

    if (!result.success || !result.order) {
      alert(result.error || "Could not generate order order-id from checkout gateway.");
      return;
    }

    const { order, totalAmount } = result;

    // 2. Configure payment options with transaction verification callback
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Vishwa Leader Tech Media Pvt Ltd",
      description: `Dynamic Order - Total: ₹${totalAmount.toLocaleString('en-IN')}`,
      order_id: order.id,
      handler: async function (response: any) {
        setLoading(true);
        try {
          // 3. Verify Razorpay response signature securely on the server side
          const verifyRes = await verifyDynamicPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
            user.uid,
            selectedItems,
            totalAmount
          );
          if (verifyRes.success) {
            setMemberData((prev: any) => ({ 
              ...prev, 
              paymentStatus: "Paid", 
              paymentId: response.razorpay_payment_id,
              paymentOrderId: response.razorpay_order_id 
            }));
            showToast("Payment completed and verified successfully!");
            window.location.reload(); // Quick refresh to update state based on accessRights
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

  const removeDocument = async (field: string, guestIndex?: number) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    try {
      if (guestIndex !== undefined) {
        const updatedProfiles = [...guestProfiles];
        if (updatedProfiles[guestIndex]) {
          (updatedProfiles[guestIndex] as any)[field] = null;
          setGuestProfiles(updatedProfiles);
          await updateDoc(userRef, { guestProfiles: updatedProfiles });
          setMemberData((prev: any) => ({ ...prev, guestProfiles: updatedProfiles }));
        }
      } else {
        await updateDoc(userRef, { [`${field}Url`]: null });
        setMemberData((prev: any) => ({ ...prev, [`${field}Url`]: null }));
      }
    } catch (error) {
      console.error("Error removing document:", error);
      showToast("Failed to remove document.");
    }
  };

  // Firebase Storage upload helper
  const uploadFileToStorage = (file: File, type: 'headshot' | 'passportFront' | 'passportBack' | 'nationalId' | 'evidence' | 'businessDeck' | 'guestUpload', guestIndex?: number, guestField?: 'headshotUrl' | 'passportFrontUrl' | 'passportBackUrl' | 'nationalIdUrl') => {
    if (!user) return;
    
    // Set status
    if (type === 'guestUpload' && guestIndex !== undefined && guestField) {
      setGuestUploadState(prev => ({ ...prev, [`${guestIndex}_${guestField}`]: { uploading: true, progress: 0 } }));
    }
    if (type === 'headshot') { setHeadshotUploading(true); setHeadshotProgress(0); }
    if (type === 'nationalId') { setNationalIdUploading(true); setNationalIdProgress(0); }
    if (type === 'passportFront') { setPassportFrontUploading(true); setPassportFrontProgress(0); }
    if (type === 'passportBack') { setPassportBackUploading(true); setPassportBackProgress(0); }
    if (type === 'evidence') { setEvidenceUploading(true); setEvidenceProgress(0); }
    if (type === 'businessDeck') { setBusinessDeckUploading(true); setBusinessDeckProgress(0); }

    const storagePath = `users/${user.uid}/${type}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (type === 'guestUpload' && guestIndex !== undefined && guestField) {
          setGuestUploadState(prev => ({ ...prev, [`${guestIndex}_${guestField}`]: { uploading: true, progress } }));
        }
        if (type === 'headshot') setHeadshotProgress(progress);
        if (type === 'nationalId') setNationalIdProgress(progress);
        if (type === 'passportFront') setPassportFrontProgress(progress);
        if (type === 'passportBack') setPassportBackProgress(progress);
        if (type === 'evidence') setEvidenceProgress(progress);
        if (type === 'businessDeck') setBusinessDeckProgress(progress);
      }, 
      (error) => {
        console.error("Storage upload error:", error);
        showToast("File upload failed.");
        if (type === 'guestUpload' && guestIndex !== undefined && guestField) {
          setGuestUploadState(prev => ({ ...prev, [`${guestIndex}_${guestField}`]: { uploading: false, progress: 0 } }));
        }
        if (type === 'headshot') setHeadshotUploading(false);
        if (type === 'nationalId') setNationalIdUploading(false);
        if (type === 'passportFront') setPassportFrontUploading(false);
        if (type === 'passportBack') setPassportBackUploading(false);
        if (type === 'evidence') setEvidenceUploading(false);
        if (type === 'businessDeck') setBusinessDeckUploading(false);
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save link directly to Firestore delegate profile
          const userRef = doc(db, "users", user.uid);
          if (type === 'guestUpload' && guestIndex !== undefined && guestField) {
            const updatedProfiles = [...guestProfiles];
            if (updatedProfiles[guestIndex]) {
              updatedProfiles[guestIndex][guestField] = downloadURL;
              setGuestProfiles(updatedProfiles);
              await updateDoc(userRef, { guestProfiles: updatedProfiles });
              setMemberData((prev: any) => ({ ...prev, guestProfiles: updatedProfiles }));
            }
          } else {
            const updateField = type === 'headshot' ? 'headshotUrl' : 
                            type === 'nationalId' ? 'nationalIdUrl' :
                            type === 'passportFront' ? 'passportFrontUrl' : 
                            type === 'passportBack' ? 'passportBackUrl' : 
                            type === 'evidence' ? 'evidenceUrl' :
                            'businessDeckUrl';
            
            const updates: any = { [updateField]: downloadURL };
            
            // Auto-reset verification status if this field was rejected
            if (memberData?.verificationStatus?.[type] && memberData.verificationStatus[type].approved === false) {
              updates.verificationStatus = {
                ...memberData.verificationStatus,
                [type]: { ...memberData.verificationStatus[type], approved: true }
              };
            }
            
            await updateDoc(userRef, updates);
            setMemberData((prev: any) => ({ ...prev, ...updates }));
          }
          // Log file upload to admin activity feed
          try {
            await addDoc(collection(db, 'adminActivity'), {
              type: 'file_uploaded',
              userId: user.uid,
              userName: memberData?.name || user.displayName || user.email,
              userEmail: user.email,
              fileType: type,
              timestamp: serverTimestamp()
            });
          } catch (_) {}
          showToast("Document loaded and registered successfully!");
        } catch (e) {
          console.error("Error setting firestore link:", e);
        } finally {
          if (type === 'guestUpload' && guestIndex !== undefined && guestField) {
            setGuestUploadState(prev => ({ ...prev, [`${guestIndex}_${guestField}`]: { uploading: false, progress: 100 } }));
          }
          if (type === 'headshot') setHeadshotUploading(false);
          if (type === 'nationalId') setNationalIdUploading(false);
          if (type === 'passportFront') setPassportFrontUploading(false);
          if (type === 'passportBack') setPassportBackUploading(false);
          if (type === 'evidence') setEvidenceUploading(false);
          if (type === 'businessDeck') setBusinessDeckUploading(false);
        }
      }
    );
  };

  // Save delegate details form
  const handleSaveRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    
    if (!profileLegalConsent) {
      showToast("You must accept the Legal Note & Terms to proceed.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const updatedData = {
        name: profileName,
        gender: profileGender,
        age: profileAge,
        nationality: profileNationality,
        city: profileCity,
        state: profileState,
        wheelchairSupport: profileWheelchair,
        designation: profileDesignation,
        organization: profileOrganization,
        sector: profileSector,
        phone: profilePhone,
        bio: profileBio,
        passportNumber: profilePassport,
        fullAddress: profileAddress,
        nominationCategory: profileCategory,
        wizardIntents: wizardIntents,
        visaSupport: profileVisaSupport,
        accommodationSupport: profileAccommodation,
        packageTour: profilePackageTour,
        dietaryNotes: profileDietary,
        country: profileCountry,
        legalConsent: profileLegalConsent,
        businessProposalText: businessProposalText,
        subTitle: subTitle,
        subAuthors: subAuthors,
        subAbstract: subAbstract,
        groupType: groupType,
        numDelegates: numDelegates,
        guestProfiles: guestProfiles
      };

      await updateDoc(userRef, updatedData);
      setMemberData((prev: any) => ({ ...prev, ...updatedData }));
      // Log profile update to admin activity feed
      try {
        await addDoc(collection(db, 'adminActivity'), {
          type: 'profile_updated',
          userId: user.uid,
          userName: profileName || user.displayName || user.email,
          userEmail: user.email,
          timestamp: serverTimestamp()
        });
      } catch (_) {}
      setReRegisterMode(false); // exit wizard back to dashboard
      showToast("Delegate registration updated successfully!");
    } catch (err) {
      console.error("Error saving delegate form:", err);
      showToast("Failed to save registration.");
    }
  };

  const handleSaveFamilyWizard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      const updatedData = {
        groupType: groupType,
        numDelegates: numDelegates,
        guestProfiles: guestProfiles
      };

      await updateDoc(userRef, updatedData);
      setMemberData((prev: any) => ({ ...prev, ...updatedData }));
      
      try {
        await addDoc(collection(db, 'adminActivity'), {
          type: 'family_registration_updated',
          userId: user.uid,
          userName: profileName || user.displayName || user.email,
          userEmail: user.email,
          timestamp: serverTimestamp()
        });
      } catch (_) {}
      
      setShowFamilyWizard(false);
      showToast("Family/Group registration updated successfully!");
    } catch (err) {
      console.error("Error saving family wizard:", err);
      showToast("Failed to save family/group details.");
    }
  };

  // Google Login action
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/popup-blocked'
      ) {
        return;
      }
      console.error("Google login error:", error);
      showToast("Authentication failed.");
    }
  };

  // Sign out action
  const handleLogout = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      } catch (_) {}
    }
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

  // Get pricing details based on delegate registration type
  const getPricingForDelegate = (delegateType: string) => {
    const type = delegateType || "conference";
    if (type === "business") {
      return { base: 10000, gst: 1800, total: 11800, label: "Business Summit Delegate" };
    }
    if (type === "awards") {
      return { base: 5000, gst: 900, total: 5900, label: "Awards & Cultural Ceremony Delegate / Attendee" };
    }
    return { base: 5000, gst: 900, total: 5900, label: "Conference Delegate" };
  };

  // Get currency conversion info based on member country
  const getCurrencyDetails = (countryName: string) => {
    const country = (countryName || '').trim().toLowerCase();
    if (!country || country === 'india') {
      return { symbol: '₹', code: 'INR', rate: 1 };
    }
    if (['usa', 'united states', 'us', 'united states of america'].includes(country)) {
      return { symbol: '$', code: 'USD', rate: 83.5 };
    }
    if (['uk', 'united kingdom', 'gb', 'britain', 'london', 'england', 'scotland'].includes(country)) {
      return { symbol: '£', code: 'GBP', rate: 106.0 };
    }
    if (['europe', 'eu', 'germany', 'france', 'italy', 'spain', 'netherlands', 'belgium', 'austria', 'ireland', 'portugal', 'greece'].includes(country)) {
      return { symbol: '€', code: 'EUR', rate: 90.0 };
    }
    if (['canada', 'ca'].includes(country)) {
      return { symbol: 'C$', code: 'CAD', rate: 61.0 };
    }
    if (['australia', 'au'].includes(country)) {
      return { symbol: 'A$', code: 'AUD', rate: 55.0 };
    }
    if (['singapore', 'sg'].includes(country)) {
      return { symbol: 'S$', code: 'SGD', rate: 61.5 };
    }
    if (['uae', 'united arab emirates', 'dubai'].includes(country)) {
      return { symbol: 'AED', code: 'AED', rate: 22.7 };
    }
    return { symbol: '$', code: 'USD', rate: 83.5 }; // Default international
  };

  const currency = getCurrencyDetails(memberData?.country);
  const pricing = getPricingForDelegate(memberData?.delegateType);
  const baseConverted = (pricing.base / currency.rate).toFixed(2);
  const gstConverted = (pricing.gst / currency.rate).toFixed(2);
  const totalConverted = (pricing.total / currency.rate).toFixed(2);

  // An existing member who completed the wizard has legalConsent=true → show dashboard.
  const isRegistrationComplete = memberData !== null && memberData?.legalConsent === true;
  // Per user request: If a member logs out in the middle of the wizard, resume where they left off.
  // We use !isRegistrationComplete so any unpaid/uncompleted user gets forced to finish the wizard.
  const showWizard = (!isRegistrationComplete) || reRegisterMode;

  // Generate dynamic slides array
  const showTourStep = (profileOrigin !== 'London (UK)' && profileOrigin !== '');
  const showEvents = (profilePackageTour === 'None');
  
  const visibleSlides = [
    { 
      id: 'origin', 
      type: 'origin', 
      title: 'Where are you traveling from?', 
      subtitle: 'This helps us tailor your experience.'
    },
    ...(showTourStep ? [{ id: 'tour_select', type: 'tour_select', title: 'Would you like to book a Full Tour Package?', subtitle: 'This heavily discounts your event fees.' }] : []),
    ...(showEvents ? [{ id: 'events_general', type: 'events_general', title: 'Which events would you like to attend?', subtitle: 'Select all that apply.' }] : []),
    ...(showEvents && wizardEventCategories.length > 0 ? [{ id: 'events_roles', type: 'events_roles', title: 'What will be your role at the selected events?', subtitle: 'Please specify your participation type.' }] : []),
    {
      id: 'sponsorships',
      type: 'sponsorships',
      title: 'Sponsorships & Ads (Optional)',
      subtitle: 'Support the global vision of Vishwa Leader.'
    },
    { id: 'name', type: 'text', title: "What is your full name?", subtitle: "This will be printed on your official certificate.", state: profileName, setState: setProfileName, required: true },
    { id: 'gender', type: 'select', title: 'What is your gender?', options: ['Male', 'Female', 'Prefer not to say'], state: profileGender, setState: setProfileGender, required: true },
    { id: 'age', type: 'number', title: 'How old are you?', state: profileAge, setState: setProfileAge, required: true },
    { id: 'nationality', type: 'autocomplete', title: 'What is your nationality?', options: COUNTRIES_LIST, state: profileNationality, setState: setProfileNationality, required: true },
    { id: 'passport', type: 'text', title: 'What is your passport number?', subtitle: "Required for Visa invitation letters.", state: profilePassport, setState: setProfilePassport, required: true },
    { id: 'designation', type: 'text', title: 'What is your current designation or job title?', state: profileDesignation, setState: setProfileDesignation, required: true },
    { id: 'organization', type: 'text', title: 'Which organization or university are you affiliated with?', state: profileOrganization, setState: setProfileOrganization, required: true },
    { id: 'phone', type: 'autocomplete', title: 'What is your contact number? (WhatsApp enabled)', subtitle: "Include country code e.g., +91 9876543210", options: PHONE_CODES_LIST, state: profilePhone, setState: setProfilePhone, required: true },

    
    // Documents
    { id: 'headshot', type: 'upload', title: 'Please upload a professional headshot.', subtitle: "This will be used for your Delegate ID Card.", field: 'headshot', url: memberData?.headshotUrl, uploading: headshotUploading, progress: headshotProgress },
    { id: 'nationalId', type: 'upload', title: 'Please upload your National ID (Aadhar/PAN).', field: 'nationalId', url: memberData?.nationalIdUrl, uploading: nationalIdUploading, progress: nationalIdProgress },
    ...(profilePackageTour !== 'None' ? [
      { id: 'passportFront', type: 'upload', title: 'Please upload the front page of your passport.', field: 'passportFront', url: memberData?.passportFrontUrl, uploading: passportFrontUploading, progress: passportFrontProgress },
      { id: 'passportBack', type: 'upload', title: 'Please upload the back page of your passport.', field: 'passportBack', url: memberData?.passportBackUrl, uploading: passportBackUploading, progress: passportBackProgress }
    ] : []),
    
    // Conditional: Award
    ...(wizardIntents.includes('Award Nominee') ? [
      { id: 'award_category', type: 'select', title: 'Which award category are you nominating for?', options: ['Social Justice Leadership', 'Education and Empowerment', 'Economic Development', 'Human Rights Advocacy', 'Innovative Community Service'], state: profileCategory, setState: setProfileCategory, required: true },
      { id: 'evidence', type: 'upload', title: 'Please upload your nomination evidence document.', subtitle: "Accepted formats: .pdf, .doc, .docx", field: 'evidence', url: memberData?.evidenceUrl, uploading: evidenceUploading, progress: evidenceProgress, accept: ".pdf,.doc,.docx" }
    ] : []),
    
    // Conditional: Presenter
    ...(wizardIntents.includes('Conference Presenter') ? [
      { id: 'paper_title', type: 'text', title: 'What is the title of your research paper?', state: subTitle, setState: setSubTitle, required: true },
      { id: 'paper_authors', type: 'text', title: 'Who are the co-authors? (If any)', state: subAuthors, setState: setSubAuthors, required: true },
      { id: 'paper_abstract', type: 'textarea', title: 'Please provide a short abstract.', subtitle: "Maximum 300 words.", state: subAbstract, setState: setSubAbstract, required: true }
    ] : []),

    // Conditional: Business
    ...(wizardIntents.includes('Business Presenter') ? [
      { id: 'business_proposal', type: 'textarea', title: 'What is your primary business objective or proposal?', state: businessProposalText, setState: setBusinessProposalText, required: true },
      { id: 'businessDeck', type: 'upload', title: 'Please upload your pitch deck or company profile.', subtitle: "Accepted formats: .pdf, .ppt", field: 'businessDeck', url: memberData?.businessDeckUrl, uploading: businessDeckUploading, progress: businessDeckProgress, accept: ".pdf,.ppt,.pptx" }
    ] : []),

    // Group/Family setup
    {
      id: 'group_type',
      type: 'group_type',
      title: 'Group or Family Setup',
      subtitle: 'Are you attending with a Family or a Group?'
    },
    ...(groupType !== 'none' ? [
      {
        id: 'group_details',
        type: 'group_details',
        title: groupType === 'family' ? 'Family Details' : 'Group Details',
        subtitle: 'Please provide the details for your additional members.'
      }
    ] : []),

    // Logistics
    { id: 'logistics', type: 'logistics', title: 'Do you require any logistics support?' },
    { id: 'dietary', type: 'text', title: 'Do you have any specific dietary requirements?', subtitle: "e.g. Vegetarian, Halal, Kosher. Leave blank if none.", state: profileDietary, setState: setProfileDietary, required: true },

    // Final Review
    { id: 'review', type: 'review', title: 'Review & Secure Checkout' }
  ];

  const familyVisibleSlides = [
    {
      id: 'group_type',
      type: 'group_type',
      title: 'Group or Family Setup',
      subtitle: 'Are you attending with a Family or a Group?'
    },
    ...(groupType !== 'none' ? [
      {
        id: 'group_details',
        type: 'group_details',
        title: groupType === 'family' ? 'Family Details' : 'Group Details',
        subtitle: 'Please provide the details for your additional members.'
      }
    ] : []),

    { id: 'review_family', type: 'review_family', title: 'Review & Save Group Details' }
  ];


  const currentSlide: any = visibleSlides[wizardStep] || visibleSlides[0];
  const progressPercentage = ((wizardStep) / (visibleSlides.length - 1)) * 100;
  
  const currentFamilySlide: any = familyVisibleSlides[familyWizardStep] || familyVisibleSlides[0];
  const familyProgressPercentage = ((familyWizardStep) / (familyVisibleSlides.length - 1)) * 100;

  useEffect(() => {
    // Reset checkout state when leaving payment slide
    if (wizardStep !== visibleSlides.length - 1) {
      setPaymentImageLoaded(false);
      setCheckoutVisible(false);
    }
  }, [wizardStep, visibleSlides.length]);

  useEffect(() => {
    // Reveal the checkout screen precisely when the image loads and add a mandatory 2.5s delay
    // Uses `transitioning` overlay (not `loading`) so wizard stays mounted and DOM layout stabilizes
    if (wizardStep === visibleSlides.length - 1 && paymentImageLoaded) {
      const t = setTimeout(() => {
        if (transitioning) setTransitioning(false);
        requestAnimationFrame(() => setCheckoutVisible(true));
      }, 2500); // Wait 2.5 seconds for a smooth cinematic transition
      return () => clearTimeout(t);
    }
  }, [wizardStep, paymentImageLoaded, transitioning, visibleSlides.length]);

  const goNext = () => {
    if (currentSlide.type === 'origin') {
      if (profileOrigin === 'Other international location' && !profileCountry.trim()) {
        showToast("Please select your country.");
        return;
      }
    }
    if (currentSlide.type === 'intent' && wizardIntents.length === 0) {
      showToast("Please select at least one intent to proceed.");
      return;
    }
    if (currentSlide.type === 'events_roles') {
      const missingRoles = wizardEventCategories.filter(cat => !wizardIntents.some(i => i.startsWith(cat)));
      if (missingRoles.length > 0) {
        showToast("Please select a role for all selected events.");
        return;
      }
    }
    if (currentSlide.type === 'group_type') {
      if (groupType !== 'none' && (typeof numDelegates !== 'number' || numDelegates < 2)) {
        showToast("Please enter a valid group size (minimum 2).");
        return;
      }
    }
    if (currentSlide.type === 'group_details') {
      const isTourSelected = (profilePackageTour && profilePackageTour !== 'None');
      if (guestProfiles.some(g => {
        if (!g.name?.trim() || !g.title?.trim() || !g.gender?.trim() || !g.relationship?.trim() || !g.age?.trim() || !g.headshotUrl || !g.nationalIdUrl) return true;
        if (isTourSelected && (!g.passportNumber?.trim() || !g.passportFrontUrl || !g.passportBackUrl)) return true;
        return false;
      })) {
        showToast("Please provide all required details and documents for your guests.");
        return;
      }
    }
    if ((currentSlide as any).required && !(currentSlide as any).state) {
      showToast("This field is required.");
      return;
    }
    if (wizardStep < visibleSlides.length - 1) {
      // If transitioning to the final 'review' (payment) page, show overlay
      if (wizardStep === visibleSlides.length - 2) {
        setTransitioning(true);
        setWizardStep(prev => prev + 1);
      } else {
        setWizardStep(prev => prev + 1);
      }
    }
  };

  const goPrev = () => {
    if (wizardStep > 0) {
      setWizardStep(prev => prev - 1);
    }
  };

  // Listen for Enter key to proceed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const isMainWizardActive = (!memberData || reRegisterMode) && !isRegistrationComplete;
        const isFamilyWizardActive = memberData && memberData.numDelegates > 1 && (!memberData.guests || memberData.guests.length === 0) && !reRegisterMode;

        if (isMainWizardActive && wizardStep < visibleSlides.length - 1 && currentSlide.type !== 'textarea') {
          e.preventDefault();
          goNext();
        } else if (isFamilyWizardActive && familyWizardStep < familyVisibleSlides.length - 1 && currentFamilySlide.type !== 'textarea') {
          e.preventDefault();
          goFamilyNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wizardStep, currentSlide, wizardIntents, memberData, reRegisterMode, isRegistrationComplete, familyWizardStep, currentFamilySlide]);

  const goFamilyNext = () => {
    if (currentFamilySlide.type === 'group_type' && groupType === 'none') {
      setTimeout(() => setFamilyWizardStep(prev => prev + 1), 300);
      return;
    }
    if (familyWizardStep < familyVisibleSlides.length - 1) {
      setFamilyWizardStep(prev => prev + 1);
    }
  };

  const goFamilyPrev = () => {
    if (familyWizardStep > 0) {
      setFamilyWizardStep(prev => prev - 1);
    }
  };

  const familyWizardFormContent = (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full relative">
      
      {/* Dynamic Slide Content */}
      <div 
        key={currentFamilySlide.id} 
        className={`flex-grow flex flex-col justify-center py-8 px-2 w-full overflow-visible ${
          currentFamilySlide.type === 'review_family' 
            ? 'animate-in fade-in duration-700' 
            : 'max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500'
        }`}
      >
        <div className={`space-y-6 md:space-y-8 ${currentFamilySlide.type === 'review_family' ? 'hidden' : ''}`}>
        <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-2 font-display text-center">
          {currentFamilySlide.title}
        </h2>
        {(currentFamilySlide as any).subtitle && (
          <p className="text-slate-500 text-base mb-6 text-center">{(currentFamilySlide as any).subtitle}</p>
        )}
        </div>

        {/* Input Renders */}
        <div className={currentFamilySlide.type === 'review_family' ? 'h-full w-full flex items-center justify-center text-center flex-col' : 'mt-8'}>
          {currentFamilySlide.type === 'group_type' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {[
                { val: 'none', label: 'Just Me' },
                { val: 'family', label: 'Family' },
                { val: 'group', label: 'Group' }
              ].map(opt => (
                <div key={opt.val} className="flex flex-col border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-all rounded-xl px-2">
                  <label className="flex items-center justify-between gap-3 py-3 cursor-pointer">
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm text-slate-800 mb-0.5">{opt.label}</h4>
                    </div>
                    <div>
                      <input 
                        type="radio" 
                        name="group_type"
                        checked={groupType === opt.val}
                        onChange={() => {
                          setGroupType(opt.val as any);
                          if (opt.val === 'none') {
                            setNumDelegates(1);
                            setGuestProfiles([]);
                            setTimeout(goFamilyNext, 300);
                          }
                        }}
                        className="w-5 h-5 text-brandBlue focus:ring-brandBlue border-slate-300"
                      />
                    </div>
                  </label>
                  {groupType === opt.val && opt.val !== 'none' && (
                    <div className="animate-in fade-in slide-in-from-top-2 pb-4 pt-1 w-full pl-2 pr-2">
                      <input 
                        type="number"
                        placeholder="Number of guests (excluding you)"
                        min="0"
                        value={numDelegates === '' ? '' : Math.max(0, Number(numDelegates) - 1)}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          if (rawVal === '') {
                            setNumDelegates('');
                            setGuestProfiles([]);
                            return;
                          }
                          const additional = parseInt(rawVal);
                          if (isNaN(additional)) return;
                          const val = additional + 1;
                          setNumDelegates(val);
                          
                          if (val > guestProfiles.length + 1) {
                            const newGuests = Array.from({ length: val - 1 - guestProfiles.length }).map((_, i) => ({
                              id: `guest_${Date.now()}_${i}`,
                              name: '', title: '', gender: '', relationship: '', age: '', passportNumber: '', headshotUrl: '', passportFrontUrl: '', passportBackUrl: '', nationalIdUrl: ''
                            }));
                            setGuestProfiles([...guestProfiles, ...newGuests]);
                          } else {
                            setGuestProfiles(guestProfiles.slice(0, val - 1));
                          }
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : currentFamilySlide.type === 'group_details' ? (
            <div className="max-w-2xl mx-auto w-full text-left space-y-8">
               {guestProfiles.map((guest, idx) => (
                 <div key={guest.id} className="p-6 border border-slate-200 rounded-2xl bg-white space-y-4">
                    <h4 className="font-bold text-lg text-slate-800">Guest {idx + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Title</label>
                        <select value={guest.title} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].title = e.target.value; setGuestProfiles(newG); }} className="w-full mt-1 border-slate-200 rounded-md text-sm">
                          <option value="">Select...</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                        <Input value={guest.name} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].name = e.target.value; setGuestProfiles(newG); }} className="mt-1" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
                        <select value={guest.gender} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].gender = e.target.value; setGuestProfiles(newG); }} className="w-full mt-1 border-slate-200 rounded-md text-sm">
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Age</label>
                        <Input type="number" value={guest.age} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].age = e.target.value; setGuestProfiles(newG); }} className="mt-1" placeholder="25" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Relationship</label>
                        <select value={guest.relationship} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].relationship = e.target.value; setGuestProfiles(newG); }} className="w-full mt-1 border-slate-200 rounded-md text-sm">
                          <option value="">Select...</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child (18+)">Child (18+)</option>
                          <option value="Colleague">Colleague</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {profilePackageTour !== 'None' && (
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase">Passport Number</label>
                          <Input value={guest.passportNumber} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].passportNumber = e.target.value; setGuestProfiles(newG); }} className="mt-1" placeholder="A1234567" />
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-3 block">Required Documents</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Headshot */}
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                           {guest.headshotUrl ? (
                             <>
                               <img src={guest.headshotUrl} alt="Headshot" className="absolute inset-0 w-full h-full object-cover" />
                               <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].headshotUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                 <X className="size-3" />
                               </button>
                             </>
                           ) : (
                             <>
                               <Camera className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                               <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">Headshot</span>
                             </>
                           )}
                           {guestUploadState[`${idx}_headshotUrl`]?.uploading && (
                             <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                               <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_headshotUrl`].progress}%</span>
                             </div>
                           )}
                           <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'headshotUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        {/* National ID */}
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                           {guest.nationalIdUrl ? (
                             <>
                               {guest.nationalIdUrl.includes('.pdf') ? <FileCheck className="size-8 text-emerald-500" /> : <img src={guest.nationalIdUrl} alt="ID" className="absolute inset-0 w-full h-full object-cover" />}
                               <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].nationalIdUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                 <X className="size-3" />
                               </button>
                             </>
                           ) : (
                             <>
                               <FileCheck className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                               <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">National ID</span>
                             </>
                           )}
                           {guestUploadState[`${idx}_nationalIdUrl`]?.uploading && (
                             <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                               <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_nationalIdUrl`].progress}%</span>
                             </div>
                           )}
                           <input type="file" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'nationalIdUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        {/* Passport Front */}
                        {profilePackageTour !== 'None' && (
                          <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                             {guest.passportFrontUrl ? (
                               <>
                                 {guest.passportFrontUrl.includes('.pdf') ? <FileCheck className="size-8 text-emerald-500" /> : <img src={guest.passportFrontUrl} alt="Passport Front" className="absolute inset-0 w-full h-full object-cover" />}
                                 <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].passportFrontUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                   <X className="size-3" />
                                 </button>
                               </>
                             ) : (
                               <>
                                 <FileCheck className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                                 <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">Passport (Front)</span>
                               </>
                             )}
                             {guestUploadState[`${idx}_passportFrontUrl`]?.uploading && (
                               <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                                 <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_passportFrontUrl`].progress}%</span>
                               </div>
                             )}
                             <input type="file" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'passportFrontUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                        )}
                        {/* Passport Back */}
                        {profilePackageTour !== 'None' && (
                          <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                             {guest.passportBackUrl ? (
                               <>
                                 {guest.passportBackUrl.includes('.pdf') ? <FileCheck className="size-8 text-emerald-500" /> : <img src={guest.passportBackUrl} alt="Passport Back" className="absolute inset-0 w-full h-full object-cover" />}
                                 <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].passportBackUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                   <X className="size-3" />
                                 </button>
                               </>
                             ) : (
                               <>
                                 <FileCheck className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                                 <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">Passport (Back)</span>
                               </>
                             )}
                             {guestUploadState[`${idx}_passportBackUrl`]?.uploading && (
                               <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                                 <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_passportBackUrl`].progress}%</span>
                               </div>
                             )}
                             <input type="file" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'passportBackUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          ) : currentFamilySlide.type === 'review_family' ? (
            <div className="text-center space-y-6 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="size-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Ready to Save</h3>
              <p className="text-slate-600">You are about to save details for {groupType === 'none' ? '0' : (numDelegates || 1) - 1} guests.</p>
              <Button onClick={handleSaveFamilyWizard} className="bg-brandBlue text-white hover:bg-brandBlue/90 h-12 px-8 rounded-xl font-bold w-full shadow-lg">Save & Return to Dashboard</Button>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Fixed Bottom Bar */}
      {currentFamilySlide.type !== 'review_family' && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 z-50">
          <div className="w-full flex items-center justify-between gap-4 px-2 sm:px-8">
            <div className="flex-grow hidden sm:block">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${familyProgressPercentage}%` }}></div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 shrink-0 ml-auto w-full sm:w-auto sm:justify-end ${familyWizardStep > 0 ? 'justify-between' : 'justify-end'}`}>
              {familyWizardStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goFamilyPrev}
                  className="rounded-xl font-semibold h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm bg-white"
                >
                  Back
                </Button>
              )}
              
              {familyWizardStep < familyVisibleSlides.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={goFamilyNext}
                  className="bg-slate-900 text-white text-sm font-semibold px-8 h-12 rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <span>Next Step</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </form>
  );

  const wizardFormContent = (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full relative">
      
      {/* Dynamic Slide Content */}
      <div 
        key={currentSlide.id} 
        className={`flex-grow flex flex-col justify-center py-8 px-2 w-full overflow-visible ${
          currentSlide.type === 'review' 
            ? 'animate-in fade-in duration-700' 
            : 'max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500'
        }`}
      >
        <div className={`space-y-6 md:space-y-8 ${currentSlide.type === 'review' ? 'hidden' : ''}`}>
        <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-2 font-display text-center">
          {currentSlide.title}
        </h2>
        {(currentSlide as any).subtitle && (
          <p className="text-slate-500 text-base mb-6 text-center">{(currentSlide as any).subtitle}</p>
        )}
        </div>

        {/* Input Renders */}
        <div className={currentSlide.type === 'review' ? 'h-full w-full' : 'mt-8'}>
          {currentSlide.type === 'text' || currentSlide.type === 'number' ? (
            <input 
              type={currentSlide.type} 
              value={currentSlide.state}
              onChange={(e) => currentSlide.setState?.(e.target.value)}
              className="w-full text-center text-3xl md:text-4xl text-brandBlue bg-transparent border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-brandBlue focus:outline-none py-4 transition-colors placeholder:text-slate-300"
              placeholder="Type your answer here..."
              autoFocus
            />
          ) : currentSlide.type === 'textarea' ? (
            <textarea 
              value={currentSlide.state}
              onChange={(e) => currentSlide.setState?.(e.target.value)}
              className="w-full text-center text-xl md:text-2xl text-brandBlue bg-transparent border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-brandBlue focus:outline-none py-4 transition-colors placeholder:text-slate-300 min-h-[150px] resize-none"
              placeholder="Type your answer here..."
              autoFocus
            ></textarea>
          ) : currentSlide.type === 'autocomplete' ? (
            <AutocompleteInput
              value={currentSlide.state}
              onChange={(e: any) => currentSlide.setState?.(e.target.value)}
              options={currentSlide.options || []}
              placeholder="Type or select..."
              className="w-full text-center text-3xl md:text-4xl text-brandBlue bg-transparent border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-brandBlue focus:outline-none py-4 transition-colors placeholder:text-slate-300"
            />
          ) : currentSlide.type === 'select' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {(currentSlide.options || []).map((opt: string, idx: number) => (
                <label key={opt} className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-sm text-slate-800 mb-0.5">{opt}</h4>
                  </div>
                  <div>
                    <input 
                      type="radio" 
                      name={currentSlide.id}
                      className="w-5 h-5 text-brandBlue focus:ring-brandBlue border-slate-300"
                      checked={currentSlide.state === opt}
                      onChange={() => {
                        currentSlide.setState?.(opt);
                        setTimeout(() => setWizardStep(prev => prev + 1), 300);
                      }}
                    />
                  </div>
                </label>
              ))}
            </div>
          ) : currentSlide.type === 'origin' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {[
                'India',
                'London (UK)',
                'Other international location'
              ].map(opt => (
                <div key={opt}>
                  <label className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm text-slate-800 mb-0.5">{opt}</h4>
                    </div>
                    <div>
                      <input 
                        type="radio" 
                        name="origin"
                        checked={profileOrigin === opt}
                        onChange={() => {
                          setProfileOrigin(opt);
                          if (opt === 'India') {
                            setProfilePackageTour('From India');
                            setProfileCountry('India');
                          } else if (opt === 'London (UK)') {
                            setProfilePackageTour('None');
                            setProfileCountry('United Kingdom');
                          } else {
                            setProfilePackageTour('From Outside India');
                            if (profileCountry === 'India' || profileCountry === 'United Kingdom') {
                              setProfileCountry(''); 
                            }
                          }
                          if (opt !== 'Other international location') {
                            setTimeout(goNext, 300);
                          }
                        }}
                        className="w-5 h-5 text-brandBlue focus:ring-brandBlue border-slate-300"
                      />
                    </div>
                  </label>
                  {opt === 'Other international location' && profileOrigin === opt && (
                    <div className="mt-2 mb-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <select
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue outline-none"
                      >
                        <option value="" disabled>Select your country...</option>
                        {COUNTRIES_LIST.filter(c => c !== 'India' && c !== 'United Kingdom').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Please specify your country to help us tailor your experience.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : currentSlide.type === 'tour_select' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {[
                { val: 'Tour', label: 'I want full package' },
                { val: 'None', label: 'I will manage traveling on my own' }
              ].map(opt => (
                <div key={opt.val}>
                  <label className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm text-slate-800 mb-0.5">{opt.label}</h4>
                    </div>
                    <div>
                      <input 
                        type="radio" 
                        name="tour" 
                        value={opt.val} 
                        checked={opt.val === 'Tour' ? profilePackageTour !== 'None' : profilePackageTour === 'None'} 
                        onChange={() => {
                          if (opt.val === 'Tour') {
                            setProfilePackageTour(profileOrigin === 'India' ? 'pkg_1' : 'pkg_3');
                          } else {
                            setProfilePackageTour('None');
                            setTimeout(goNext, 300);
                          }
                        }} 
                        className="w-5 h-5 text-brandBlue focus:ring-brandBlue border-slate-300" 
                      />
                    </div>
                  </label>
                  
                  {opt.val === 'Tour' && profilePackageTour !== 'None' && (
                    <div className="mt-2 mb-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <select
                        value={profilePackageTour === 'From India' ? 'pkg_4' : profilePackageTour === 'From Outside India' ? 'pkg_3' : profilePackageTour}
                        onChange={(e) => setProfilePackageTour(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue outline-none"
                      >
                        {profileOrigin === 'India' && (
                          <>
                            <option value="pkg_1">Tour (Mumbai - London - Mumbai 7N/8D) - ₹3,10,000</option>
                            <option value="pkg_2">Tour (Mumbai - London - Mumbai 4N/5D) - ₹2,35,000</option>
                          </>
                        )}
                        <option value="pkg_3">Land (London Only, 7N/8D) - ₹2,00,500</option>
                        <option value="pkg_4">Land (London Only, 4N/5D) - ₹1,31,000</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Select your preferred package. Event Registration (Worth ₹23,600) is included!</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : currentSlide.type === 'events_general' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {[
                { id: 'Conference', label: 'Academic Conference' },
                { id: 'Business', label: 'Business Summit' },
                { id: 'Award', label: 'Awards & Cultural Ceremony' }
              ].map(item => (
                <label key={item.id} className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-sm text-slate-800 mb-0.5">{item.label}</h4>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-brandBlue focus:ring-brandBlue border-slate-300 rounded"
                      checked={wizardEventCategories.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWizardEventCategories([...wizardEventCategories, item.id]);
                        } else {
                          setWizardEventCategories(wizardEventCategories.filter(i => i !== item.id));
                          setWizardIntents(wizardIntents.filter(intent => !intent.startsWith(item.id)));
                        }
                      }}
                    />
                  </div>
                </label>
              ))}
            </div>
          ) : currentSlide.type === 'events_roles' ? (
            <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto w-full text-left">
              {wizardEventCategories.includes('Conference') && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'Conference Presenter', label: 'I want to present a paper at the International Conference' },
                      { id: 'Conference Delegate', label: 'I want to attend the International Conference as a Delegate' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="role_conference"
                          checked={wizardIntents.includes(opt.id)}
                          onChange={() => {
                            setWizardIntents([...wizardIntents.filter(i => !i.startsWith('Conference')), opt.id]);
                          }}
                          className="mt-0.5 w-4 h-4 text-brandBlue focus:ring-brandBlue border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-700 leading-snug">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {wizardEventCategories.includes('Business') && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'Business Presenter', label: 'I want to present a Business proposal at the International Business Summit' },
                      { id: 'Business Delegate', label: 'I want to attend the International Business Summit as a Delegate' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="role_business"
                          checked={wizardIntents.includes(opt.id)}
                          onChange={() => {
                            setWizardIntents([...wizardIntents.filter(i => !i.startsWith('Business')), opt.id]);
                          }}
                          className="mt-0.5 w-4 h-4 text-brandBlue focus:ring-brandBlue border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-700 leading-snug">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {wizardEventCategories.includes('Award') && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    {[
                      { id: 'Award Nominee', label: 'I want to attend the International Award Event as a nominee' },
                      { id: 'Award Delegate', label: 'I want to attend the International Award Event as a Delegate' }
                    ].map(opt => (
                      <label key={opt.id} className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="role_award"
                          checked={wizardIntents.includes(opt.id)}
                          onChange={() => {
                            setWizardIntents([...wizardIntents.filter(i => !i.startsWith('Award')), opt.id]);
                          }}
                          className="mt-0.5 w-4 h-4 text-brandBlue focus:ring-brandBlue border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-700 leading-snug">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentSlide.type === 'sponsorships' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {[
                { id: 'Souvenir Advertisement', label: 'I want to publish an Advertisement in the Souvenir Magazine' },
                { id: 'Donation Patron', label: 'I want to make a Patron Contribution' }
              ].map(item => (
                <div key={item.id}>
                  <label className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm text-slate-800 mb-0.5">{item.label}</h4>
                    </div>
                    <div>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-brandBlue focus:ring-brandBlue border-slate-300 rounded"
                        checked={wizardIntents.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) setWizardIntents([...wizardIntents, item.id]);
                          else setWizardIntents(wizardIntents.filter(i => i !== item.id));
                        }}
                      />
                    </div>
                  </label>
                  {item.id === 'Souvenir Advertisement' && wizardIntents.includes(item.id) && (
                    <div className="mt-2 mb-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <select
                        value={profileAdSize}
                        onChange={(e) => setProfileAdSize(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue outline-none"
                      >
                        <option value="ad_front_cover">Front Cover (Premium) - ₹5,00,000</option>
                        <option value="ad_back_cover">Back Cover (Premium) - ₹2,00,000</option>
                        <option value="ad_inside_cover">Inside Cover - ₹1,50,000</option>
                        <option value="ad_double_spread">Double Spread - ₹1,00,000</option>
                        <option value="ad_full_page">Full Page - ₹50,000</option>
                        <option value="ad_half_page">Half Page - ₹25,000</option>
                        <option value="ad_quarter_page">Quarter Page - ₹15,000</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Select your preferred advertisement size.</p>
                    </div>
                  )}
                  {item.id === 'Donation Patron' && wizardIntents.includes(item.id) && (
                    <div className="mt-2 mb-4 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                        <input
                          type="number"
                          min="100"
                          value={patronAmount}
                          onChange={(e) => setPatronAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm text-slate-800 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue outline-none"
                          placeholder="Enter contribution amount (min ₹100)"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Custom contribution amount (Minimum ₹100).</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : currentSlide.type === 'group_type' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              {[
                { val: 'none', label: 'Just Me' },
                { val: 'family', label: 'Family' },
                { val: 'group', label: 'Group' }
              ].map(opt => (
                <div key={opt.val} className="flex flex-col border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-all rounded-xl px-2">
                  <label className="flex items-center justify-between gap-3 py-3 cursor-pointer">
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-sm text-slate-800 mb-0.5">{opt.label}</h4>
                    </div>
                    <div>
                      <input 
                        type="radio" 
                        name="group_type"
                        checked={groupType === opt.val}
                        onChange={() => {
                          setGroupType(opt.val as any);
                          if (opt.val === 'none') {
                            setNumDelegates(1);
                            setGuestProfiles([]);
                            setTimeout(goNext, 300);
                          }
                        }}
                        className="w-5 h-5 text-brandBlue focus:ring-brandBlue border-slate-300"
                      />
                    </div>
                  </label>
                  {groupType === opt.val && opt.val !== 'none' && (
                    <div className="animate-in fade-in slide-in-from-top-2 pb-4 pt-1 w-full pl-2 pr-2">
                      <input 
                        type="number"
                        placeholder="Number of guests (excluding you)"
                        min="0"
                        value={numDelegates === '' ? '' : Math.max(0, Number(numDelegates) - 1)}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          if (rawVal === '') {
                            setNumDelegates('');
                            setGuestProfiles([]);
                            return;
                          }
                          const additional = parseInt(rawVal);
                          if (isNaN(additional)) return;
                          const val = additional + 1;
                          setNumDelegates(val);
                          
                          if (val > guestProfiles.length + 1) {
                            const newGuests = Array.from({ length: val - 1 - guestProfiles.length }).map((_, i) => ({
                              id: `guest_${Date.now()}_${i}`,
                              name: '', title: '', gender: '', relationship: '', age: '', passportNumber: '', headshotUrl: '', passportFrontUrl: '', passportBackUrl: '', nationalIdUrl: ''
                            }));
                            setGuestProfiles([...guestProfiles, ...newGuests]);
                          } else {
                            setGuestProfiles(guestProfiles.slice(0, val - 1));
                          }
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : currentSlide.type === 'group_details' ? (
            <div className="max-w-2xl mx-auto w-full text-left space-y-8">
               {guestProfiles.map((guest, idx) => (
                 <div key={guest.id} className="p-6 border border-slate-200 rounded-2xl bg-white space-y-4">
                    <h4 className="font-bold text-lg text-slate-800">Guest {idx + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Title</label>
                        <select value={guest.title} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].title = e.target.value; setGuestProfiles(newG); }} className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue outline-none">
                          <option value="">Select...</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Full Name</label>
                        <Input value={guest.name} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].name = e.target.value; setGuestProfiles(newG); }} className="h-10 bg-slate-50 border-slate-200 text-sm rounded-xl focus:border-brandBlue focus:ring-brandBlue text-slate-800" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Gender</label>
                        <select value={guest.gender} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].gender = e.target.value; setGuestProfiles(newG); }} className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue outline-none">
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Age</label>
                        <Input type="number" value={guest.age} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].age = e.target.value; setGuestProfiles(newG); }} className="h-10 bg-slate-50 border-slate-200 text-sm rounded-xl focus:border-brandBlue focus:ring-brandBlue text-slate-800" placeholder="25" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Relationship</label>
                        <select value={guest.relationship} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].relationship = e.target.value; setGuestProfiles(newG); }} className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-slate-800 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue outline-none">
                          <option value="">Select...</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child (18+)">Child (18+)</option>
                          <option value="Colleague">Colleague</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {profilePackageTour !== 'None' && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">Passport Number</label>
                          <Input value={guest.passportNumber} onChange={(e) => { const newG = [...guestProfiles]; newG[idx].passportNumber = e.target.value; setGuestProfiles(newG); }} className="h-10 bg-slate-50 border-slate-200 text-sm rounded-xl focus:border-brandBlue focus:ring-brandBlue text-slate-800" placeholder="A1234567" />
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1 block">Required Documents</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                           {guest.headshotUrl ? (
                             <>
                               <img src={guest.headshotUrl} alt="Headshot" className="absolute inset-0 w-full h-full object-cover" />
                               <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].headshotUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                 <X className="size-3" />
                               </button>
                             </>
                           ) : (
                             <>
                               <Camera className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                               <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">Headshot</span>
                             </>
                           )}
                           {guestUploadState[`${idx}_headshotUrl`]?.uploading && (
                             <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                               <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_headshotUrl`].progress}%</span>
                             </div>
                           )}
                           <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'headshotUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                           {guest.nationalIdUrl ? (
                             <>
                               {guest.nationalIdUrl.includes('.pdf') ? <FileCheck className="size-8 text-emerald-500" /> : <img src={guest.nationalIdUrl} alt="ID" className="absolute inset-0 w-full h-full object-cover" />}
                               <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].nationalIdUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                 <X className="size-3" />
                               </button>
                             </>
                           ) : (
                             <>
                               <FileCheck className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                               <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">National ID</span>
                             </>
                           )}
                           {guestUploadState[`${idx}_nationalIdUrl`]?.uploading && (
                             <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                               <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_nationalIdUrl`].progress}%</span>
                             </div>
                           )}
                           <input type="file" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'nationalIdUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        {profilePackageTour !== 'None' && (
                          <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                             {guest.passportFrontUrl ? (
                               <>
                                 {guest.passportFrontUrl.includes('.pdf') ? <FileCheck className="size-8 text-emerald-500" /> : <img src={guest.passportFrontUrl} alt="Passport Front" className="absolute inset-0 w-full h-full object-cover" />}
                                 <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].passportFrontUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                   <X className="size-3" />
                                 </button>
                               </>
                             ) : (
                               <>
                                 <FileCheck className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                                 <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">Passport (Front)</span>
                               </>
                             )}
                             {guestUploadState[`${idx}_passportFrontUrl`]?.uploading && (
                               <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                                 <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_passportFrontUrl`].progress}%</span>
                               </div>
                             )}
                             <input type="file" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'passportFrontUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                        )}
                        {profilePackageTour !== 'None' && (
                          <div className="relative border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                             {guest.passportBackUrl ? (
                               <>
                                 {guest.passportBackUrl.includes('.pdf') ? <FileCheck className="size-8 text-emerald-500" /> : <img src={guest.passportBackUrl} alt="Passport Back" className="absolute inset-0 w-full h-full object-cover" />}
                                 <button type="button" onClick={(e) => { e.preventDefault(); const newG = [...guestProfiles]; newG[idx].passportBackUrl = ''; setGuestProfiles(newG); }} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors z-10">
                                   <X className="size-3" />
                                 </button>
                               </>
                             ) : (
                               <>
                                 <FileCheck className="size-4 text-slate-400 mb-1 group-hover:text-brandBlue transition-colors" />
                                 <span className="text-[10px] text-slate-500 font-medium group-hover:text-brandBlue">Passport (Back)</span>
                               </>
                             )}
                             {guestUploadState[`${idx}_passportBackUrl`]?.uploading && (
                               <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                                 <span className="text-[10px] font-bold text-brandBlue">{guestUploadState[`${idx}_passportBackUrl`].progress}%</span>
                               </div>
                             )}
                             <input type="file" accept="image/*,.pdf" onChange={(e) => { if (e.target.files?.[0]) uploadFileToStorage(e.target.files[0], 'guestUpload', idx, 'passportBackUrl'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : currentSlide.type === 'upload' || currentSlide.type === 'upload_guest' ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              {currentSlide.url ? (
                <div className="space-y-4">
                  {currentSlide.url && currentSlide.url.includes('.pdf') ? (
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                      <FileText className="size-10" />
                    </div>
                  ) : (
                    <img src={currentSlide.url} alt="Uploaded Document" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-sm border border-slate-200" />
                  )}
                  <p className="text-emerald-700 font-bold text-lg">Document Uploaded Successfully</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <Button variant="outline" onClick={() => removeDocument(currentSlide.field, (currentSlide as any).guestIndex)} className="rounded-full px-6 text-red-600 border-red-200 hover:bg-red-50 text-sm h-10 transition-colors">Remove</Button>
                    <Button variant="outline" onClick={goNext} className="rounded-full px-8 bg-brandBlue text-white hover:bg-brandBlue/90 hover:text-white border-none text-sm h-10 shadow-sm transition-all">Continue</Button>
                  </div>
                </div>
              ) : (currentSlide.type === 'upload' ? currentSlide.uploading : guestUploadState[`${(currentSlide as any).guestIndex}_${currentSlide.field}`]?.uploading) ? (
                <div className="w-full max-w-xs space-y-4">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-brandBlue h-full transition-all" style={{ width: `${currentSlide.type === 'upload' ? currentSlide.progress : guestUploadState[`${(currentSlide as any).guestIndex}_${currentSlide.field}`]?.progress}%` }}></div>
                  </div>
                  <p className="text-brandBlue font-bold text-sm">Uploading... {currentSlide.type === 'upload' ? currentSlide.progress : guestUploadState[`${(currentSlide as any).guestIndex}_${currentSlide.field}`]?.progress || 0}%</p>
                </div>
              ) : (
                <div className="relative w-full max-w-sm flex flex-col items-center">
                  <Upload className="size-12 text-slate-400 mb-4" />
                  <input type="file" accept={currentSlide.accept || "image/*"} onChange={(e) => { 
                    if (e.target.files && e.target.files[0]) {
                      if (currentSlide.type === 'upload_guest') {
                        uploadFileToStorage(e.target.files[0], 'guestUpload', (currentSlide as any).guestIndex, currentSlide.field as any);
                      } else {
                        uploadFileToStorage(e.target.files[0], currentSlide.field as any);
                      }
                    }
                  }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Button type="button" className="bg-brandBlue hover:bg-brandBlue/90 text-white font-bold h-12 px-8 rounded-full shadow-lg pointer-events-none">Choose File to Upload</Button>
                  <p className="text-xs text-slate-400 mt-4">Max file size: 5MB</p>
                </div>
              )}
            </div>
          ) : currentSlide.type === 'logistics' ? (
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
              <label className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-sm text-slate-800 mb-0.5">Official Invitation Letter for Visa</h4>
                </div>
                <div>
                  <input type="checkbox" checked={profileVisaSupport} onChange={(e) => setProfileVisaSupport(e.target.checked)} className="w-5 h-5 rounded text-brandBlue focus:ring-brandBlue border-slate-300" />
                </div>
              </label>
              <label className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-sm text-slate-800 mb-0.5">Accommodation Assistance</h4>
                </div>
                <div>
                  <input type="checkbox" checked={profileAccommodation} onChange={(e) => setProfileAccommodation(e.target.checked)} className="w-5 h-5 rounded text-brandBlue focus:ring-brandBlue border-slate-300" />
                </div>
              </label>
              <label className="flex items-center justify-between gap-3 py-3 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-xl px-2">
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-sm text-slate-800 mb-0.5">Wheelchair Support Needed</h4>
                </div>
                <div>
                  <input type="checkbox" checked={profileWheelchair} onChange={(e) => setProfileWheelchair(e.target.checked)} className="w-5 h-5 rounded text-brandBlue focus:ring-brandBlue border-slate-300" />
                </div>
              </label>
            </div>
          ) : currentSlide.type === 'review' ? (
            <div className={`fixed top-16 left-0 w-full h-[calc(100vh-64px)] z-40 grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-0 bg-white overflow-hidden transition-opacity duration-700 ease-out ${checkoutVisible ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Left Column: Image Wallpaper */}
              <div className="hidden lg:flex flex-col justify-between p-10 relative text-white">
                <Image src="/assets/images/newest-background-for-checkout.jpeg" alt="Payment Background" fill sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover object-left" onLoad={() => setPaymentImageLoaded(true)} />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <ShieldAlert className="size-12 text-brandBlue opacity-100 drop-shadow-md shrink-0" />
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm">Secure Checkout</h2>
                  </div>
                  <p className="text-slate-200 text-base opacity-90 leading-relaxed max-w-sm drop-shadow-sm">
                    Your payment is secured with industry-standard 256-bit encryption. 
                    Completing your registration guarantees your seat at the Vishwa Leader summit.
                  </p>
                </div>
                
                <div className="relative z-10 flex items-end justify-between w-full mt-auto">
                  <div className="flex items-center gap-6 text-sm font-medium opacity-80">
                    <span className="flex items-center gap-2"><CheckCircle className="size-5 text-emerald-400" /> SSL Secured</span>
                    <span className="flex items-center gap-2"><CheckCircle className="size-5 text-emerald-400" /> Authorized Gateway</span>
                  </div>
                  <div className="opacity-90 grayscale contrast-200 invert brightness-200 mix-blend-screen pb-1 pr-2">
                    <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-6 object-contain" />
                  </div>
                </div>
              </div>

              {/* Right Column: Receipt UI */}
              <div className="p-8 md:p-12 flex flex-col h-full bg-white relative overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-1 bg-brandBlue"></div>
                
                <div className="mb-3 pb-3 border-b border-slate-100">
                  <h3 className="text-xl font-semibold text-slate-900 leading-tight">Registration Summary</h3>
                  <p className="text-sm text-slate-500 mt-1">Review your selected packages before proceeding to payment.</p>
                </div>

              <div className="space-y-2 flex-grow mb-4">
                
                {wizardIntents.some(i => i.startsWith('Conference')) && (
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>International Conference</span></span>
                    <span className={`font-semibold ${profilePackageTour !== 'None' ? 'text-brandBlue' : 'text-slate-900'}`}>{profilePackageTour !== 'None' ? 'INCLUDED' : '₹5,900'}</span>
                  </div>
                )}

                {wizardIntents.some(i => i.startsWith('Business')) && (
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>International Business Summit</span></span>
                    <span className={`font-semibold ${profilePackageTour !== 'None' ? 'text-brandBlue' : 'text-slate-900'}`}>{profilePackageTour !== 'None' ? 'INCLUDED' : '₹11,800'}</span>
                  </div>
                )}
                
                {wizardIntents.some(i => i.startsWith('Award')) && (
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>International Awards & Cultural Ceremony</span></span>
                    <span className={`font-semibold ${profilePackageTour !== 'None' ? 'text-brandBlue' : 'text-slate-900'}`}>{profilePackageTour !== 'None' ? 'INCLUDED' : '₹5,900'}</span>
                  </div>
                )}

                {wizardIntents.includes('Souvenir Article') && (
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>Official Souvenir Article</span></span>
                    <span className="font-semibold text-slate-900">₹5,900</span>
                  </div>
                )}

                {wizardIntents.includes('Souvenir Advertisement') && (
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>Official Souvenir Advertisement</span></span>
                    <span className="font-semibold text-slate-900">
                      {profileAdSize === 'ad_front_cover' ? '₹5,00,000' :
                       profileAdSize === 'ad_back_cover' ? '₹2,00,000' :
                       profileAdSize === 'ad_inside_cover' ? '₹1,50,000' :
                       profileAdSize === 'ad_double_spread' ? '₹1,00,000' :
                       profileAdSize === 'ad_full_page' ? '₹50,000' :
                       profileAdSize === 'ad_half_page' ? '₹25,000' :
                       '₹15,000'}
                    </span>
                  </div>
                )}

                {wizardIntents.includes('Donation Patron') && (
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-emerald-600 mt-0.5" /> <span>High-Level Patronage Contribution</span></span>
                    <span className="font-semibold text-emerald-700">₹{(Number(patronAmount) || 100000).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {profilePackageTour !== 'None' && (
                  <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                    <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>Tour Package: {getPackageName(profilePackageTour)}</span></span>
                    <span className="font-semibold text-slate-900">
                      ₹{getPackagePrice(profilePackageTour).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {numDelegates && numDelegates > 1 ? (
                  <div className="flex justify-between items-start text-sm text-slate-800 pb-2 pt-2 border-t border-slate-200 mt-2">
                    <span className="flex items-start gap-2 font-semibold">
                      <span>Total Delegates ({numDelegates})</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      x {numDelegates}
                    </span>
                  </div>
                ) : null}
              </div>
              

              
              <div className="pt-3 pb-3 border-t border-b border-slate-100 mb-4 flex flex-col gap-2 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    All Taxes
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    INCLUDED IN PRICES
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-between mb-4 shadow-md">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Total Due Today
                </span>
                <span className="text-2xl font-semibold text-white">
                  ₹{calculateWizardTotal().toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="flex items-start space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
                  <input type="checkbox" checked={profileLegalConsent} onChange={(e) => setProfileLegalConsent(e.target.checked)} className="mt-0.5 size-4 rounded text-slate-900 focus:ring-slate-900 shrink-0" required />
                  <span className="text-sm text-slate-600 leading-tight">
                    I confirm that all information provided is accurate and I agree to the <a href="/terms" className="font-semibold text-slate-900 hover:underline">Terms and Conditions</a> to finalize this transaction.
                  </span>
                </label>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3 mt-auto">
                {!isRegistrationComplete && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goPrev}
                    className="rounded-xl font-semibold h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm bg-white"
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type="button" 
                  onClick={async () => {
                    if (!profileLegalConsent) {
                      showToast("You must accept the Terms & Conditions to proceed.");
                      return;
                    }
                    await handleSaveRegistration();
                    await handlePayment();
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-semibold h-12 px-8 rounded-xl shadow-lg transition-colors text-sm"
                >
                  Pay & Finalize
                </Button>
              </div>
            </div>
          </div>
          ) : null}
        </div>
      </div>
      {/* Fixed Bottom Bar */}
      {currentSlide.type !== 'review' && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 z-50">
          <div className="w-full flex items-center justify-between gap-4 px-2 sm:px-8">
            <div className="flex-grow hidden sm:block">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 shrink-0 ml-auto w-full sm:w-auto sm:justify-end ${wizardStep > 0 ? 'justify-between' : 'justify-end'}`}>
              {wizardStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goPrev}
                  className="rounded-xl font-semibold h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm bg-white"
                >
                  Back
                </Button>
              )}
              
              {wizardStep < visibleSlides.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={goNext}
                  className="bg-slate-900 text-white text-sm font-semibold px-8 h-12 rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <span>{currentSlide.type === 'sponsorships' && !wizardIntents.includes('Souvenir Advertisement') && !wizardIntents.includes('Donation Patron') ? 'Skip' : 'Next Step'}</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </form>
  );

  return (
    <>
      <Preloader loading={loading} />

      {/* Transition overlay for wizard → payment page (keeps wizard mounted so Image onLoad fires) */}
      {transitioning && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
          <div className="vl-logo-container">
            <svg className="vl-preloader-wifi" viewBox="0 -22 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="42" r="5" fill="#D4AF37" />
              <path className="vl-arc vl-arc-1" d="M30 32 Q45 18 60 32" stroke="#D4AF37" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
              <path className="vl-arc vl-arc-2" d="M16 20 Q45 0 74 20" stroke="#D4AF37" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
              <path className="vl-arc vl-arc-3" d="M2 8 Q45 -18 88 8" stroke="#D4AF37" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="vl-globe-img" src="/assets/images/vishwaleader-logo-globe.png" alt="Vishwa Leader" />
          </div>
          <p translate="no" className="notranslate" style={{ marginTop: "18px", fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "15px", letterSpacing: "0.04em", color: "#0056CA" }}>VISHWA LEADER</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#1e3a8a", textTransform: "uppercase", marginTop: "2px" }}>TECHMEDIA</p>
        </div>
      )}

      {/* Unauthenticated View: Sign In */}
      {!loading && !user && (
        <div className="login-page-container-custom">
            <style dangerouslySetInnerHTML={{ __html: `
                @import 'https://fonts.googleapis.com/css?family=Open+Sans|Quicksand:400,700';
                .login-page-container-custom {
                    position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 99999;
                    overflow: auto; font-family: 'Quicksand', sans-serif;
                    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
                    background: #020617;
                    background: linear-gradient(135deg, #020617 0%, #1d4ed8 100%);
                }
                .login-page-container-custom *, .login-page-container-custom *::before, .login-page-container-custom *::after { box-sizing: border-box; }
                .login-page-container-custom h2, .login-page-container-custom h3 { font-size: 16px; letter-spacing: -1px; line-height: 20px; margin: 0; }
                .login-page-container-custom h2 { color: #3b82f6; font-weight: 700; line-height: 1; }
                .login-page-container-custom h3 { color: #ffffff; text-align: right; }
                .login-page-container-custom .i { width: 20px; height: 20px; }
                .login-page-container-custom .i-login {
                    cursor: pointer;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 416.229 416.229'><path d='M403.729,29.65H71.802c-6.903,0-12.5,5.597-12.5,12.5v86.363c0,9.903,5.597,12.5,12.5,12.5s12.5-5.597,12.5-12.5V54.65 h306.927v306.928H84.302v-73.861c0-6.903-5.597-12.5-12.5-12.5s-12.5,5.597-12.5,12.5v86.361c0,6.903,5.597,12.5,12.5,12.5 h331.927c6.902,0,12.5-5.597,12.5-12.5V42.15C416.229,35.247,410.631,29.65,403.729,29.65z' fill='%233b82f6'/><path d='M185.417,287.811c0,5.057,3.045,9.613,7.716,11.55c1.547,0.642,3.17,0.95,4.781,0.95c3.253,0,6.451-1.27,8.842-3.66 l79.697-79.697c2.344-2.344,3.66-5.523,3.66-8.839c0-3.316-1.316-6.495-3.66-8.839l-79.697-79.697 c-3.575-3.575-8.951-4.646-13.623-2.71c-4.671,1.936-7.716,6.493-7.716,11.549v67.197H12.5c-6.903,0-12.5,5.597-12.5,12.5 c0,9.903,5.597,12.5,12.5,12.5h172.917V287.811L185.417,287.811z M210.417,158.594l49.521,49.52l-49.521,49.521V158.594z' fill='%233b82f6'/></svg>");
                    background-size: 18px 18px; background-repeat: no-repeat; background-position: center; transition: opacity 0.2s;
                }
                .login-page-container-custom .i-login:hover { opacity: 0.8; }
                .login-page-container-custom .i-more {
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 612 612'><path d='M76.5,229.5C34.3,229.5,0,263.8,0,306s34.3,76.5,76.5,76.5S153,348.2,153,306S118.7,229.5,76.5,229.5z M76.5,344.2 c-21.1,0-38.2-17.101-38.2-38.2c0-21.1,17.1-38.2,38.2-38.2s38.2,17.1,38.2,38.2C114.7,327.1,97.6,344.2,76.5,344.2z M535.5,229.5c-42.2,0-76.5,34.3-76.5,76.5s34.3,76.5,76.5,76.5S612,348.2,612,306S577.7,229.5,535.5,229.5z M535.5,344.2 c-21.1,0-38.2-17.101-38.2-38.2c0-21.1,17.101-38.2,38.2-38.2s38.2,17.1,38.2,38.2C573.7,327.1,556.6,344.2,535.5,344.2z M306,229.5c-42.2,0-76.5,34.3-76.5,76.5s34.3,76.5,76.5,76.5s76.5-34.3,76.5-76.5S348.2,229.5,306,229.5z M306,344.2 c-21.1,0-38.2-17.101-38.2-38.2c0-21.1,17.1-38.2,38.2-38.2c21.1,0,38.2,17.1,38.2,38.2C344.2,327.1,327.1,344.2,306,344.2z' fill='%233b82f6'/></svg>");
                    background-size: 20px 20px; background-repeat: no-repeat; background-position: center;
                }
                .login-page-container-custom .i-save {
                    background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDYxMiA2MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA2MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0idGljayI+CgkJPGc+CgkJCTxwYXRoIGQ9Ik00MzYuNywxOTYuNzAxTDI1OC4xODgsMzc1LjIxM2wtODIuODY5LTgyLjg4N2MtNy4yODctNy4yODctMTkuMTI1LTcuMjg3LTI2LjQxMiwwcy03LjI4NywxOS4xMjUsMCwyNi40MTIgICAgIGw5My44MDgsOTMuODA8YzAuNjMxLDAuODk5LDEuMDE0LDEuOTMyLDEuODE3LDIuNzM1YzMuNzY4LDMuNzY4LDguNzIxLDUuNTA4LDEzLjY1NSw1LjM3NGM0LjkzNCwwLjExNSw5LjkwNy0xLjYwNiwxMy42NzQtNS4zNzQgICAgIGMwLjgwMy0wLjgwNCwxLjE4Ni0xLjgzNiwxLjgxNy0yLjczNWwxODkuNDM0LTE4OS40MzNjNy4yODYtNy4yODcsNy4yODYtMTkuMTI1LDAtMjYuNDEyICAgICBDNDU1LjgwNiwxODkuNDE0LDQ0My55ODcsMTg5LjQxNCw0MzYuNywxOTYuNzAxeiBNMzA2LDBDMTM2Ljk5MiwwLDAsMTM2Ljk5MiwwLDMwNnMxMzYuOTkyLDMwNiwzMDYsMzA2ICAgICBjMTY4Ljk4OCwwLDMwNi0xMzYuOTkyLDMwNi0zMDZTNDc1LjAwOCwwLDMwNiwweiBNMzA2LDU3My43NUMxNTguMTI1LDU3My43NSwzOC4yNSw0NTMuODc1LDM4LjI1LDMwNiAgICAgQzM4LjI1LDE1OC4xMjUsMTU4LjEyNSwzOC4yNSwzMDYsMzguMjVjMTQ3Ljg3NSwwLDI2Ny43NSwxMTkuODc1LDI2Ny43NSwyNjcuNzVDNTczLjc1LDQ1My44NzUsNDUzLjg3NSw1NzMuNzUsMzA2LDU3My43NXoiIGZpbGw9IiMyMGMxOTgiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==);
                    background-size: 20px 20px; background-repeat: no-repeat; background-position: center;
                }
                .login-page-container-custom .i-warning {
                    background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDYxMi44MTYgNjEyLjgxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjEyLjgxNiA2MTIuODE2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCI+CjxnPgoJPHBhdGggZD0iTTMwNi40MDgsOEMxMzcuMzY4LDAsMC4zNzEsMTM2Ljk5NywwLjM3MSwzMDYuMDM3czEzNi45OTcsMzA2Ljc3OSwzMDYuMDM3LDMwNi43NzlzMzA2LjAzNy0xMzcuODEzLDMwNi4wMzctMzA2LjAzNyAgIEM2MTIuNDQ1LDEzNy43MzksNDc1LjQ0OCwwLDMwNi40MDgsMHogTTMwNi40MDgsNTgzLjE0N2MtMTUyLjIwMywwLTI3Ni4zNjgtMTI0LjE2NS0yNzYuMzY4LTI3Ni4zNjggICBTMTU0LjIwNSwyOS41OTUsMzA2LjQwOCwyOS41OTVTNTgyLjc3NiwxNTMuNzYsNTgyLjc3NiwzMDYuNzc5UzQ1OC42MTEsNTgzLjE0NywzMDYuNDA4LDU4My4xNDd6IE0zMjEuNjEzLDQzMS43NiAgIGMwLDguODI3LTcuMTk1LDE2LjAyIE1lOS4wMjEsMTYuMDIxYy04LjgyNywwLTE2LjAyMS03LjE5NS0xNi4wMjEtMTYuMDIxYzAtOC44MjcsNy4xOTUtMTYuMDIxLDE2LjAyMS0xNi4wMjEgICBTMzIxLjYxMyw0MjIuOTM0LDMyMS42MTMsNDMxLjc2eiBNMjkwLjM4NywzNTMuMjExdi0xODAuMjRjMC04LjAxMSw2LjM3OS0xNC4zOSwxNC4zOS0xNC4zOWM4LjAxMSwwLDE0LjM5LDYuMzc5LDE0LjM5LDE0LjM5ICAgdjE4MC4yNGMwLDguMDExLTYuMzc5LDE0LjM5LTE0LjM5LDE0LjM5QzI5Ni43NjYsMzY4LjQ5MSwyOTAuMzg3LDM2MS4yMjIsMjkwLjM4NywzNTMuMjExeiIgZmlsbD0iI2Y1ZDg3OCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+PC9zdmc+Cg==);
                    background-size: 20px 20px; background-repeat: no-repeat; background-position: center;
                }
                .login-page-container-custom .i-close {
                    background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDYxMi40NDUgNjEyLjQ0NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjEyLjQ0NSA2MTIuNDQ1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCI+CjxnPgoJPHBhdGggZD0iTTUyMi42NDIsODkuODA0QzQ2NC45LDMyLjA2MiwzODguMDExLDAsMzA2LjIyMywwUzE0Ny41NDUsMzIuMDYyLDg5LjgwNCw4OS44MDQgICBjLTExOS40MTYsMTE5LjQxNi0xMTkuNDE2LDMxMy40MjIsMCw0MzIuODM4YzU3Ljc0MSw1Ny43NDEsMTM0LjYzMSw4OS44MDQsMjE2LjQxOSw4OS44MDRzMTU4LjY3OC0zMi4wNjIsMjE2LjQxOS04OS44MDQgICBDNjQyLjA1OCw0MDMuMjI1LDY0Mi4wNTgsMjA5LjIyLDUyMi42NDIsODkuODA0eiBNNTAxLjc4Nyw1MDEuNzg3Yy01Mi4xMDEsNTIuMTAxLTEyMS45OTEsODAuOTcyLTE5NS41NjQsODAuOTcyICAgcy0xNDMuNDYzLTI4Ljg3MS0xOTUuNTY0LTgwLjk3MlMyOS42ODcsMzc5Ljk5NSwyOS42ODcsMzA2LjIyM3MyOC44NzEtMTQzLjQ2Myw4MC45NzItMTk1LjU2NHMxMjEuODY2LTgwLjk3MiwxOTUuNTY0LTgwLjk3MiAgIHMxNDMuNDYzLDI4Ljg3MSwxOTUuNTY0LDgwLjk3MnM4MC45NzIsMTIxLjg2Niw4MC45NzIsMTk1LjU2NFM1NTMuODg3LDQ0OS42ODYsNTAxLjc4Nyw1MDEuNzg3eiBNMzk5LjIxOCwyMzQuODk5bC03NC41MTUsNzQuNTE1ICAgbDc0LjUxNSw3NC41MTVjNS42NDEsNS42NDEsNS42NDEsMTUuMjE1LDAsMjAuODU1Yy0zLjE5MSwzLjE5MS02LjM4Myw0LjAwOC0xMC4zOTEsNC4wMDhjLTQuMDA4LDAtNy4xOTktMS42MzMtMTAuMzktNC4wMDggICBsLTc0LjU4OS03NC41MTVsLTc0LjU4OSw3NC41MTVjLTMuMTkxLDMuMTkxLTYuMzgzLDQuMDA4LTEwLjM5LDQuMDA4cy03LjE5OS0xLjYzMy0xMC4zOS00LjAwOCAgIGMtNS42NDEtNS42NDEtNS42NDEtMTUuMjE1LDAtMjAuODU1bDc0LjUxNS03NC41bTlsLTc0LjUxNS03NC41bTlsLTc0LjUxNS03NC41MTVjLTUuNjQxLTUuNjQxLTUuNjQxLTE1LjIxNSwwLTIwLjg1NSAgIGM1LjY0MS01LjY0MSwxNS4yMTUtNS42NDEsMjAuODU1LDBsNzQuNTE1LDc0LjUxNWw3NC41MTUtNzQuNTE1YzUuNjQxLTUuNjQxLDE1LjIxNS01LjY0MSwyMC44NTUsMCAgIEM0MDQuODU4LDIxOS42ODUsNDA0Ljg1OCwyMjguNDQyLDM5OS4yMTgsMjM0Ljg5OXoiIGZpbGw9IiNmNTVhNGUiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPjwvc3ZnPgo=);
                    background-size: 20px 20px; background-repeat: no-repeat; background-position: center;
                }
                .login-page-container-custom .i-left {
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 414.298 414.299'><path d='M3.663,410.637c2.441,2.44,5.64,3.661,8.839,3.661c3.199,0,6.398-1.221,8.839-3.661l185.809-185.81l185.81,185.811 c2.44,2.44,5.641,3.661,8.84,3.661c3.198,0,6.397-1.221,8.839-3.661c4.881-4.881,4.881-12.796,0-17.679l-185.811-185.81 l185.811-185.81c4.881-4.882,4.881-12.796,0-17.678c-4.882-4.882-12.796-4.882-17.679,0l-185.81,185.81L21.34,3.663 c-4.882-4.882-12.796-4.882-17.678,0c-4.882,4.881-4.882,12.796,0,17.678l185.81,185.809L3.663,392.959 C-1.219,397.841-1.219,405.756,3.663,410.637z' fill='%233b82f6'/></svg>");
                    background-size: 16px 16px; background-repeat: no-repeat; background-position: center;
                }
                .login-page-container-custom .box { width: 330px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; }
                .login-page-container-custom .box-form { width: 320px; position: relative; left: 0; z-index: 1; transition: all 0.3s; }
                .login-page-container-custom .box.info-opened .box-form { left: -37%; }
                .login-page-container-custom .box-login-tab {
                    width: 50%; height: 40px; background: #0d0f14; position: relative; float: left; z-index: 1;
                    border-radius: 6px 6px 0 0; border: 1px solid rgba(59,130,246,0.25); border-bottom: none;
                    transform: perspective(5px) rotateX(0.93deg) translateZ(-1px); transform-origin: 0 0;
                    backface-visibility: hidden; box-shadow: 15px -15px 30px rgba(0,0,0,0.4);
                }
                .login-page-container-custom .box-login-title {
                    width: 50%; height: 40px; position: absolute; z-index: 2; display: flex; align-items: center; padding-left: 15px; gap: 8px;
                }
                .login-page-container-custom .box-login {
                    position: relative; top: -4px; width: 320px; background: #0d0f14;
                    border: 1px solid rgba(59,130,246,0.25); text-align: center; overflow: hidden; z-index: 2;
                    border-top-right-radius: 6px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;
                    box-shadow: 15px 30px 30px rgba(0,0,0,0.4), 0 0 15px rgba(59,130,246,0.1);
                }
                .login-page-container-custom .box-info {
                    width: 260px; top: 60px; position: absolute; right: -5px; opacity: 0; pointer-events: none;
                    padding: 15px 15px 15px 30px; background-color: rgba(13,15,20,0.85); backdrop-filter: blur(12px);
                    border: 1px solid rgba(59,130,246,0.2); z-index: 0; border-radius: 6px; box-shadow: 15px 30px 30px rgba(0,0,0,0.4); transition: all 0.3s;
                }
                .login-page-container-custom .box.info-opened .box-info { right: -37%; opacity: 1; pointer-events: auto; }
                @media (max-width: 600px) {
                    .login-page-container-custom .box { width: 90%; max-width: 340px; }
                    .login-page-container-custom .box-form { width: 100%; }
                    .login-page-container-custom .box-login { width: 100%; }
                    .login-page-container-custom .box-login-tab { width: 50%; }
                    .login-page-container-custom .box-login-title { width: 50%; }
                    .login-page-container-custom .box.info-opened .box-form { left: 0; opacity: 0.15; transform: scale(0.95); pointer-events: none; }
                    .login-page-container-custom .box-info { width: 100%; right: 0; top: 36px; padding: 20px; z-index: 10; transform: translateY(20px); opacity: 0; pointer-events: none; }
                    .login-page-container-custom .box.info-opened .box-info { right: 0; transform: translateY(0); opacity: 1; pointer-events: auto; }
                }
                .login-page-container-custom .line-wh { width: 100%; height: 1px; top: 0px; margin: 12px auto; position: relative; border-top: 1px solid rgba(255,255,255,0.1); }
                .login-page-container-custom a { text-decoration: none; }
                .login-page-container-custom button:focus { outline:0; }
                .login-page-container-custom .b { height: 24px; line-height: 24px; background-color: transparent; border: none; cursor: pointer; }
                .login-page-container-custom .b-form { opacity: 0.6; margin: 10px 20px; float: right; }
                .login-page-container-custom .b-info { opacity: 0.6; float: left; }
                .login-page-container-custom .b-form:hover, .login-page-container-custom .b-info:hover { opacity: 1; }
                .login-page-container-custom .b-support, .login-page-container-custom .b-cta {
                    width: 100%; padding: 0px 15px; font-family: 'Quicksand', sans-serif; font-weight: 700; letter-spacing: -1px; font-size: 16px;
                    line-height: 32px; cursor: pointer; border-radius: 16px; display: block; text-align: center; transition: all 0.3s;
                }
                .login-page-container-custom .b-support { border: #3b82f6 1px solid; background-color: transparent; color: #3b82f6; margin: 6px 0; }
                .login-page-container-custom .b-cta { border: #3b82f6 1px solid; background-color: #3b82f6; color: #000000; }
                .login-page-container-custom .b-support:hover, .login-page-container-custom .b-cta:hover { color: #000000; background-color: #2563eb; border: #2563eb 1px solid; }
                .login-page-container-custom .fieldset-body { display: table; width: 100%; }
                .login-page-container-custom .fieldset-body p { width: 100%; display: inline-table; padding: 5px 20px; margin-bottom:2px; position: relative; }
                .login-page-container-custom label { float: left; width: 100%; top: 0px; color: #8fa0b5; font-size: 13px; font-weight: 700; text-align: left; line-height: 1.5; }
                .login-page-container-custom label.checkbox { float: left; padding: 5px 20px; line-height: 1.7; display: flex; align-items: center; gap: 6px; cursor: pointer; }
                .login-page-container-custom label.checkbox input { margin: 0; width: auto; height: auto; cursor: pointer; }
                .login-page-container-custom input[type=text], .login-page-container-custom input[type=password] {
                    width: 100%; height: 32px; padding: 0px 10px; background-color: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.12);
                    display: inline; color: #ffffff; font-size: 16px; font-weight: 400; float: left; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5);
                }
                .login-page-container-custom input[type=text]:focus, .login-page-container-custom input[type=password]:focus { background-color: rgba(0,0,0,0.5); border-color: #3b82f6; outline: none; }
                .login-page-container-custom input[type=submit] {
                    width: 100%; height: 48px; margin-top: 24px; padding: 0px 20px; font-family: 'Quicksand', sans-serif; font-weight: 700;
                    font-size: 18px; color: #000000; line-height: 40px; text-align: center; background-color: #3b82f6; border: 1px #3b82f6 solid;
                    opacity: 1; cursor: pointer; transition: all 0.3s;
                }
                .login-page-container-custom input[type=submit]:hover { background-color: #2563eb; border: 1px #2563eb solid; }
                .login-page-container-custom input[type=submit]:focus { outline: none; }
                .login-page-container-custom p.field span.i { width: 24px; height: 24px; float: right; position: absolute; right: 22px; bottom: 9px; z-index: 2; display: block; animation: bounceIn 0.6s linear; }
                .login-page-container-custom .box-form, .login-page-container-custom .box-info, .login-page-container-custom .b, .login-page-container-custom .b-support, .login-page-container-custom .b-cta, .login-page-container-custom input[type=submit], .login-page-container-custom p.field span.i { transition: all 0.3s; }
                .login-page-container-custom .icon-credits { width: 100%; position: absolute; bottom: 4px; font-family:'Open Sans', 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; color: rgba(255,255,255,0.2); text-align: center; z-index: -1; }
                .login-page-container-custom .icon-credits a { text-decoration: none; color: rgba(255,255,255,0.4); }
                @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }
                .login-page-container-custom .google-divider { display: flex; align-items: center; text-align: center; color: #8fa0b5; font-size: 12px; margin: 16px 20px 8px 20px; font-weight: 700; }
                .login-page-container-custom .google-divider::before, .login-page-container-custom .google-divider::after { content: ''; flex: 1; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
                .login-page-container-custom .google-divider:not(:empty)::before { margin-right: .55em; }
                .login-page-container-custom .google-divider:not(:empty)::after { margin-left: .55em; }
                .login-page-container-custom .b-google-login { width: calc(100% - 40px); height: 44px; margin: 8px 20px 20px 20px; background-color: #1a202c; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 4px; color: #ffffff; font-family: 'Quicksand', sans-serif; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.3s; }
                .login-page-container-custom .b-google-login:hover { background-color: #2d3748; border-color: rgba(255, 255, 255, 0.25); }
                .login-page-container-custom .b-google-login .google-icon { width: 18px; height: 18px; }
            ` }} />
            <NetworkBackground />
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-3 pointer-events-none">
                <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-10 md:h-12 w-auto brightness-0 invert opacity-90" />
                <span className="text-white font-extrabold text-[9px] md:text-[10px] uppercase tracking-widest opacity-90 leading-tight">Vishwa Leader Techmedia<br/>Private Limited</span>
            </div>
            <div className={`box ${isInfoOpen ? 'info-opened' : ''}`}>
                <div className='box-form'>
                    <div className='box-login-tab'></div>
                    <div className='box-login-title'>
                        <div className='i i-login' onClick={() => window.location.href='/'} title='Back'></div>
                        <h2>{authMode === 'login' ? 'LOGIN' : 'SIGN UP'}</h2>
                    </div>
                    <div className='box-login'>
                        <form onSubmit={handleDoLoginSubmit} className='fieldset-body'>
                            <button type="button" onClick={() => setIsInfoOpen(true)} className='b b-form i i-more' title='More Info' style={{ opacity: isInfoOpen ? 0.01 : 1 }}></button>
                            <p className='field'>
                                <label htmlFor='member-user'>E-MAIL</label>
                                <input type='text' id='member-user' name='member-user' autoComplete="off" placeholder="email" value={userVal} onChange={e => {setUserVal(e.target.value); setUserError(null);}} disabled={isProcessing} />
                                {userError && <span className={`i i-${userError}`}></span>}
                            </p>
                            <p className='field'>
                                <label htmlFor='member-pass'>PASSWORD</label>
                                <input type='password' id='member-pass' name='member-pass' autoComplete="new-password" placeholder="password" value={passVal} onChange={e => {setPassVal(e.target.value); setPassError(null);}} disabled={isProcessing} />
                                {passError && <span className={`i i-${passError}`}></span>}
                            </p>
                            <label className='checkbox'>
                                <input type='checkbox' defaultChecked value='TRUE' title='Keep me Signed in' /> Keep me Signed in
                            </label>
                            {inlineError && <p style={{ color: '#f55a4e', fontSize: '13px', fontWeight: 700, margin: '12px 20px 0 20px', textAlign: 'left', fontFamily: 'Quicksand' }}>⚠️ {inlineError}</p>}
                            <input type='submit' value={isProcessing ? 'PROCESSING...' : (authMode === 'login' ? 'GET STARTED' : 'REGISTER')} disabled={isProcessing} />
                            
                            {authMode === 'login' && (
                                <>
                                    <div className="google-divider"><span>OR</span></div>
                                    <button type="button" onClick={handleGoogleLogin} className="b-google-login" disabled={isProcessing}>
                                        <svg className="google-icon" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                        </svg>
                                        SIGN IN WITH GOOGLE
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
                
                <div className='box-info'>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 20px', marginBottom: '10px' }}>
                        <button type="button" onClick={() => setIsInfoOpen(false)} className='b b-info i i-left' title='Back'></button>
                        <h3>Need Help?</h3>
                    </div>
                    <div className='line-wh'></div>
                    <button type="button" onClick={() => alert('Support can be reached at: support@vishwaleader.com')} className='b-support'>Contact Support</button>
                    <button type="button" onClick={() => window.location.href = '/auth/admin'} className='b-support'>Login as Team</button>
                    <div className='line-wh'></div>
                    <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setIsInfoOpen(false); }} className='b-cta'>
                        {authMode === 'login' ? 'CREATE ACCOUNT' : 'BACK TO LOGIN'}
                    </button>
                </div>
            </div>
            <div className='icon-credits'>by opendev-labs</div>
        </div>
      )}

      {/* Authenticated View: Onboarding Wizard (Fullscreen) */}
      {!loading && user && memberData !== null && showWizard && (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          {/* Standalone Wizard Header */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10 relative">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-8 w-auto object-contain" />
              </Link>
              <div className="hidden sm:block h-6 w-[1px] bg-slate-200"></div>
              <h1 className="text-sm sm:text-base font-black font-display text-slate-900 uppercase tracking-tight">Delegate Onboarding</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{user.displayName || "Delegate"}</p>
                <p className="text-[9px] text-slate-400 font-mono">Member ID: VL-2026-{(user.uid.substring(0, 4)).toUpperCase()}</p>
              </div>
              <img src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/100x100"} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-slate-200 object-cover ml-2" alt="Profile" />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 ml-2 rounded-xl h-9">
                <LogOut className="size-4 shrink-0 sm:mr-2" />
                <span className="hidden sm:inline text-xs font-bold uppercase">Sign Out</span>
              </Button>
            </div>
          </header>

          {/* Wizard Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-center relative">
            {/* Minimal ambient background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-brandBlue/5 blur-3xl rounded-full pointer-events-none -z-10"></div>
            
            <div className="w-full max-w-3xl mx-auto h-full flex flex-col pb-4">
              <div className="flex-grow flex flex-col h-full w-full">
                {wizardFormContent}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Authenticated View: Family/Group Wizard Overlay */}
      {!loading && user && memberData !== null && !showWizard && showFamilyWizard && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-sans h-screen w-screen overflow-hidden">
          {/* Standalone Wizard Header */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10 relative">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="h-8 w-auto object-contain" />
              </div>
              <div className="hidden sm:block h-6 w-[1px] bg-slate-200"></div>
              <h1 className="text-sm sm:text-base font-black font-display text-slate-900 uppercase tracking-tight">Family/Group Setup</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setShowFamilyWizard(false)} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl h-9">
                <span className="text-xs font-bold uppercase">Close</span>
              </Button>
            </div>
          </header>

          {/* Wizard Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-center relative">
            {/* Minimal ambient background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-brandBlue/5 blur-3xl rounded-full pointer-events-none -z-10"></div>
            
            <div className="w-full max-w-3xl mx-auto h-full flex flex-col pb-4">
              <div className="flex-grow flex flex-col h-full w-full">
                {familyWizardFormContent}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Authenticated View: Collapsible Sidebar Dashboard */}
      {!loading && user && memberData !== null && !showWizard && (
        <div className="w-full flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
          <SidebarProvider>
            
            {/* Sidebar wrapper */}
            <Sidebar variant="inset" collapsible="icon" className="border-r border-border sticky top-0 h-screen">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" render={<div />}>
                      <img src="/assets/images/vishwaleader-logo-hd.png" alt="VL" className="size-10 group-data-[collapsible=icon]:size-8 object-contain shrink-0" />
                      <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                        <span className="font-bold text-sm text-slate-800">VishwaLeader Member</span>
                        <span className="text-[10px] text-brandBlue font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brandBlue animate-pulse inline-block" />
                          Online
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>

              <SidebarContent>
                {/* Operations tabs selectors */}
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <MobileCloseSidebarMenuButton 
                          isActive={activeTab === 'dashboard'} 
                          onClick={() => setActiveTab('dashboard')}
                        >
                          <LayoutDashboard />
                          <span>Overview Dashboard</span>
                        </MobileCloseSidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <MobileCloseSidebarMenuButton 
                          isActive={activeTab === 'registration'} 
                          onClick={() => setActiveTab('registration')}
                        >
                          <UserIcon />
                          <span>User Profile</span>
                        </MobileCloseSidebarMenuButton>
                      </SidebarMenuItem>
                      {memberData?.paymentStatus !== 'Paid' && (
                        <SidebarMenuItem>
                          <MobileCloseSidebarMenuButton 
                            isActive={activeTab === 'checkout'} 
                            onClick={() => {
                              setActiveTab('checkout');
                              setWizardStep(visibleSlides.length - 1);
                            }}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          >
                            <CreditCard />
                            <span>Pending Checkout</span>
                          </MobileCloseSidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                      <SidebarMenuItem>
                        <MobileCloseSidebarMenuButton 
                          isActive={activeTab === 'donations'} 
                          onClick={() => setActiveTab('donations')}
                        >
                          <Heart className="size-4 text-rose-500 fill-current" />
                          <span>Donation History</span>
                        </MobileCloseSidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <MobileCloseSidebarMenuButton 
                          isActive={activeTab === 'settings'} 
                          onClick={() => setActiveTab('settings')}
                        >
                          <Settings />
                          <span>Settings</span>
                        </MobileCloseSidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem className="mb-2">
                    <div id="sidebar-translate-container"></div>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <MobileCloseSidebarMenuButton onClick={() => window.location.href = "/"}>
                      <LogOut className="rotate-180" />
                      <span>Return to Website</span>
                    </MobileCloseSidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <MobileCloseSidebarMenuButton onClick={handleLogout} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                      <LogOut />
                      <span>Sign Out Session</span>
                    </MobileCloseSidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
              <SidebarRail />
            </Sidebar>

            {/* Inset Main Pane */}
            <SidebarInset className="min-h-0 bg-slate-50 h-screen overflow-y-auto">
              {/* Sticky Header bar */}
              <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-2 flex-1">
                  <SidebarTrigger className="-ml-1" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">Member Portal</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {activeTab === 'dashboard' && 'Dashboard Overview'}
                          {activeTab === 'registration' && 'Delegate Registration'}
                          {activeTab === 'uploads' && 'Document Upload Center'}
                          {activeTab === 'submissions' && 'Abstract Submissions'}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                <div className="flex items-center gap-3 relative">
                  
                  {/* Notification Bell */}
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                  >
                    <Bell className="size-5" />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-12 right-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2">
                      <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Notifications</span>
                        <span className="text-[10px] text-brandBlue font-semibold cursor-pointer hover:underline">Mark all as read</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3">
                          <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle className="size-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">Registration Approved</p>
                            <p className="text-xs text-slate-500 mt-0.5">Your primary delegate pass has been confirmed.</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Just now</p>
                          </div>
                        </div>
                        <div className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3">
                          <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Clock className="size-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">Pending Payment</p>
                            <p className="text-xs text-slate-500 mt-0.5">Complete your checkout to secure your seats.</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">2 hours ago</p>
                          </div>
                        </div>
                        <div className="p-3 hover:bg-slate-50 cursor-pointer flex gap-3">
                          <div className="size-8 rounded-full bg-brandBlue/10 flex items-center justify-center shrink-0">
                            <Lock className="size-4 text-brandBlue" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">Security Alert</p>
                            <p className="text-xs text-slate-500 mt-0.5">New login detected on Windows PC (Mumbai).</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800">{memberData?.name || user.displayName || "Delegate"}</p>
                    <p className="text-[9px] text-slate-400 font-mono">Member ID: VL-2026-{(user.uid.substring(0, 4)).toUpperCase()}</p>
                  </div>
                  <img src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/100x100"} referrerPolicy="no-referrer" alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                </div>
              </header>

              {/* Main Workspace Scroll View */}
              <main className={`flex-grow w-full ${activeTab === 'registration' ? 'p-0 h-[calc(100vh-4rem)] overflow-hidden' : 'max-w-6xl mx-auto ' + (activeTab === 'checkout' ? 'p-4 md:p-6' : 'p-6 md:p-8 space-y-6')}`}>
                
                {/* ═════════════════════ TAB: DASHBOARD OVERVIEW ═════════════════════ */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {(() => {
                      const rejectedItems = memberData?.verificationStatus ? Object.entries(memberData.verificationStatus).filter(([_, data]: any) => !data.approved) : [];
                      if (rejectedItems.length > 0) {
                        return (
                          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <AlertCircle className="w-5 h-5 text-rose-600" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider">Action Required: Document Verification</h3>
                                <p className="text-xs text-rose-700 mt-1">Our team has reviewed your profile. The following items require your attention. Please re-upload them to complete your registration:</p>
                                <ul className="mt-3 space-y-2">
                                  {rejectedItems.map(([key, data]: any) => (
                                    <li key={key} className="text-xs bg-white/50 p-2 rounded border border-rose-100">
                                      <span className="font-semibold text-rose-900">{data.label}:</span> <span className="text-rose-700">{data.feedback || 'Please re-upload.'}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <AdPlaceholder />
                    
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
                            <div className="flex items-center">
                              <img src="/assets/images/vishwaleader-logo-hd.png" className="h-12 w-auto object-contain brightness-0 invert opacity-90" alt="Vishwa Leader" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/5">
                              Member Card
                            </span>
                          </div>

                          {/* Card Middle */}
                          <div className="flex gap-4 items-center my-3 relative z-10">
                            <div className="relative shrink-0">
                              <img 
                                src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/150x150/0a1e4b/ffffff?text=User"} referrerPolicy="no-referrer" 
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
                        
                        <Card className="border-brandBlue/20 bg-brandBlue/5 p-6 rounded-2xl shadow-sm cursor-pointer hover:bg-brandBlue/10 transition-colors" onClick={() => setShowFamilyWizard(true)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-brandBlue">Upgrade to Family/Group</h3>
                              <p className="text-sm text-slate-600 mt-1">Want to bring your family or a group? Setup their details here.</p>
                            </div>
                            <Button className="bg-brandBlue hover:bg-brandBlue/90 text-white rounded-full">Add Group</Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════ TAB: PROFILE SETTINGS ═════════════════════ */}
                {activeTab === 'registration' && (
                  <div className="flex flex-col w-full h-full relative bg-slate-900">
                    
                    <div className="flex-1 w-full h-full relative">
                      {memberData ? (
                        <CustomPDFViewer doc={<ProfilePDF memberData={memberData} guestProfiles={guestProfiles} />} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">Generating Profile Dossier...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ═════════════════════ TAB: CHECKOUT ═════════════════════ */}
                {activeTab === 'checkout' && memberData?.paymentStatus !== 'Paid' && (
                  <div className="space-y-4">
                    {/* Full-screen payment page design */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-0 bg-white overflow-hidden rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-6.5rem)]">

                      {/* Left Column: Image Wallpaper */}
                      <div className="hidden lg:flex flex-col justify-between p-10 relative text-white h-full">
                        <Image src="/assets/images/newest-background-for-checkout.jpeg" alt="Payment Background" fill sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover object-left" />
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-transparent"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                            <ShieldAlert className="size-12 text-brandBlue opacity-100 drop-shadow-md shrink-0" />
                            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm">Secure Checkout</h2>
                          </div>
                          <p className="text-slate-200 text-base opacity-90 leading-relaxed max-w-sm drop-shadow-sm">
                            Your payment is secured with industry-standard 256-bit encryption.
                            Completing your registration guarantees your seat at the Vishwa Leader summit.
                          </p>
                        </div>
                        <div className="relative z-10 flex items-end justify-between w-full mt-auto">
                          <div className="flex items-center gap-6 text-sm font-medium opacity-80">
                            <span className="flex items-center gap-2"><CheckCircle className="size-5 text-emerald-400" /> SSL Secured</span>
                            <span className="flex items-center gap-2"><CheckCircle className="size-5 text-emerald-400" /> Authorized Gateway</span>
                          </div>
                          <div className="opacity-90 grayscale contrast-200 invert brightness-200 mix-blend-screen pb-1 pr-2">
                            <img src="/assets/images/razorpay.svg" alt="Razorpay" className="h-6 object-contain" />
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Receipt UI */}
                      <div className="p-6 md:p-8 flex flex-col bg-white relative overflow-y-auto">
                        <div className="absolute top-0 left-0 w-full h-1 bg-brandBlue"></div>

                        <div className="mb-3 pb-3 border-b border-slate-100">
                          <h3 className="text-xl font-semibold text-slate-900 leading-tight">Pending Checkout</h3>
                          <p className="text-sm text-slate-500 mt-1">Review your selections and complete your registration payment.</p>
                        </div>

                        <div className="space-y-2 flex-grow mb-4">
                          
                          {(memberData?.wizardIntents || wizardIntents).some((i: string) => i.startsWith('Conference')) && (
                            <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                              <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>International Conference</span></span>
                              <span className="font-semibold text-slate-900">₹5,900</span>
                            </div>
                          )}
                          {(memberData?.wizardIntents || wizardIntents).some((i: string) => i.startsWith('Business')) && (
                            <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                              <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>International Business Summit</span></span>
                              <span className="font-semibold text-slate-900">₹11,800</span>
                            </div>
                          )}
                          {(memberData?.wizardIntents || wizardIntents).some((i: string) => i.startsWith('Award')) && (
                            <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                              <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>International Awards &amp; Cultural Ceremony</span></span>
                              <span className="font-semibold text-slate-900">₹5,900</span>
                            </div>
                          )}
                          {(memberData?.wizardIntents || wizardIntents).includes('Souvenir Article') && (
                            <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                              <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>Official Souvenir Article</span></span>
                              <span className="font-semibold text-slate-900">₹5,900</span>
                            </div>
                          )}
                          {(memberData?.wizardIntents || wizardIntents).includes('Souvenir Advertisement') && (
                            <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                              <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>Official Souvenir Advertisement</span></span>
                              <span className="font-semibold text-slate-900">₹{(() => {
                                const size = memberData?.profileAdSize || profileAdSize;
                                if (size === 'ad_front_cover') return '5,00,000';
                                if (size === 'ad_back_cover') return '2,00,000';
                                if (size === 'ad_inside_cover') return '1,50,000';
                                if (size === 'ad_double_spread') return '1,00,000';
                                if (size === 'ad_full_page') return '50,000';
                                if (size === 'ad_half_page') return '25,000';
                                if (size === 'ad_quarter_page') return '15,000';
                                return '15,000';
                              })()}</span>
                            </div>
                          )}
                          {(memberData?.wizardIntents || wizardIntents).includes('Donation Patron') && (
                            <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                              <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-emerald-600 mt-0.5" /> <span>High-Level Patronage Contribution</span></span>
                              <span className="font-semibold text-emerald-700">₹{(Number(memberData?.patronAmount || patronAmount) || 100000).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {profilePackageTour !== 'None' && profilePackageTour && (
                            <div className="flex justify-between items-start text-sm text-slate-600 pb-2">
                              <span className="flex items-start gap-2"><Check className="size-4 shrink-0 text-slate-900 mt-0.5" /> <span>Tour Package: {getPackageName(profilePackageTour)}</span></span>
                              <span className="font-semibold text-slate-900">
                                ₹{getPackagePrice(profilePackageTour).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                          {(memberData?.numDelegates || numDelegates) > 1 ? (
                            <div className="flex justify-between items-start text-sm text-slate-800 pb-2 pt-2 border-t border-slate-200 mt-2">
                              <span className="flex items-start gap-2 font-semibold">
                                <span>Total Delegates ({(memberData?.numDelegates || numDelegates)})</span>
                              </span>
                              <span className="font-bold text-slate-900">
                                x {(memberData?.numDelegates || numDelegates)}
                              </span>
                            </div>
                          ) : null}
                        </div>


                        {/* GST breakdown */}
                        <div className="pt-3 pb-3 border-t border-b border-slate-100 mb-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              All Taxes
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              INCLUDED IN PRICES
                            </span>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-between mb-4 shadow-md">
                          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                            Total Due Today
                          </span>
                          <span className="text-3xl font-semibold text-white">₹{calculateWizardTotal().toLocaleString('en-IN')}</span>
                        </div>

                        {/* Legal consent */}
                        <div>
                          <label className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
                            <input type="checkbox" checked={profileLegalConsent} onChange={(e) => setProfileLegalConsent(e.target.checked)} className="mt-0.5 size-4 rounded text-slate-900 focus:ring-slate-900 shrink-0" />
                            <span className="text-sm text-slate-600 leading-tight">
                              I confirm that all information provided is accurate and I agree to the <a href="/terms" className="font-semibold text-slate-900 hover:underline">Terms and Conditions</a> to finalize this transaction.
                            </span>
                          </label>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (!user) return;
                              setShowReRegisterModal(true);
                            }}
                            className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 font-bold h-12 px-4 md:px-6 rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                              <path d="M3 3v5h5"/>
                            </svg>
                            Re-register
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              if (!profileLegalConsent) {
                                showToast("You must accept the Terms & Conditions to proceed.");
                                return;
                              }
                              await handleSaveRegistration();
                              await handlePayment();
                            }}
                            className="bg-slate-900 text-white hover:bg-slate-800 font-semibold h-12 px-8 rounded-xl shadow-lg transition-colors text-sm"
                          >
                            Pay &amp; Finalize
                          </Button>
                        </div>
                      </div>
                    </div>
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

                      {/* Card 1.5: National ID */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">National ID</span>
                            <FileText className="size-4 text-brandBlue" />
                          </div>
                          {memberData?.nationalIdUrl ? (
                            <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileCheck className="size-6 text-emerald-500" />
                              <span className="text-[9px] font-bold text-emerald-700 uppercase">Uploaded</span>
                              <a href={memberData.nationalIdUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">View File</a>
                            </div>
                          ) : (
                            <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">Awaiting ID copy</div>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                          {nationalIdUploading ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Uploading...</span><span>{nationalIdProgress}%</span></div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${nationalIdProgress}%` }}></div></div>
                            </div>
                          ) : (
                            <div className="relative w-full">
                              <input type="file" accept="application/pdf,image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadFileToStorage(e.target.files[0], 'nationalId'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"><Upload className="size-3.5" /><span>Upload ID</span></Button>
                            </div>
                          )}
                        </div>
                      </Card>

                      {profileCountry === 'India' && (
                        <>
                          {/* Card 2: Passport Front */}
                          <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Passport Front</span>
                                <FileText className="size-4 text-brandBlue" />
                              </div>
                              {memberData?.passportFrontUrl ? (
                                <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                                  <FileCheck className="size-6 text-emerald-500" />
                                  <span className="text-[9px] font-bold text-emerald-700 uppercase">Uploaded</span>
                                  <a href={memberData.passportFrontUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">View File</a>
                                </div>
                              ) : (
                                <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">Awaiting front copy</div>
                              )}
                            </div>
                            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                              {passportFrontUploading ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Uploading...</span><span>{passportFrontProgress}%</span></div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${passportFrontProgress}%` }}></div></div>
                                </div>
                              ) : (
                                <div className="relative w-full">
                                  <input type="file" accept="application/pdf,image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadFileToStorage(e.target.files[0], 'passportFront'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                  <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"><Upload className="size-3.5" /><span>Upload Front</span></Button>
                                </div>
                              )}
                            </div>
                          </Card>

                          {/* Card 3: Passport Back */}
                          <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Passport Back</span>
                                <FileText className="size-4 text-brandBlue" />
                              </div>
                              {memberData?.passportBackUrl ? (
                                <div className="h-24 w-full bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                                  <FileCheck className="size-6 text-emerald-500" />
                                  <span className="text-[9px] font-bold text-emerald-700 uppercase">Uploaded</span>
                                  <a href={memberData.passportBackUrl} target="_blank" className="text-[9px] font-extrabold text-brandBlue hover:underline uppercase tracking-wide pt-1">View File</a>
                                </div>
                              ) : (
                                <div className="h-24 w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">Awaiting back copy</div>
                              )}
                            </div>
                            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                              {passportBackUploading ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] font-mono text-slate-500"><span>Uploading...</span><span>{passportBackProgress}%</span></div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-brandBlue h-full rounded-full transition-all" style={{ width: `${passportBackProgress}%` }}></div></div>
                                </div>
                              ) : (
                                <div className="relative w-full">
                                  <input type="file" accept="application/pdf,image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) uploadFileToStorage(e.target.files[0], 'passportBack'); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                  <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"><Upload className="size-3.5" /><span>Upload Back</span></Button>
                                </div>
                              )}
                            </div>
                          </Card>
                        </>
                      )}

                      {/* Card 3: Supporting Evidence */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6. Supporting Evidence</span>
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


                {/* ═════════════════════ TAB: ABSTRACT SUBMISSIONS ═════════════════════ */}
                {activeTab === 'submissions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">SOAS Conference Submissions</h2>
                        <p className="text-xs text-slate-555 mt-0.5 font-medium">Submit abstracts and manage co-authors for the upcoming London Summit.</p>
                      </div>
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
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conference Theme / Sub-Theme</label>
                                <select 
                                  value={subTheme}
                                  onChange={(e) => setSubTheme(e.target.value)}
                                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800"
                                >
                                  <option value="primary" className="font-bold">Primary: Reimagining Equality and Justice...</option>
                                  <optgroup label="Suggested Sub-Themes">
                                    <option value="social-justice">Social Justice and Human Rights</option>
                                    <option value="economic-inclusion">Economic Inclusion and Sustainable Development</option>
                                    <option value="education-empowerment">Education as a Tool for Empowerment</option>
                                    <option value="constitutional-values">Constitutional Values and Global Governance</option>
                                    <option value="intersectionality">Intersectionality in Social Movements</option>
                                    <option value="innovative-models">Innovative Models for Inclusive Societies</option>
                                    <option value="ambedkar-literature">Ambedkar and Literature</option>
                                    <option value="democracy-representation">Democracy, Representation, and Political Empowerment</option>
                                    <option value="cultural-resistance">Ambedkarite Art and Cultural Resistance Movements</option>
                                    <option value="national-security">Ambedkar and National Security and International Relations</option>
                                  </optgroup>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upload PDF / Paper</label>
                                <Input 
                                  type="file" 
                                  accept=".pdf,.doc,.docx"
                                  className="bg-slate-55 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800 focus:ring-1 focus:ring-brandBlue cursor-pointer file:text-brandBlue file:font-bold file:border-0 file:bg-brandBlue/10 file:px-3 file:py-1 file:rounded-lg file:mr-3 file:text-xs" 
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button type="submit" className="flex-grow bg-brandBlue hover:bg-brandBlue/90 text-white font-bold h-10 rounded-xl text-xs uppercase tracking-wider">
                                Register Submission Document
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
                {/* ═════════════════════ TAB: DONATIONS ═════════════════════ */}
                {activeTab === 'donations' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Donation &amp; Patron History</h2>
                        <p className="text-xs text-slate-550 mt-0.5 font-medium">Review your contributions and support history.</p>
                      </div>
                      <Link 
                        href="/donate"
                        className="bg-brandBlue text-white hover:bg-brandBlue/90 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brandBlue/15 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                      >
                        <Heart className="size-3.5 fill-current text-rose-400" /> New Donation
                      </Link>
                    </div>

                    {donationsLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-3xl">
                        <Loader2 className="size-8 text-brandBlue animate-spin mb-2" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading your donation history...</p>
                      </div>
                    ) : donations.length === 0 ? (
                      <Card className="border-slate-200 bg-white p-8 text-center rounded-3xl shadow-sm">
                        <CardContent className="flex flex-col items-center gap-4 pt-6">
                          <div className="size-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
                            <Heart className="size-8 fill-current" />
                          </div>
                          <div className="space-y-1 max-w-md">
                            <h3 className="text-base font-bold text-slate-800">No Donations Found</h3>
                            <p className="text-xs text-slate-550 leading-relaxed font-medium">
                              You haven't made any patron contributions under this email address ({user?.email}) yet. 
                              Your support empowers leadership research and legacy award ceremonies.
                            </p>
                          </div>
                          <Link
                            href="/donate"
                            className="mt-2 bg-brandBlue text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-brandBlue/90 shadow-md shadow-brandBlue/15 transition-all"
                          >
                            Become a Patron Today
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-slate-200 bg-white rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-4 font-bold text-[10px] text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-4 font-bold text-[10px] text-slate-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-5 py-4 font-bold text-[10px] text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-4 font-bold text-[10px] text-slate-500 uppercase tracking-wider">Receipt No.</th>
                                <th className="px-5 py-4 font-bold text-[10px] text-slate-550 uppercase tracking-wider text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {donations.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </td>
                                  <td className="px-5 py-4 text-xs font-bold text-slate-800">
                                    {item.purpose}
                                  </td>
                                  <td className="px-5 py-4 text-xs font-extrabold text-brandBlue">
                                    ₹{item.amount.toLocaleString('en-IN')}.00
                                  </td>
                                  <td className="px-5 py-4 text-xs font-mono text-slate-500">
                                    REC_{item.paymentId}
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <Link
                                      href={`/donate/success?id=${item.id}`}
                                      target="_blank"
                                      className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    >
                                      <Download className="size-3" /> Receipt
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
                {/* ═════════════════════ TAB: SETTINGS ═════════════════════ */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Account Settings</h2>
                        <p className="text-xs text-slate-550 mt-0.5 font-medium">Manage your security, profile details, and privacy preferences.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        
                        {/* PROFILE & IDENTITY */}
                        <Card className="border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                            <UserIcon className="size-4 text-brandBlue" /> Profile &amp; Identity
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Display Name</label>
                              <div className="flex gap-2">
                                <input type="text" defaultValue={memberData?.name || ''} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-brandBlue" />
                                <Button variant="outline" className="text-xs font-semibold px-4 rounded-lg bg-slate-100 hover:bg-slate-200 border-slate-200">Update</Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Language</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2">
                                  <option>English (US)</option>
                                  <option>Hindi (IN)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Timezone</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2">
                                  <option>(UTC+05:30) Asia/Kolkata</option>
                                  <option>(UTC+00:00) GMT</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Right Column */}
                      </div>

                      <div className="space-y-6">
                        {/* PRIVACY & DATA */}
                        <Card className="border-slate-200 bg-white p-5 rounded-2xl shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                            <ShieldAlert className="size-4 text-brandBlue" /> Privacy &amp; Data
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">Download My Data</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Export a JSON file of all your account data.</p>
                              </div>
                              <Button variant="outline" className="text-xs font-semibold bg-white rounded-lg px-4 border-slate-200 hover:bg-slate-100 flex items-center gap-1.5">
                                <Download className="size-3.5" /> Export
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                              <div>
                                <p className="text-sm font-semibold text-rose-800">Account Deletion</p>
                                <p className="text-[10px] text-rose-600/70 mt-0.5">Permanently delete your account and data.</p>
                              </div>
                              <Button variant="destructive" className="text-xs font-semibold rounded-lg px-4 bg-rose-600 hover:bg-rose-700 text-white">
                                Request Deletion
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </main>

              {/* Corporate Footer */}
              {activeTab !== 'checkout' && (
                <footer className="border-t border-slate-200 bg-white py-6 text-center text-[10px] text-slate-500 font-normal mt-auto">
                  <p>© 2026 <span translate="no" className="notranslate">Vishwa Leader</span> Techmedia Private Limited. All Rights Reserved.</p>
                </footer>
              )}

            </SidebarInset>

          </SidebarProvider>
        </div>
      )}

      {/* Floating status alert toast */}
      {toastVisible && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-slate-900 border border-slate-800 text-white text-sm font-semibold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 flex items-center gap-3">
          <CheckCircle className="size-5 shrink-0 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Re-register Custom Confirmation Modal */}
      {showReRegisterModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Edit Your Selections?</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                This will take you back through the registration wizard so you can change your selected packages. 
                <br /><br />
                <strong className="text-slate-700">Don't worry:</strong> Your existing profile details and document uploads will be safely kept.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowReRegisterModal(false)}
                  className="rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold px-5"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={async () => {
                    try {
                      if (!user) return;
                      await updateDoc(doc(db, 'users', user.uid), { legalConsent: false, wizardIntents: [] });
                      setMemberData((prev: any) => ({ ...prev, legalConsent: false, wizardIntents: [] }));
                      setWizardIntents([]);
                      setWizardEventCategories([]);
                      localStorage.removeItem('vishwa_wizard_draft');
                      sessionStorage.removeItem('wizardDraft');
                      setWizardStep(0);
                      
                      setShowReRegisterModal(false);
                      setReRegisterMode(true);
                    } catch (e) {
                      showToast("Could not reset registration. Please try again.");
                    }
                  }}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 px-6 transition-all"
                >
                  Yes, Re-register
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Billing / Receipt Modal ── */}

    </>
  );
}
