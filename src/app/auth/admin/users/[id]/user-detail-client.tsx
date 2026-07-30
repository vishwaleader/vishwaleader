"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, UserCheck, ShieldAlert, Mail, Phone, MapPin, Building, Briefcase, RefreshCw, ExternalLink, Download } from "lucide-react";
import { ProfilePDF } from "@/components/ProfilePDF";
import { getAdminUserData, verifyUserDocuments } from "@/app/actions/adminAuth";

const CustomPDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => {
  return function Viewer({ doc }: { doc: React.ReactElement }) {
    const [instance] = mod.usePDF({ document: doc as any });
    if (instance.loading) return <div className="flex items-center justify-center h-full text-slate-400">Generating Profile Dossier...</div>;
    if (instance.error) return <div className="flex items-center justify-center h-full text-rose-500">Error generating PDF</div>;
    return <iframe src={`${instance.url}#pagemode=thumbs`} width="100%" height="100%" className="border-none absolute inset-0 bg-white" />;
  };
}), { ssr: false });

export default function UserDetailClientPage({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [verificationData, setVerificationData] = useState<Record<string, { approved: boolean; feedback: string; label: string }>>({});

  const showToast = (message: string, type: "info" | "success" | "error" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const res = await getAdminUserData(userId);
      if (res.success && res.user) {
        setUser(res.user);
        const u = res.user;
        const initData: Record<string, { approved: boolean; feedback: string; label: string }> = {};
        const items = [
          { key: 'profile', label: 'Profile Details' },
          { key: 'headshot', label: 'Headshot Image' },
          { key: 'nationalId', label: 'National ID' },
          { key: 'passport', label: 'Passport (Front & Back)' },
          { key: 'evidence', label: 'Nomination Evidence' },
          { key: 'businessDeck', label: 'Business Deck' },
          { key: 'guests', label: 'Guest Details & Documents' },
        ];
        items.forEach(item => {
          initData[item.key] = u.verificationStatus?.[item.key] || { approved: true, feedback: '', label: item.label };
        });
        setVerificationData(initData);
      } else {
        setError(res.error || "User not found");
      }
      setLoading(false);
    }
    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mb-3" />
        <p className="text-sm font-medium text-slate-300">Loading User Dossier...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <AlertTriangle className="h-12 w-12 text-rose-400 mb-3" />
        <p className="text-lg font-bold">{error || "User not found"}</p>
        <Button onClick={() => router.push("/auth/admin")} className="mt-4 bg-slate-800 hover:bg-slate-700 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  // Missing info detection
  const missingPhoto = !(user.photoURL || user.headshotUrl);
  const missingDocs = !(user.nationalIdUrl || user.passportScanUrl || user.passportFrontUrl || user.evidenceUrl || user.businessDeckUrl);
  const missingInfoList: string[] = [];
  if (!user.name) missingInfoList.push("Full Name");
  if (!user.phone) missingInfoList.push("Contact Number");
  if (!user.country) missingInfoList.push("Country");
  if (!user.organization) missingInfoList.push("Organization");
  if (!user.designation) missingInfoList.push("Designation");
  if (user.packageTour && user.packageTour !== 'None' && !user.passportNumber) missingInfoList.push("Passport Number");
  if (missingPhoto) missingInfoList.push("Headshot Photo");
  if (missingDocs) missingInfoList.push("ID / Passport / Event Documents");

  const isSkipped = user.skippedRegistration === true;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[99999] px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md text-xs font-semibold ${
          toast.type === 'success' ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-100' :
          toast.type === 'error' ? 'bg-rose-950/95 border-rose-500/30 text-rose-100' :
          'bg-slate-900/95 border-slate-700 text-slate-100'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <Breadcrumb>
              <BreadcrumbList className="text-slate-400 text-xs">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/auth/admin" className="hover:text-white">Admin Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/auth/admin" className="hover:text-white">Member Directory</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-blue-400 font-medium">{user.name || user.email}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <span>{user.name || "Anonymous Member"}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                user.paymentStatus === 'Paid' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : user.paymentStatus === 'Partially Paid'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>{user.paymentStatus || 'Unpaid'}</span>
            </h1>
          </div>

          <Button onClick={() => router.push("/auth/admin")} variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Members
          </Button>
        </div>

        {/* Missing Details Banner */}
        {(missingInfoList.length > 0 || isSkipped) && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-5 text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>Incomplete Profile & Document Alert</span>
            </div>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              {isSkipped && <span className="font-semibold text-amber-300">[User Skipped Registration] </span>}
              The following required fields or documents are missing for this delegate:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {isSkipped && <span className="bg-amber-900/60 border border-amber-600/40 text-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg">Skipped Wizard</span>}
              {missingInfoList.map((item, idx) => (
                <span key={idx} className="bg-rose-950/60 border border-rose-500/30 text-rose-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                  Missing {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Profile Card & Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-blue-500/30 shadow-lg">
                    <AvatarImage src={user.photoURL || user.headshotUrl || ""} />
                    <AvatarFallback className="bg-blue-900 text-blue-200 font-bold text-xl">{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-white">{user.name || "No Name Provided"}</h3>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <p className="text-xs text-blue-400 font-medium">{user.delegateType || "General Delegate"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>{user.phone || <span className="text-rose-400 italic">No Phone</span>}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>{user.city ? `${user.city}, ${user.country}` : (user.country || <span className="text-rose-400 italic">No Country</span>)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>{user.designation || <span className="text-rose-400 italic">No Designation</span>}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Building className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>{user.organization || <span className="text-rose-400 italic">No Organization</span>}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Account Details</p>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">User ID</span>
                    <span className="font-mono text-slate-200 truncate max-w-[180px]">{user.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Registration Status</span>
                    <span className={`font-semibold ${user.skippedRegistration ? 'text-amber-400' : user.legalConsent ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {user.skippedRegistration ? 'Skipped Wizard' : user.legalConsent ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Tour Package</span>
                    <span className="font-semibold text-slate-200">{user.packageTour || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Passport No.</span>
                    <span className="font-semibold text-slate-200">{user.passportNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* Financial Ledger & Part Payment Details */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Financial Ledger & Balance</p>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Total Package Price</span>
                    <span className="font-semibold text-white">₹{(user.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Amount Paid</span>
                    <span className="font-semibold text-emerald-400">₹{(user.amountPaid || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Remaining Balance</span>
                    <span className={`font-semibold ${(user.remainingBalance || 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                      ₹{(user.remainingBalance || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Uploaded Files</p>
                  <div className="space-y-1.5">
                    {user.headshotUrl && (
                      <a href={user.headshotUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-blue-400">
                        <span>Headshot Photo</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {user.nationalIdUrl && (
                      <a href={user.nationalIdUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-blue-400">
                        <span>National ID</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {user.passportFrontUrl && (
                      <a href={user.passportFrontUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-blue-400">
                        <span>Passport Front</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {user.passportBackUrl && (
                      <a href={user.passportBackUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-blue-400">
                        <span>Passport Back</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {user.evidenceUrl && (
                      <a href={user.evidenceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-blue-400">
                        <span>Nomination Evidence</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {user.businessDeckUrl && (
                      <a href={user.businessDeckUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-blue-400">
                        <span>Business Pitch Deck</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {user.paperUrl && (
                      <a href={user.paperUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-blue-400 font-bold border border-blue-500/30 bg-blue-950/40">
                        <span>Submitted Research Paper</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Verification & PDF Dossier */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Document Verification Box */}
            <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <CardTitle className="text-base font-bold text-white uppercase tracking-wide">Document Verification & Compliance</CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">Audit documents and send automatic re-upload requests if needed</CardDescription>
                </div>
                <Button
                  disabled={verifying}
                  onClick={async () => {
                    setVerifying(true);
                    showToast("Saving document verification status...", "info");
                    const res = await verifyUserDocuments(user.id, user.email, user.name, verificationData);
                    if (res.success) {
                      showToast("Verification saved successfully. Notifications sent if required.", "success");
                    } else {
                      showToast(`Failed: ${res.error}`, "error");
                    }
                    setVerifying(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4"
                >
                  {verifying ? "Saving..." : "Save & Notify User"}
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(verificationData).map(([key, data]) => (
                    <div key={key} className={`p-3 rounded-xl border transition-all ${data.approved ? 'bg-slate-800/50 border-slate-700' : 'bg-rose-950/40 border-rose-500/40'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{data.label}</span>
                        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                          <button
                            type="button"
                            onClick={() => setVerificationData(prev => ({ ...prev, [key]: { ...prev[key], approved: true } }))}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase transition-colors ${data.approved ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setVerificationData(prev => ({ ...prev, [key]: { ...prev[key], approved: false } }))}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase transition-colors ${!data.approved ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      {!data.approved && (
                        <div className="mt-2.5 space-y-1">
                          <label className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Rejection Feedback / Notes</label>
                          <Input
                            value={data.feedback}
                            onChange={(e) => setVerificationData(prev => ({ ...prev, [key]: { ...prev[key], feedback: e.target.value } }))}
                            placeholder="e.g. Image is blurry, please re-upload clear copy."
                            className="h-8 text-xs bg-slate-900 border-rose-500/30 text-rose-100 placeholder:text-rose-400/40"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profile Dossier PDF Viewer */}
            <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-base font-bold text-white uppercase tracking-wide">Generated Profile Dossier PDF</CardTitle>
                <CardDescription className="text-xs text-slate-400">Live preview of official registration dossier for this member</CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative min-h-[650px] bg-slate-950">
                <CustomPDFViewer doc={<ProfilePDF memberData={user} guestProfiles={user.guestProfiles || []} />} />
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
