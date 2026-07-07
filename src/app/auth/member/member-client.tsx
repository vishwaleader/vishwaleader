"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createDynamicOrder, verifyDynamicPayment } from "@/app/actions/paymentActions";
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

const PHONE_CODES_LIST = [
  "+91 (India)", "+1 (USA/Canada)", "+44 (UK)", "+61 (Australia)", "+971 (UAE)", "+49 (Germany)", "+33 (France)", "+81 (Japan)",
  "+86 (China)", "+27 (South Africa)", "+65 (Singapore)", "+64 (New Zealand)", "+39 (Italy)", "+34 (Spain)", "+41 (Switzerland)",
  "+46 (Sweden)", "+31 (Netherlands)", "+55 (Brazil)", "+52 (Mexico)", "+7 (Russia/Kazakhstan)", "+20 (Egypt)", "+234 (Nigeria)",
  "+254 (Kenya)"
];

const AutocompleteInput = ({ value, onChange, options, placeholder, required, className }: any) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        type="text"
        value={value}
        onChange={(e: any) => {
          onChange(e);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className={className}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {showDropdown && filteredOptions.length > 0 && (
        <ul className="absolute z-[100] w-full mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg text-xs text-slate-800">
          {filteredOptions.map((opt: string, i: number) => (
            <li 
              key={i} 
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer transition-colors duration-150"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const finalValue = opt.split(' (')[0];
                onChange({ target: { value: finalValue } });
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

export default function MemberClientPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') as 'dashboard' | 'registration' | 'uploads' | 'payment' | 'submissions' || 'dashboard';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Registration and Firestore user document state
  const [memberData, setMemberData] = useState<any>({
    name: "",
    email: "",
    photoURL: "",
    gender: "",
    age: "",
    nationality: "",
    city: "",
    wheelchairSupport: false,
    designation: "Member Delegate",
    organization: "Independent Scholar",
    sector: "Academic/Research",
    country: "India",
    phone: "",
    bio: "Delegate participating in Vishwa Leader research panels.",
    passportNumber: "",
    fullAddress: "",
    nominationCategory: "ambedkar-awards",
    delegateType: "conference",
    participationCategories: [],
    eventDays: [],
    purpose: "",
    visaSupport: false,
    accommodationSupport: false,
    packageTour: "None",
    dietaryNotes: "",
    paymentStatus: "Unpaid",
    legalConsent: false,
    headshotUrl: "",
    passportFrontUrl: "", passportBackUrl: "",
    evidenceUrl: ""
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registration' | 'uploads' | 'payment' | 'submissions'>(defaultTab);

  // Dynamic Payment States
  const [selectedAlaCarte, setSelectedAlaCarte] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleAlaCarteToggle = (item: string) => {
    setSelectedPackage(null); // Mutual exclusivity
    setSelectedAlaCarte(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handlePackageSelect = (pkg: string) => {
    setSelectedAlaCarte([]); // Mutual exclusivity
    setSelectedPackage(pkg);
  };

  const calculateDynamicTotal = () => {
    let total = 0;
    if (selectedPackage === 'pkg_1') total = 310000;
    else if (selectedPackage === 'pkg_2') total = 235000;
    else if (selectedPackage === 'pkg_3') total = 200501;
    else if (selectedPackage === 'pkg_4') total = 131000;
    else {
      if (selectedAlaCarte.includes('day_1')) total += 5900;
      if (selectedAlaCarte.includes('day_2')) total += 11800;
      if (selectedAlaCarte.includes('day_3')) total += 5900;
      
      if (selectedAlaCarte.includes('ad_front_cover')) total += 500000;
      if (selectedAlaCarte.includes('ad_back_cover')) total += 200000;
      if (selectedAlaCarte.includes('ad_inside_cover')) total += 150000;
      if (selectedAlaCarte.includes('ad_double_spread')) total += 100000;
      if (selectedAlaCarte.includes('ad_full_page')) total += 50000;
      if (selectedAlaCarte.includes('ad_half_page')) total += 25000;
      if (selectedAlaCarte.includes('ad_quarter_page')) total += 15000;
    }
    return total;
  };

  // Registration form field states
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
  const [profileCategory, setProfileCategory] = useState("ambedkar-awards");
  const [profileDelegateType, setProfileDelegateType] = useState("conference");
  const [profileParticipationCategories, setProfileParticipationCategories] = useState<string[]>([]);
  const [profileEventDays, setProfileEventDays] = useState<string[]>([]);
  const [profilePurpose, setProfilePurpose] = useState("");
  const [profileVisaSupport, setProfileVisaSupport] = useState(false);
  const [profileAccommodation, setProfileAccommodation] = useState(false);
  const [profilePackageTour, setProfilePackageTour] = useState("None");
  const [profileDietary, setProfileDietary] = useState("");
  const [profileCountry, setProfileCountry] = useState("India");
  const [profileLegalConsent, setProfileLegalConsent] = useState(false);

  // File Upload statuses
  const [headshotUploading, setHeadshotUploading] = useState(false);
  const [headshotProgress, setHeadshotProgress] = useState(0);

  const [passportFrontUploading, setPassportFrontUploading] = useState(false);
  const [passportFrontProgress, setPassportFrontProgress] = useState(0);
  const [passportBackUploading, setPassportBackUploading] = useState(false);
  const [passportBackProgress, setPassportBackProgress] = useState(0);

  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const [evidenceProgress, setEvidenceProgress] = useState(0);

  // Submissions lists states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showSubForm, setShowSubForm] = useState(true);
  const [subTitle, setSubTitle] = useState("");
  const [subAuthors, setSubAuthors] = useState("");
  const [subTheme, setSubTheme] = useState("primary");
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
              bio: "Delegate participating in Vishwa Leader research panels.",
              passportNumber: "",
              fullAddress: "",
              nominationCategory: "ambedkar-awards",
              delegateType: "conference",
              participationCategories: [],
              eventDays: [],
              purpose: "",
              visaSupport: false,
              accommodationSupport: false,
              packageTour: "None",
              dietaryNotes: "",
              paymentStatus: "Unpaid",
              legalConsent: false,
              headshotUrl: "",
              passportFrontUrl: "", passportBackUrl: "",
              evidenceUrl: ""
            };
            await setDoc(userRef, newMember);
            setMemberData(newMember);
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
          // Set standard defaults so dashboard is NEVER blank
          setMemberData({
            name: currentUser.displayName || "Delegate",
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
            bio: "Delegate participating in Vishwa Leader research panels.",
            passportNumber: "",
            fullAddress: "",
            nominationCategory: "ambedkar-awards",
            delegateType: "conference",
            participationCategories: [],
            eventDays: [],
            purpose: "",
            visaSupport: false,
            accommodationSupport: false,
            packageTour: "None",
            dietaryNotes: "",
            paymentStatus: "Unpaid",
            legalConsent: false,
            headshotUrl: "",
            passportFrontUrl: "", passportBackUrl: "",
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
      setProfileGender(memberData.gender || "");
      setProfileAge(memberData.age || "");
      setProfileNationality(memberData.nationality || "");
      setProfileCity(memberData.city || "");
      setProfileState(memberData.state || "");
      setProfileWheelchair(memberData.wheelchairSupport || false);
      setProfileDesignation(memberData.designation || "Member Delegate");
      setProfileOrganization(memberData.organization || "Independent Scholar");
      setProfileSector(memberData.sector || "Academic/Research");
      setProfilePhone(memberData.phone || "");
      setProfileBio(memberData.bio || "");
      setProfilePassport(memberData.passportNumber || "");
      setProfileAddress(memberData.fullAddress || "");
      setProfileCategory(memberData.nominationCategory || "ambedkar-awards");
      setProfileDelegateType(memberData.delegateType || "conference");
      setProfileParticipationCategories(memberData.participationCategories || []);
      setProfileEventDays(memberData.eventDays || []);
      setProfilePurpose(memberData.purpose || "");
      setProfileVisaSupport(memberData.visaSupport || false);
      setProfileAccommodation(memberData.accommodationSupport || false);
      setProfilePackageTour(memberData.packageTour || "None");
      setProfileDietary(memberData.dietaryNotes || "");
      setProfileCountry(memberData.country || "India");
      setProfileLegalConsent(memberData.legalConsent || false);
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
    const selectedItems = selectedPackage ? [selectedPackage] : selectedAlaCarte;
    if (selectedItems.length === 0) {
      showToast("Please select at least one item to purchase.");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Could not load payment gateway script. Please verify your connection.");
      return;
    }

    // 1. Create order on the secure Server Action
    const result = await createDynamicOrder(selectedItems);

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

  // Firebase Storage upload helper
  const uploadFileToStorage = (file: File, type: 'headshot' | 'passportFront' | 'passportBack' | 'evidence') => {
    if (!user) return;
    
    // Set status
    if (type === 'headshot') { setHeadshotUploading(true); setHeadshotProgress(0); }
    if (type === 'passportFront') { setPassportFrontUploading(true); setPassportFrontProgress(0); }
    if (type === 'passportBack') { setPassportBackUploading(true); setPassportBackProgress(0); }
    if (type === 'evidence') { setEvidenceUploading(true); setEvidenceProgress(0); }

    const storagePath = `users/${user.uid}/${type}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (type === 'headshot') setHeadshotProgress(progress);
        if (type === 'passportFront') setPassportFrontProgress(progress);
        if (type === 'passportBack') setPassportBackProgress(progress);
        if (type === 'evidence') setEvidenceProgress(progress);
      }, 
      (error) => {
        console.error("Storage upload error:", error);
        showToast("File upload failed.");
        if (type === 'headshot') setHeadshotUploading(false);
        if (type === 'passportFront') setPassportFrontUploading(false);
        if (type === 'passportBack') setPassportBackUploading(false);
        if (type === 'evidence') setEvidenceUploading(false);
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save link directly to Firestore delegate profile
          const userRef = doc(db, "users", user.uid);
          const updateField = type === 'headshot' ? 'headshotUrl' : 
                          type === 'passportFront' ? 'passportFrontUrl' : 
                          type === 'passportBack' ? 'passportBackUrl' : 
                          'evidenceUrl';
          
          await updateDoc(userRef, { [updateField]: downloadURL });
          setMemberData((prev: any) => ({ ...prev, [updateField]: downloadURL }));
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
          if (type === 'headshot') setHeadshotUploading(false);
          if (type === 'passportFront') setPassportFrontUploading(false);
        if (type === 'passportBack') setPassportBackUploading(false);
          if (type === 'evidence') setEvidenceUploading(false);
        }
      }
    );
  };

  // Save delegate details form
  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
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
        delegateType: profileDelegateType,
        participationCategories: profileParticipationCategories,
        eventDays: profileEventDays,
        purpose: profilePurpose,
        visaSupport: profileVisaSupport,
        accommodationSupport: profileAccommodation,
        packageTour: profilePackageTour,
        dietaryNotes: profileDietary,
        country: profileCountry,
        legalConsent: profileLegalConsent
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
                          <span>Abstract Submissions</span>
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
                  <img src={memberData?.headshotUrl || user.photoURL || "https://placehold.co/100x100"} referrerPolicy="no-referrer" alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
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
                          
                          
                          
                          {/* Section 1: Personal & Professional Details */}
                          <div className="space-y-4">
                            <h3 className="text-xs font-bold text-brandBlue uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                              <UserIcon className="size-4 shrink-0" />
                              <span>1. Personal & Professional Details</span>
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
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Gender</label>
                                <select 
                                  value={profileGender}
                                  onChange={(e) => setProfileGender(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800"
                                  required
                                >
                                  <option value="">Select Gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Age</label>
                                <Input 
                                  type="number" 
                                  value={profileAge}
                                  onChange={(e) => setProfileAge(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Age" 
                                  required 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Nationality</label>
                                <AutocompleteInput 
                                  value={profileNationality} 
                                  onChange={(e: any) => setProfileNationality(e.target.value)} 
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Nationality" 
                                  required={true} 
                                  options={COUNTRIES_LIST} 
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Sector</label>
                                <select 
                                  value={profileSector}
                                  onChange={(e) => setProfileSector(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800"
                                >
                                  <option value="Academic / Research">Academic / Research</option>
                                  <option value="Business / Industry">Business / Industry</option>
                                  <option value="NGO / Social Sector">NGO / Social Sector</option>
                                  <option value="Media / Press">Media / Press</option>
                                  <option value="Arts & Culture">Arts & Culture</option>
                                  <option value="Government / Public Sector">Government / Public Sector</option>
                                  <option value="Student">Student</option>
                                  <option value="Other">Other:</option>
                                </select>
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
                                <AutocompleteInput 
                                  value={profilePhone} 
                                  onChange={(e: any) => setProfilePhone(e.target.value)} 
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="e.g. +91 9876543210" 
                                  required={true} 
                                  options={PHONE_CODES_LIST} 
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Full Residential / Postal Address</label>
                                <Input 
                                  type="text" 
                                  value={profileAddress}
                                  onChange={(e) => setProfileAddress(e.target.value)}
                                  className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                  placeholder="Street, Landmark" 
                                  required 
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">State / Province</label>
                                  <Input 
                                    type="text" 
                                    value={profileState}
                                    onChange={(e) => setProfileState(e.target.value)}
                                    className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                    placeholder="State" 
                                    required 
                                    autoComplete="address-level1"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">City</label>
                                  <Input 
                                    type="text" 
                                    value={profileCity}
                                    onChange={(e) => setProfileCity(e.target.value)}
                                    className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                    placeholder="City" 
                                    required 
                                    autoComplete="address-level2" 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Country of Residence</label>
                                  <AutocompleteInput 
                                    value={profileCountry} 
                                    onChange={(e: any) => setProfileCountry(e.target.value)} 
                                    className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                    placeholder="Country" 
                                    required={true} 
                                    options={COUNTRIES_LIST} 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Section 3: Event Preferences & Logistics */}
                          <div className="space-y-4 pt-2">
                            <h3 className="text-xs font-bold text-brandBlue uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                              <FileText className="size-4 shrink-0" />
                              <span>3. Delegation, Events & Logistics</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Primary Registration Delegate Type (For Billing)</label>
                                <select 
                                  value={profileDelegateType}
                                  onChange={(e) => setProfileDelegateType(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800"
                                >
                                  <option value="conference">Conference Delegate (₹5,000 + GST)</option>
                                  <option value="business">Business Summit Delegate (₹10,000 + GST)</option>
                                  <option value="awards">Awards & Cultural Ceremony Delegate (₹5,000 + GST)</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Nominated Award Category (Optional)</label>
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
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Participation Categories (Check all that apply)</label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                {["Delegate", "Research Paper Presenter", "Business Delegate", "Award Ceremony Delegate", "Volunteer", "Sponsor/Partner", "Media Representative", "VIP/VVIP"].map(cat => (
                                  <label key={cat} className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      checked={profileParticipationCategories.includes(cat)}
                                      onChange={(e) => {
                                        if (e.target.checked) setProfileParticipationCategories([...profileParticipationCategories, cat]);
                                        else setProfileParticipationCategories(profileParticipationCategories.filter(c => c !== cat));
                                      }}
                                      className="rounded text-brandBlue focus:ring-brandBlue"
                                    />
                                    <span>{cat}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Event Day Selection (Check days attending)</label>
                              <div className="flex flex-wrap gap-4 text-xs">
                                {["Day 1 (Academic Conference)", "Day 2 (Business Summit)", "Day 3 (Awards Ceremony)"].map(day => (
                                  <label key={day} className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      checked={profileEventDays.includes(day)}
                                      onChange={(e) => {
                                        if (e.target.checked) setProfileEventDays([...profileEventDays, day]);
                                        else setProfileEventDays(profileEventDays.filter(d => d !== day));
                                      }}
                                      className="rounded text-brandBlue focus:ring-brandBlue"
                                    />
                                    <span>{day}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Purpose & Interest in Event</label>
                              <textarea 
                                value={profilePurpose}
                                onChange={(e) => setProfilePurpose(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800 min-h-[60px]"
                                placeholder="Why are you attending? What are your key interests?"
                              ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Logistics & Support Requirements</label>
                                <div className="space-y-1.5 text-xs text-slate-700">
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={profileVisaSupport} onChange={(e) => setProfileVisaSupport(e.target.checked)} className="rounded text-brandBlue focus:ring-brandBlue" />
                                    <span>Require Official Invitation Letter for Visa</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={profileAccommodation} onChange={(e) => setProfileAccommodation(e.target.checked)} className="rounded text-brandBlue focus:ring-brandBlue" />
                                    <span>Require Assistance with Accommodation/Logistics</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={profileWheelchair} onChange={(e) => setProfileWheelchair(e.target.checked)} className="rounded text-brandBlue focus:ring-brandBlue" />
                                    <span>Differently abled / Requires Wheelchair Support</span>
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Package Tour Interest</label>
                                  <select 
                                    value={profilePackageTour}
                                    onChange={(e) => setProfilePackageTour(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brandBlue text-slate-800"
                                  >
                                    <option value="None">Not Interested / Managing my own</option>
                                    <option value="From India">From India (8 Days)</option>
                                    <option value="From Outside India">From Outside India (8 Days)</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Dietary Notes</label>
                                  <Input 
                                    type="text" 
                                    value={profileDietary}
                                    onChange={(e) => setProfileDietary(e.target.value)}
                                    className="bg-slate-50 border-slate-200 text-xs rounded-xl focus:border-brandBlue text-slate-800" 
                                    placeholder="e.g. Vegetarian, Halal" 
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Legal Consent */}
                            <div className="mt-6 pt-4 border-t border-slate-200">
                              <label className="flex items-start space-x-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={profileLegalConsent} 
                                  onChange={(e) => setProfileLegalConsent(e.target.checked)} 
                                  className="mt-1 rounded text-brandBlue focus:ring-brandBlue size-4 shrink-0"
                                  required
                                />
                                <span className="text-xs text-slate-700 leading-snug">
                                  <strong>Legal Declaration:</strong> I have read and agree to the Terms and Conditions and the Event Legal Note. I confirm that all information provided is accurate and I accept full responsibility for my registration.
                                </span>
                              </label>
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

                      {/* Card 2: Passport Front */}
                      <Card className="border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2. Passport Front</span>
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
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. Passport Back</span>
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
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Registration Payment</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify registration fees and trigger payments securely using Razorpay gateway.</p>
                      </div>
                    </div>

                    <div className="max-w-5xl mx-auto">
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

                          <div className="border border-slate-200 rounded-2xl p-5 space-y-6 bg-slate-50/50 shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left Side: A La Carte Options */}
                              <div className="space-y-3">
                                <div className="space-y-1 border-b border-slate-200 pb-2">
                                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">A La Carte Options</h4>
                                  <p className="text-[10px] text-slate-500">Build a custom itinerary. These are mutually exclusive with packages.</p>
                                </div>
                                <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
                                  {[
                                    { id: 'day_1', label: 'Day 1: International Conference', price: 5900 },
                                    { id: 'day_2', label: 'Day 2: International Business Summit', price: 11800 },
                                    { id: 'day_3', label: 'Day 3: International Awards', price: 5900 },
                                    { id: 'ad_front_cover', label: 'Souvenir: Front Cover (Premium)', price: 500000 },
                                    { id: 'ad_back_cover', label: 'Souvenir: Back Cover (Premium)', price: 200000 },
                                    { id: 'ad_inside_cover', label: 'Souvenir: Inside Front/Back Cover', price: 150000 },
                                    { id: 'ad_double_spread', label: 'Souvenir: Double Spread', price: 100000 },
                                    { id: 'ad_full_page', label: 'Souvenir: Full Page', price: 50000 },
                                    { id: 'ad_half_page', label: 'Souvenir: Half Page', price: 25000 },
                                    { id: 'ad_quarter_page', label: 'Souvenir: Quarter Page', price: 15000 }
                                  ].map(item => (
                                    <label key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-brandBlue transition-colors">
                                      <div className="flex items-center gap-3 w-2/3">
                                        <input 
                                          type="checkbox" 
                                          className="w-4 h-4 rounded text-brandBlue focus:ring-brandBlue border-slate-300"
                                          checked={selectedAlaCarte.includes(item.id)}
                                          onChange={() => handleAlaCarteToggle(item.id)}
                                        />
                                        <span className="text-xs font-semibold text-slate-700 leading-tight">{item.label}</span>
                                      </div>
                                      <span className="text-xs font-bold text-slate-900 w-1/3 text-right">₹{item.price.toLocaleString('en-IN')}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* Right Side: Tour Packages */}
                              <div className="space-y-3">
                                <div className="space-y-1 border-b border-slate-200 pb-2">
                                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All-Inclusive Tour Packages</h4>
                                  <p className="text-[10px] text-slate-500">Includes all event days registration fee (₹23,600). Select one package.</p>
                                </div>
                                <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
                                  {[
                                    { id: 'pkg_1', label: 'Package 1 (Land + Visa + Medical Ins + Air + Reg)', price: 310000 },
                                    { id: 'pkg_2', label: 'Package 2 (Land + Visa + Medical Ins + Air + Reg)', price: 235000 },
                                    { id: 'pkg_3', label: 'Package 3 (Land Only + Reg)', price: 200501 },
                                    { id: 'pkg_4', label: 'Package 4 (Land Only + Reg)', price: 131000 }
                                  ].map(pkg => (
                                    <label key={pkg.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-brandBlue transition-colors">
                                      <div className="flex items-center gap-3">
                                        <input 
                                          type="radio" 
                                          name="tour_package"
                                          className="w-4 h-4 text-brandBlue focus:ring-brandBlue border-slate-300"
                                          checked={selectedPackage === pkg.id}
                                          onChange={() => handlePackageSelect(pkg.id)}
                                        />
                                        <span className="text-xs font-semibold text-slate-700">{pkg.label}</span>
                                      </div>
                                      <span className="text-xs font-bold text-brandBlue text-right">₹{pkg.price.toLocaleString('en-IN')}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {/* Total Calculator */}
                            <div className="space-y-2.5 border-t border-slate-300 pt-4 mt-6">
                              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                                <span className="flex flex-col">
                                  <span>Total Amount Payable (+ 18% GST):</span>
                                  <span className="text-[9px] font-normal text-slate-400 italic">Settled in INR base currency</span>
                                </span>
                                <span className="text-brandBlue text-xl font-black font-mono flex flex-col items-end">
                                  <span>₹{calculateDynamicTotal().toLocaleString('en-IN')}</span>
                                  {currency.code !== 'INR' && calculateDynamicTotal() > 0 && (
                                    <span className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                      ~{currency.symbol}{(calculateDynamicTotal() / currency.rate).toFixed(2)} {currency.code}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Button 
                              onClick={handlePayment}
                              disabled={calculateDynamicTotal() === 0}
                              className={`w-full font-bold h-12 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 ${calculateDynamicTotal() > 0 ? 'bg-brandBlue hover:bg-brandBlue/90 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                            >
                              <CreditCard className="size-4" />
                              <span>{calculateDynamicTotal() > 0 ? `Pay ₹${calculateDynamicTotal().toLocaleString('en-IN')} via Razorpay` : 'Select items to pay'}</span>
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

              </main>

              {/* Corporate Footer */}
              <footer className="border-t border-slate-200 bg-white py-6 text-center text-[10px] text-slate-500 font-normal">
                <p>© 2026 <span translate="no" className="notranslate">Vishwa Leader</span> Techmedia Private Limited. All Rights Reserved.</p>
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
