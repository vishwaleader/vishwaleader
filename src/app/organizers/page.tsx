"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User as UserIcon, Users, Shield, Briefcase, Trophy, Globe, GraduationCap, Gavel, BookOpen, Cpu } from 'lucide-react';
import Preloader from '@/components/Preloader';

export default function OrganizersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleActionClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/auth/member");
    } else {
      const provider = new GoogleAuthProvider();
      try {
        setLoadingAuth(true);
        await signInWithPopup(auth, provider);
        router.push("/auth/member");
      } catch (err: any) {
        if (
          err?.code === 'auth/cancelled-popup-request' ||
          err?.code === 'auth/popup-closed-by-user' ||
          err?.code === 'auth/popup-blocked'
        ) {
          return;
        }
        console.error("Login failed:", err);
      } finally {
        setLoadingAuth(false);
      }
    }
  };

  if (loadingAuth) return <Preloader />;
  return (
    <div className="min-h-screen bg-white font-sans pb-32">

      <main className="pb-16 md:pb-20">
        
        {/* Hero Section */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mb-16">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/20 mb-6 backdrop-blur-sm">
              <Users className="w-4 h-4 text-amber-400" />
              Event Organizers
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
              Organizing Committee
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              Vishwa Leader Dr. B. R. Ambedkar International Awards 2026
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">

        {/* Supreme Mentors / Honorable Guests Section */}
        <div className="mb-16 bg-slate-900 rounded-2xl p-8 md:p-12 border border-slate-800 shadow-xl text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-brandBlue/20 text-brandBlue rounded-full flex items-center justify-center shrink-0 border border-brandBlue/30 mb-6">
            <Users className="size-10" />
          </div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Honorable Mentors</h2>
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 justify-center items-center w-full">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Hon. Bhimrao Yeshwant Ambedkar</h3>
              <p className="text-brandBlue font-medium text-lg">Grandson of Dr. B.R. Ambedkar</p>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-800"></div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Hon. Anandraj Yeshwant Ambedkar</h3>
              <p className="text-brandBlue font-medium text-lg">Grandson of Dr. B.R. Ambedkar</p>
            </div>
          </div>
        </div>

        {/* Patrons & Mentors Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-brandBlue rounded-full flex items-center justify-center mb-6">
              <Globe className="size-8" />
            </div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Chief Patron</h2>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Lord Rami Ranger, CBE</h3>
            <p className="text-slate-500">Baron of Mayfair, House of Lords (UK Parliament)</p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Users className="size-8" />
            </div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Chief Mentor</h2>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Mr. Ramesh Klair</h3>
            <p className="text-slate-500">CEO, Azad TV, London</p>
          </div>
        </div>

        {/* Mentors */}
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="size-6 text-brandBlue" />
            <h2 className="text-2xl font-bold text-slate-900">Mentors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Lama Atuk Tsetan (Dharmashala)</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Hon. Ms. Tsering Yangkey (Tibetan Ambassador, London)</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Ravi Sunder (Norway)</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Padmashree Dr. Kalpana Saroj</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Dr. Renu Raj (London)</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Shivshankar Lature</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Suhailbhai Khandawani</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Ganpatbhai Kothari</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Prof. Dr. Avatthi Ramaiah (TISS)</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Prof. Dr. Shailesh Darogar (TISS)</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Dr. Sangram Patil (Wales, UK)</p></div>
            <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Vilas Sakhare (Governor Lions Club Maharashtra State)</p></div>
          </div>
        </div>

        {/* Organizing Secretaries */}
        <div id="organizing-secretaries" className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <Users className="size-6 text-brandBlue" />
            <h2 className="text-2xl font-bold text-slate-900">Organizing Secretaries</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
            {[
              'Dr. Sushant Godghate (AIM-Japan)', 'Dr. Prashant Godghate (AIM-Japan)', 'Dr. Vishal Dhamgaye (UK)', 'Ms. Sanskruti Borikar (London)', 'Dr. Nitin Thulkar (UK)', 'Dr. Abhidhamma Kaninde (UK)', 'Capt. Vinay Bambole', 'Capt. Shrikant Gondane', 'Captain Kshiteej Savardekar', 'Dr. Revat Kaninde', 'Prof. Dr. Bapusaheb Kamble', 'Mr. Pratap Tambe (London)', 'Prof. Dr. Arvind Kumar (London)', 'Dr. Shrikant Borkar (London)', 'Dr. Asang Wankhede (London)', 'Mr. Shrikant Dhamgaye (Abu Dhabi)', 'Mrs. Deepak Jyoti (Punjab)', 'Mr. Amit Tambe (Mumbai President, Employment Wing, RPI)', 'Mr. Pramod Wakode', 'Mr. Rajesh Khade', 'Mr. Sunil Bhalerao', 'Mr. Vikas Tatad (USA)', 'Mr. Bhimrao Sawatkar', 'Mr. Inder Iqbal Singh Atwal (Delhi)', 'Prof. Dr. Mangesh Bansod', 'Dr. Tushar Jagtap', 'Mr. Spandan Govind Raju (Andhra Pradesh)', 'Dr. Sushant Meshram', 'Mr. Anant Puradkar', 'Mr. Prasenjit Telgote', 'Mr. Bhajansingh Birdi (Punjab)', 'Mr. Digambar Chavan', 'Mr. Ghansham Chirankar', 'Mr. Ravi Garud', 'Mr. Pritam Sharma', 'Mr. Rajan Jadhav', 'Mr. Sandesh Shinde', 'Mr. Sanju Bhalerao', 'Ms. Priyanka Bemal', 'Prof. Dr. Sunil Kadam', 'Mr. Prakash Bhowre (Oman)', 'Mr. Ashishkumar Yesankar (Oman)', 'Dr. Vilas Jadhav', 'Mr. Narinder Khera (Canada)', 'Mr. Bhola Heer (Spain)', 'Mr. Surjit Rattu (Netherlands)', 'Mr. Avtar Chand Sodhi (Greece)', 'Mr. K. P. Chowdhary (Delhi)', 'Prakash Ayer (Netherlands)', 'Mr. Sachin Kamble', 'Mr. Bhushan Kedare', 'Mr. Rajabhau Gadling', 'Mr. Vitthal Sakpal', 'Mr. Kishor Jawade', 'Mr. Bandu Pandit', 'Mr. Abhay Mohite', 'Mr. Karning', 'Mr. Rajshekhara (Karnataka)', 'Mr. Chandrakant Ujgare (Hyderabad)', 'Mr. Bhaskar Jadhav', 'Mr. Anand Maske', 'Mr. Aman Kamble', 'Mr. Rajesh Kamble', 'Mr. Pravin Nikhade (Buddhist Society of India)', 'Mr. Amit Tambe', 'Mr. Krishna Murti Dasari', 'Mrs. Ashalata Kamble', 'Mrs. Urmila Pawar', 'Mrs. Sharda Navle', 'Mrs. Vishakha Gaikwad', 'Dr. Sonia Sawant', 'Mr. Milind Lonpande', 'Mr. Sudesh Kundar', 'Mr. Sachin Dongre', 'Mr. Dinesh Adole', 'Mr. Ashok Harsh', 'Mr. Sharan Meti'
            ].map((name, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                <p className="text-slate-700">{name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Advisors & Advisory Board */}
        <div id="advisory-board" className="grid lg:grid-cols-3 gap-8 mb-16 scroll-mt-24">
          <div className="lg:col-span-1 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Gavel className="size-6 text-brandBlue" />
              <h2 className="text-2xl font-bold text-slate-900">Legal Advisors</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Dr. Renu Raj</h3>
                <p className="text-sm text-slate-500 mt-1">Randanks Limited, Mediation & Litigation Global, London, UK (CEO & Founder, Alternate Dispute Resolution Mediation Training, Services & Litigation, London, UK)</p>
              </div>
              <div className="w-full h-px bg-slate-100"></div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Dr. Manoj Gorkela</h3>
                <p className="text-sm text-slate-500 mt-1">BSLS, LLB, LLD (Hon.) Counsel for Govt. of India At Supreme Court of India. Special Counsel Govt. of MP & Chhattisgarh At Supreme Court of India</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="size-6 text-brandBlue" />
              <h2 className="text-2xl font-bold text-slate-900">International Advisory Board</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Mr. Mahesh Wasnik (USA)', 'Dr. C. L. Thool (Ex-Justice)', 'Dr. Bhagwan Gawai', 'Dr. Praful Lokhande', 'Mr. Sanjay Sonawane', 'Mr. Ajay Mohite', 'Mr. Shirish Patel (USA)', 'Ms. Vandana Apranti (London)', 'Prof. Dr. Lalit Khandare (USA)', 'Prof. Dr. Kaushal Panwar (Delhi)', 'Prof. Dr. Gautama Prabhu (Chennai)', 'Prof. Dr. Kevin Brown (USA)', 'Prof. Dr. Nani Walker (USA)', 'Prof. Dr. Scott Stroud (USA)', 'Prof. Dr. Smita Ekka Dewan (USA)', 'Prof. Dr. Vivek Kumar (Delhi)', 'Mr. Rajesh Chavda (London)', 'Mr. Aniruddha Wanjari (Japan)', 'Ms. Ashmita Wanjari (Japan)', 'Mr. Jagdish Bankar (Ambedkarite Buddhist Association of Texas [ABAT], USA)', 'Mr. Gary Bhaga (USA)', 'Prof. Dr. Sandeep Kindo', 'Brigadier Sudhir Sawant', 'Mr. Subachan Ram', 'Dr. Devender Singh (Jt. Dean Delhi Univesity)', 'Dr. Manisha Karne', 'Dr. Sumedh Pardhe', 'Dinesh Waghmare (Ex.IAS)', 'Ramesh Janjal', 'Lalit Khobragade', 'Prof. Vaishali Bambole (MU)', 'Capt. Santoshkumar Darokar', 'Dr. Sachin Kharat', 'Irfan Engineer', 'Dr. Prashant Nanaware (IAS)', 'Dr. Dinesh Waghmare (IAS)', 'Mr. Sudhakar Suradkar (Ex IPS)', 'Mr. Anand Ramteke'].map((name, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Committees Section */}
        <div className="space-y-8">
          
          <div id="conference-committee" className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm scroll-mt-24">
            <div className="flex items-center gap-3 mb-8">
              <Globe className="size-6 text-brandBlue" />
              <h2 className="text-2xl font-bold text-slate-900">International Conference Committee</h2>
            </div>
            
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Chief Convener</h3>
              <p className="font-bold text-slate-900 text-lg">Dr. Rajesh Karankal</p>
              <p className="text-slate-500 text-sm">Dept. of English University of Mumbai, Former HOD</p>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Co-Convenors</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Prof. Dr. Vaishali Bambole</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Dr. Rajesh Chavda</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Abhishek Bhosle</p></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Members</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Dr. Vishal Dhamgaye</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Gaurav Pathaniya</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Mahendra Kumar Anand</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Capt. Vinay Bambole</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Capt. Kshiteej Sawardekar</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Ashishkumar Yesankar</p></div>
                <div className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">Mr. Spandan Govind Raju</p></div>
              </div>
            </div>
          </div>

          <div id="business-summit-committee" className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm scroll-mt-24">
            <div className="flex items-center gap-3 mb-8">
              <Briefcase className="size-6 text-brandBlue" />
              <h2 className="text-2xl font-bold text-slate-900">Business Summit Committee</h2>
            </div>
            
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Chief Convener</h3>
              <p className="font-bold text-slate-900 text-lg">Capt. Vinay Bambole</p>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Co-Convenors</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {['Mr. Sharan Meti', 'Dr. Sushant Meshram', 'Mr. Rajesh Kamble', 'Mr. Mahesh Khaire'].map((name, i) => (
                  <div key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">{name}</p></div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Members</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {['Mrs. Vaishali Bambole', 'Mr. Pramod Wakode', 'Capt. Pravin Nikhade', 'Mr. Inder Iqbal Singh Aitwal', 'Mr. Girish Wankhede', 'Dr. Kamlesh Mohod', 'Mr. Amit Tambe', 'Mr. Ghanshyam Chirankar', 'Mr. Ramesh Klair', 'Mr. Shirish Ramteke'].map((name, i) => (
                  <div key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">{name}</p></div>
                ))}
              </div>
            </div>
          </div>

          <div id="awards-committee" className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm scroll-mt-24">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="size-6 text-brandBlue" />
              <h2 className="text-2xl font-bold text-slate-900">Awards Committee</h2>
            </div>
            
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Chief Convener</h3>
              <p className="font-bold text-slate-900 text-lg">Prof. Dr. Mangesh Bansod</p>
              <p className="text-slate-500 text-sm">Theatre Department. University of Mumbai.</p>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Co-Convenors</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {['Ms. Sanskruti Borikar', 'Mr. Ashishkumar Yesankar', 'Mr. Jagdish Bankar', 'Mr. Waheed Khan', 'Mr. Nirbhay Ramteke'].map((name, i) => (
                  <div key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">{name}</p></div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Members</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Note: Ms. Kashish Shah is explicitly excluded from this list per instructions */}
                {['Dr. Abhidhamma Kaninde', 'Dr. Rewat Kaninde', 'Dr. Sachin Kharat', 'Brigadier Sudhir Sawant', 'Mr. Spandan Govind Raju', 'Mr. Shirish Ramteke', 'Mr. Sarfaraaz Sayyed', 'Mr. Sharan Meti', 'Ms. Muskan Mujawar'].map((name, i) => (
                  <div key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">{name}</p></div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="size-6 text-brandBlue" />
              <h2 className="text-2xl font-bold text-slate-900">Souvenir Committee</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Note: Ms. Kashish Shah is explicitly excluded from this list per instructions */}
              {['Mr. Shirish Ramteke', 'Mr. Ramesh Klair', 'Mr. Rajesh Karankal', 'Prof. Vaishali Bambole', 'Mr. Lalit Khandare', 'Mr. Ashishkumar Yesankar', 'Mr. Spandan Govind Raju', 'Mr. Waheed Khan', 'Ms. Muskan Mujawar', 'Mr. Nirbhay Ramteke'].map((name, i) => (
                <div key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" /><p className="text-slate-700">{name}</p></div>
              ))}
            </div>
          </div>

        </div>

        {/* Technology Partner Section */}
        <div className="mt-16 bg-black rounded-2xl p-8 md:p-12 border border-slate-800 shadow-xl text-center md:text-left flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-brandBlue/20 text-brandBlue rounded-full flex items-center justify-center shrink-0 border border-brandBlue/30">
            <Cpu className="size-10" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Official Technology Partner</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Mr. Yash Shirish Ramteke</h3>
            <p className="text-brandBlue font-medium text-lg mb-4">Founder & Lead Architect, Opendev-Labs</p>
            <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
              Opendev-Labs is the official technology subsidiary of Vishwa Leader, specializing in custom websites, mobile apps, and enterprise software solutions.
            </p>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
