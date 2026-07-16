"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Preloader from "@/components/Preloader";
import NetworkBackground from "@/components/NetworkBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader,
  SidebarFooter, SidebarRail, SidebarInset, SidebarTrigger, useSidebar
} from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Gauge, FileSpreadsheet, Database, RefreshCw, CheckCircle2, Clock,
  TrendingUp, MessageCircle, UserCheck, Wifi, Mail, Send,
  LayoutDashboard, ChartBar, Users, Search, LogOut, Megaphone
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import * as XLSX from "@e965/xlsx";
import dynamic from "next/dynamic";
import { ProfilePDF } from '@/components/ProfilePDF';
import { verifyUserDocuments } from "@/app/actions/adminAuth";

const CustomPDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => {
  return function Viewer({ doc }: { doc: React.ReactElement }) {
    const [instance] = mod.usePDF({ document: doc as any });
    if (instance.loading) return <div className="flex items-center justify-center h-full text-slate-400">Generating Profile Dossier...</div>;
    if (instance.error) return <div className="flex items-center justify-center h-full text-rose-500">Error generating PDF</div>;
    return <iframe src={`${instance.url}#pagemode=thumbs`} width="100%" height="100%" className="border-none absolute inset-0 bg-white" />;
  };
}), { ssr: false });

// Server Actions — run on server, bypass Firestore security rules entirely
import { loginAsAdmin, logoutAdmin, checkAdminSession, getAdminDashboardData, getAnnouncementSettings, updateAnnouncementSettings, getAdSettings, updateAdSettings } from "@/app/actions/adminAuth";
import { exportToGoogleSheets } from "@/app/actions/googleSheets";
import { getWebTrafficData } from "@/app/actions/analytics";
import { sendBroadcastEmail } from "@/app/actions/emailActions";

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

// ─── Admin Toast ────────────────────────────────────────────────────────────────
type ToastType = 'info' | 'success' | 'activity' | 'error';
function AdminToast({ toasts }: { toasts: { id: number; message: string; type: ToastType }[] }) {
  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-sm min-w-[300px] max-w-[400px] animate-slide-in-right pointer-events-auto ${
          t.type === 'activity' ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-50' :
          t.type === 'success'  ? 'bg-blue-950/95 border-blue-500/30 text-blue-50' :
          t.type === 'error'    ? 'bg-red-950/95 border-red-500/30 text-red-50' :
          'bg-slate-900/95 border-slate-600/30 text-slate-50'
        }`}>
          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${
            t.type === 'activity' ? 'bg-emerald-400' : t.type === 'success' ? 'bg-blue-400' : t.type === 'error' ? 'bg-red-400' : 'bg-slate-400'
          }`} />
          <p className="text-xs font-medium leading-relaxed">{t.message}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon, color }: { title: string; value: string | number; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function AdminClientPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Real data state — all populated by server action polling
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string>("");
  const [dataLoading, setDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // GA4 Data
  const [ga4Data, setGa4Data] = useState<any>(null);
  const [ga4Loading, setGa4Loading] = useState(false);

  // Editing & Verification
  const [editingUser, setEditingUser] = useState<any>(null);
  const [verificationData, setVerificationData] = useState<Record<string, { approved: boolean, feedback: string, label: string }>>({});
  const [verifying, setVerifying] = useState(false);

  // Toasts
  const [adminToasts, setAdminToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);
  const toastCounter = useRef(0);

  // Form UI state
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [userError, setUserError] = useState<'warning' | 'save' | 'close' | null>(null);
  const [passError, setPassError] = useState<'warning' | 'save' | 'close' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Announcements
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const prevUserIds = useRef<Set<string>>(new Set());
  const prevActivityIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastCounter.current;
    setAdminToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setAdminToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  // ── Session check on mount ────────────────────────────────────────────────────
  useEffect(() => {
    checkAdminSession().then(isAuth => {
      if (isAuth) setUser({ email: "vishwaleader@admin", displayName: "Admin" });
      setLoading(false);
    });
  }, []);

  useEffect(() => { setEditingUser(null); }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Announcements") {
      getAnnouncementSettings().then(res => {
        if (res.success && res.data) {
          setAnnouncementEnabled(res.data.enabled);
          setAnnouncementMessage(res.data.message);
        }
      });
    }
  }, [activeTab]);

  const handleSaveAnnouncement = async () => {
    setSavingAnnouncement(true);
    const res = await updateAnnouncementSettings(announcementEnabled, announcementMessage);
    if (res.success) {
      showToast("Announcement settings updated successfully", "success");
    } else {
      showToast(`Failed to update announcement: ${res.error}`, "error");
    }
    setSavingAnnouncement(false);
  };

  // ── Master data fetch via server action ───────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    try {
      const res = await getAdminDashboardData();
      if (!res.success || !res.data) {
        if (!silent) showToast(`Data fetch failed: ${res.error}`, 'error');
        return;
      }

      const { users: newUsers, inquiries: newInq, activity: newActivity } = res.data;

      // ── Detect new users since last poll ───────────────────────────────────
      if (!isFirstLoad.current) {
        newUsers.forEach((u: any) => {
          if (!prevUserIds.current.has(u.id)) {
            showToast(`🟢 New member: ${u.name || u.email}`, 'activity');
          }
        });
        newActivity.forEach((a: any) => {
          if (!prevActivityIds.current.has(a.id)) {
            const msgs: Record<string, string> = {
              user_joined:     `🎉 ${a.userName || 'Someone'} just joined`,
              profile_updated: `✏️ ${a.userName || 'Member'} updated their profile`,
              payment_made:    `💳 ${a.userName || 'Member'} completed payment`,
              file_uploaded:   `📎 ${a.userName || 'Member'} uploaded a document`,
            };
            showToast(msgs[a.type] || `⚡ ${a.type}`, 'activity');
          }
        });
      }
      isFirstLoad.current = false;

      prevUserIds.current = new Set(newUsers.map((u: any) => u.id));
      prevActivityIds.current = new Set(newActivity.map((a: any) => a.id));

      setUsers(newUsers);
      setInquiries(newInq);
      setActivityFeed(newActivity);
      setLastSync(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e: any) {
      if (!silent) showToast(`Error: ${e.message}`, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [showToast]);

  // ── Initial fetch + polling every 8 seconds ───────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(() => fetchData(true), 8000);

    // Fetch GA4 once on load
    setGa4Loading(true);
    getWebTrafficData().then(res => {
      if (res.data || res.error) setGa4Data(res);
      setGa4Loading(false);
    });

    return () => clearInterval(interval);
  }, [user, fetchData]);

  // ── Export to Excel ───────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (users.length === 0) { showToast("No user data to export.", 'error'); return; }
    const rows = users.map(u => ({
      "User UID": u.id, "Full Name": u.name, "Email": u.email, "Phone": u.phone,
      "Designation": u.designation, "Organization": u.organization, "Sector": u.sector,
      "Country": u.country, "Gender": u.gender, "Age": u.age, "Nationality": u.nationality,
      "City": u.city, "Delegate Type": u.delegateType, "Nomination Category": u.nominationCategory,
      "Package": u.packageTour, "Visa Support": u.visaSupport ? "Yes" : "No",
      "Accommodation": u.accommodationSupport ? "Yes" : "No",
      "Payment Status": u.paymentStatus, "Role": u.role, "Registered At": u.joinedAt,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "VishwaLeader_Members.xlsx");
    showToast(`Exported ${users.length} members to Excel`, 'success');
  };

  // ── Export to Google Sheets ───────────────────────────────────────────────────
  const [exportingSheets, setExportingSheets] = useState(false);
  const handleExportGoogleSheets = async () => {
    if (users.length === 0) { showToast("No data to sync.", 'error'); return; }
    setExportingSheets(true);
    try {
      const res = await exportToGoogleSheets();
      if (res.success) showToast(`Synced ${res.count} members to Google Sheets!`, 'success');
      else showToast(`Sync failed: ${res.error}`, 'error');
    } catch (e: any) {
      showToast(`Error: ${e.message}`, 'error');
    } finally {
      setExportingSheets(false);
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setUserError(null);
    setPassError(null);

    let proceed = true;
    if (!email.trim()) { setUserError('warning'); proceed = false; }
    if (!password.trim()) { setPassError('warning'); proceed = false; }
    if (!proceed) { setIsProcessing(false); return; }

    const res = await loginAsAdmin(email, password);
    if (res.success) {
      setUserError('save');
      setPassError('save');
      setUser({ email, displayName: "Admin" });
    } else {
      setPassError('close');
      showToast(res.error || "Invalid credentials", 'error');
    }
    setIsProcessing(false);
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const handleLogout = async () => { await logoutAdmin(); setUser(null); };

  // ── Derived stats ─────────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const totalInquiries = inquiries.length;
  const onlineUsers = users.filter((u: any) => {
    if (u.isOnline) return true;
    if (u.lastSeen) {
      const d = new Date(u.lastSeen).getTime();
      return Date.now() - d < 10 * 60 * 1000;
    }
    return false;
  }).length;
  const paidUsers = users.filter((u: any) => u.paymentStatus === 'Paid').length;

  const filteredUsers = (searchQuery
    ? users.filter(u => `${u.name} ${u.email} ${u.organization} ${u.country}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : [...users]).sort((a: any, b: any) => {
      const tA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
      const tB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
      return tB - tA;
    });

  // Build chart data from real registration dates
  const chartData = React.useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const counts: Record<string, { members: number; inquiries: number }> = {};
    users.forEach((u: any) => {
      if (u.joinedAt) {
        const d = new Date(u.joinedAt);
        const key = months[d.getMonth()];
        if (!counts[key]) counts[key] = { members: 0, inquiries: 0 };
        counts[key].members++;
      }
    });
    inquiries.forEach((inq: any) => {
      if (inq.createdAt) {
        const d = new Date(inq.createdAt);
        const key = months[d.getMonth()];
        if (!counts[key]) counts[key] = { members: 0, inquiries: 0 };
        counts[key].inquiries++;
      }
    });
    
    // Ensure we always show the last 6 months to create a beautiful trend curve
    const currentMonthIndex = new Date().getMonth();
    const result: { month: string; members: number; inquiries: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      let mIndex = currentMonthIndex - i;
      if (mIndex < 0) mIndex += 12;
      const monthKey = months[mIndex];
      const data = counts[monthKey] || { members: 0, inquiries: 0 };
      result.push({ month: monthKey, ...data });
    }
    return result;
  }, [users, inquiries]);

  if (loading) return <Preloader loading={true} />;

  // ── Login Screen ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <Preloader loading={false} />
        <div className="login-page-container-custom">
            <style dangerouslySetInnerHTML={{ __html: `
                @import 'https://fonts.googleapis.com/css?family=Open+Sans|Quicksand:400,700';
                .login-page-container-custom {
                    position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 99999;
                    overflow: auto; font-family: 'Quicksand', sans-serif;
                    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
                    background: #020617;
                }
                .login-page-container-custom *, .login-page-container-custom *::before, .login-page-container-custom *::after { box-sizing: border-box; }
                .login-page-container-custom h2, .login-page-container-custom h3 { font-size: 16px; letter-spacing: -1px; line-height: 20px; margin: 0; }
                .login-page-container-custom h2 { color: #2563eb; font-weight: 700; line-height: 1; }
                .login-page-container-custom h3 { color: #0f172a; text-align: right; }
                .login-page-container-custom .i { width: 20px; height: 20px; }
                .login-page-container-custom .i-login {
                    cursor: pointer;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 416.229 416.229'><path d='M403.729,29.65H71.802c-6.903,0-12.5,5.597-12.5,12.5v86.363c0,9.903,5.597,12.5,12.5,12.5s12.5-5.597,12.5-12.5V54.65 h306.927v306.928H84.302v-73.861c0-6.903-5.597-12.5-12.5-12.5s-12.5,5.597-12.5,12.5v86.361c0,6.903,5.597,12.5,12.5,12.5 h331.927c6.902,0,12.5-5.597,12.5-12.5V42.15C416.229,35.247,410.631,29.65,403.729,29.65z' fill='%232563eb'/><path d='M185.417,287.811c0,5.057,3.045,9.613,7.716,11.55c1.547,0.642,3.17,0.95,4.781,0.95c3.253,0,6.451-1.27,8.842-3.66 l79.697-79.697c2.344-2.344,3.66-5.523,3.66-8.839c0-3.316-1.316-6.495-3.66-8.839l-79.697-79.697 c-3.575-3.575-8.951-4.646-13.623-2.71c-4.671,1.936-7.716,6.493-7.716,11.549v67.197H12.5c-6.903,0-12.5,5.597-12.5,12.5 c0,9.903,5.597,12.5,12.5,12.5h172.917V287.811L185.417,287.811z M210.417,158.594l49.521,49.52l-49.521,49.521V158.594z' fill='%232563eb'/></svg>");
                    background-size: 18px 18px; background-repeat: no-repeat; background-position: center; transition: opacity 0.2s;
                }
                .login-page-container-custom .i-login:hover { opacity: 0.8; }
                .login-page-container-custom .i-more {
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 612 612'><path d='M76.5,229.5C34.3,229.5,0,263.8,0,306s34.3,76.5,76.5,76.5S153,348.2,153,306S118.7,229.5,76.5,229.5z M76.5,344.2 c-21.1,0-38.2-17.101-38.2-38.2c0-21.1,17.1-38.2,38.2-38.2s38.2,17.1,38.2,38.2C114.7,327.1,97.6,344.2,76.5,344.2z M535.5,229.5c-42.2,0-76.5,34.3-76.5,76.5s34.3,76.5,76.5,76.5S612,348.2,612,306S577.7,229.5,535.5,229.5z M535.5,344.2 c-21.1,0-38.2-17.101-38.2-38.2c0-21.1,17.101-38.2,38.2-38.2s38.2,17.1,38.2,38.2C573.7,327.1,556.6,344.2,535.5,344.2z M306,229.5c-42.2,0-76.5,34.3-76.5,76.5s34.3,76.5,76.5,76.5s76.5-34.3,76.5-76.5S348.2,229.5,306,229.5z M306,344.2 c-21.1,0-38.2-17.101-38.2-38.2c0-21.1,17.1-38.2,38.2-38.2c21.1,0,38.2,17.1,38.2,38.2C344.2,327.1,327.1,344.2,306,344.2z' fill='%232563eb'/></svg>");
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
                    background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDYxMi40NDUgNjEyLjQ0NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjEyLjQ0NSA2MTIuNDQ1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCI+CjxnPgoJPHBhdGggZD0iTTUyMi42NDIsODkuODA0QzQ2NC45LDMyLjA2MiwzODguMDExLDAsMzA2LjIyMywwUzE0Ny41NDUsMzIuMDYyLDg5LjgwNCw4OS44MDQgICBjLTExOS40MTYsMTE9MS40MTYtMTE5LjQxNiwzMTMuNDIyLDAsNDMyLjgzOGM1Ny43NDEsNTcuNzQxLDEzNC42MzEsODkuODA0LDIxNi40MTksODkuODA0ICAgQzY0Mi4wNTgsNDAzLjIyNSw2NDIuMDU4LDIwOS4yMiw1MjIuNjQyLDg5LjgwNHogTTUwMS43ODcsNTAxLjc4N2MtNTIuMTAxLDUyLjEwMS0xMjEuOTkxLDgwLjk3Mi0xOTUuNTY0LDgwLjk3MiAgIHMtMTQzLjQ2My0yOC44NzEtMTk1LjU2NC04MC45NzJTMjkuNjg3LDM3OS45OTUsMjkuNjg3LDMwNi4yMjNzMjguODcxLTE0My40NjMsODAuOTcyLTE5NS41NjRzMTIxLjg2Ni04MC45NzIsMTk1LjU2NC04MC45NzIgICBzMTQzLjQ2MywyOC44NzEsMTk1LjU2NCw4MC45NzJzODAuOTcyLDEyMS44NjYsODAuOTcyLDE5NS41NjRTNTUzLjg4Nyw0NDkuNjg2LDUwMS43ODcsNTAxLjc4N3ogTTM5OS4yMTgsMjM0Ljg5OWwtNzQuNTE1LDc0LjUxNSAgIGw3NC41MTUsNzQuNTE1YzUuNjQxLDUuNjQxLDUuNjQxLDE1LjIxNSwwLDIwLjg1NWMtMy4xOTEsMy4xOTEtNi4zODMsNC4wMDgtMTAuMzkxLDQuMDA4Yy00LjAwOCwwLTcuMTk5LTEuNjMzLTEwLjM5LTQuMDA4ICAgbC03NC41ODktNzQuNTE1bC03NC41ODksNzQuNTE1Yy0zLjE5MSwzLjE5MS02LjM4Myw0LjAwOC0xMC4zOSw0LjAwOHMtNy4xOTktMS42MzMtMTAuMzktNC4wMDggICBjLTUuNjQxLTUuNjQxLTUuNjQxLTE1LjIxNSwwLTIwLjg1NWw3NC41MTUtNzQuNW05bC03NC41MTUtNzQuNW05bC03NC41MTUtNzQuNTE1Yy01LjY0MS01LjY0MS01LjY0MS0xNS4yMTUsMC0yMC44NTUgICBjNS42NDEtNS42NDEsMTUuMjE1LTUuNjQxLDIwLjg1NSwwbDc0LjUxNSw3NC41MTVsNzQuNTE1LTc0LjUxNWM1LjY0MS01LjY0MSwxNS4yMTUtNS42NDEsMjAuODU1LDAgICBDNDA0Ljg1OCwyMTkuNjg1LDQwNC44NTgsMjI4LjQ0MiwzOTkuMjE4LDIzNC44OTl6IiBmaWxsPSIjZjU1YTRlIi8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz48L3N2Zz4K);
                    background-size: 20px 20px; background-repeat: no-repeat; background-position: center;
                }
                .login-page-container-custom .i-left {
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 414.298 414.299'><path d='M3.663,410.637c2.441,2.44,5.64,3.661,8.839,3.661c3.199,0,6.398-1.221,8.839-3.661l185.809-185.81l185.81,185.811 c2.44,2.44,5.641,3.661,8.84,3.661c3.198,0,6.397-1.221,8.839-3.661c4.881-4.881,4.881-12.796,0-17.679l-185.811-185.81 l185.811-185.81c4.881-4.882,4.881-12.796,0-17.678c-4.882-4.882-12.796-4.882-17.679,0l-185.81,185.81L21.34,3.663 c-4.882-4.882-12.796-4.882-17.678,0c-4.882,4.881-4.882,12.796,0,17.678l185.81,185.809L3.663,392.959 C-1.219,397.841-1.219,405.756,3.663,410.637z' fill='%232563eb'/></svg>");
                    background-size: 16px 16px; background-repeat: no-repeat; background-position: center;
                }
                .login-page-container-custom .box { width: 330px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
                .login-page-container-custom .box-form { width: 320px; position: relative; left: 0; z-index: 1; transition: all 0.3s; }
                .login-page-container-custom .box.info-opened .box-form { left: -37%; }
                .login-page-container-custom .box-login-tab {
                    width: 50%; height: 40px; background: #ffffff; position: relative; float: left; z-index: 1;
                    border-radius: 6px 6px 0 0; border: 1px solid rgba(37,99,235,0.25); border-bottom: none;
                    transform: perspective(5px) rotateX(0.93deg) translateZ(-1px); transform-origin: 0 0;
                    backface-visibility: hidden; box-shadow: 15px -15px 30px rgba(0,0,0,0.1);
                }
                .login-page-container-custom .box-login-title {
                    width: 50%; height: 40px; position: absolute; z-index: 2; display: flex; align-items: center; padding-left: 15px; gap: 8px;
                }
                .login-page-container-custom .box-login {
                    position: relative; top: -4px; width: 320px; background: #ffffff;
                    border: 1px solid rgba(37,99,235,0.25); text-align: center; overflow: hidden; z-index: 2;
                    border-top-right-radius: 6px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;
                    box-shadow: 15px 30px 30px rgba(0,0,0,0.1), 0 0 15px rgba(37,99,235,0.05);
                }
                .login-page-container-custom .box-info {
                    width: 260px; top: 60px; position: absolute; right: -5px; opacity: 0; pointer-events: none;
                    padding: 15px 15px 15px 30px; background-color: rgba(255,255,255,0.9); backdrop-filter: blur(12px);
                    border: 1px solid rgba(37,99,235,0.2); z-index: 0; border-radius: 6px; box-shadow: 15px 30px 30px rgba(0,0,0,0.1); transition: all 0.3s;
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
                .login-page-container-custom .line-wh { width: 100%; height: 1px; top: 0px; margin: 12px auto; position: relative; border-top: 1px solid rgba(0,0,0,0.1); }
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
                .login-page-container-custom .b-support { border: #2563eb 1px solid; background-color: transparent; color: #2563eb; margin: 6px 0; }
                .login-page-container-custom .b-cta { border: #2563eb 1px solid; background-color: #2563eb; color: #ffffff; }
                .login-page-container-custom .b-support:hover, .login-page-container-custom .b-cta:hover { color: #ffffff; background-color: #1d4ed8; border: #1d4ed8 1px solid; }
                .login-page-container-custom .fieldset-body { display: table; width: 100%; }
                .login-page-container-custom .fieldset-body p { width: 100%; display: inline-table; padding: 5px 20px; margin-bottom:2px; position: relative; }
                .login-page-container-custom label { float: left; width: 100%; top: 0px; color: #64748b; font-size: 13px; font-weight: 700; text-align: left; line-height: 1.5; }
                .login-page-container-custom label.checkbox { float: left; padding: 5px 20px; line-height: 1.7; display: flex; align-items: center; gap: 6px; cursor: pointer; color: #334155; }
                .login-page-container-custom label.checkbox input { margin: 0; width: auto; height: auto; cursor: pointer; }
                .login-page-container-custom input[type=text], .login-page-container-custom input[type=password] {
                    width: 100%; height: 32px; padding: 0px 10px; background-color: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.15);
                    display: inline; color: #0f172a; font-size: 16px; font-weight: 400; float: left; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.05);
                }
                .login-page-container-custom input[type=text]:focus, .login-page-container-custom input[type=password]:focus { background-color: #ffffff; border-color: #2563eb; outline: none; }
                .login-page-container-custom input[type=submit] {
                    width: 100%; height: 48px; margin-top: 24px; padding: 0px 20px; font-family: 'Quicksand', sans-serif; font-weight: 700;
                    font-size: 18px; color: #ffffff; line-height: 40px; text-align: center; background-color: #2563eb; border: 1px #2563eb solid;
                    opacity: 1; cursor: pointer; transition: all 0.3s;
                }
                .login-page-container-custom input[type=submit]:hover { background-color: #1d4ed8; border: 1px #1d4ed8 solid; }
                .login-page-container-custom input[type=submit]:focus { outline: none; }
                .login-page-container-custom p.field span.i { width: 24px; height: 24px; float: right; position: absolute; right: 22px; bottom: 9px; z-index: 2; display: block; animation: bounceIn 0.6s linear; }
                .login-page-container-custom .box-form, .login-page-container-custom .box-info, .login-page-container-custom .b, .login-page-container-custom .b-support, .login-page-container-custom .b-cta, .login-page-container-custom input[type=submit], .login-page-container-custom p.field span.i { transition: all 0.3s; }
                .login-page-container-custom .icon-credits { width: 100%; position: absolute; bottom: 4px; font-family:'Open Sans', 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; color: rgba(0,0,0,0.4); text-align: center; z-index: -1; }
                .login-page-container-custom .icon-credits a { text-decoration: none; color: rgba(0,0,0,0.6); }
                @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }
            ` }} />
            <AdminToast toasts={adminToasts} />
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
                        <h2>ADMIN LOGIN</h2>
                    </div>
                    <div className='box-login'>
                        <form onSubmit={handleLogin} className='fieldset-body'>
                            <button type="button" onClick={() => setIsInfoOpen(true)} className='b b-form i i-more' title='More Info' style={{ opacity: isInfoOpen ? 0.01 : 1 }}></button>
                            <p className='field'>
                                <label htmlFor='admin-user'>ADMIN EMAIL</label>
                                <input type='text' id='admin-user' name='admin-user' autoComplete="off" placeholder="email" value={email} onChange={e => {setEmail(e.target.value); setUserError(null);}} disabled={isProcessing} />
                                {userError && <span className={`i i-${userError}`}></span>}
                            </p>
                            <p className='field'>
                                <label htmlFor='admin-pass'>PASSWORD</label>
                                <input type='password' id='admin-pass' name='admin-pass' autoComplete="new-password" placeholder="password" value={password} onChange={e => {setPassword(e.target.value); setPassError(null);}} disabled={isProcessing} />
                                {passError && <span className={`i i-${passError}`}></span>}
                            </p>
                            <input type='submit' value={isProcessing ? 'PROCESSING...' : 'SECURE LOGIN'} disabled={isProcessing} />
                        </form>
                    </div>
                </div>
                
                <div className='box-info'>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 20px', marginBottom: '10px' }}>
                        <button type="button" onClick={() => setIsInfoOpen(false)} className='b b-info i i-left' title='Back'></button>
                        <h3 className="!text-slate-800">Need Help?</h3>
                    </div>
                    <div className='line-wh'></div>
                    <button type="button" onClick={() => alert('Support can be reached at: support@vishwaleader.com')} className='b-support'>Contact Support</button>
                    <button type="button" onClick={() => window.location.href = '/auth/member'} className='b-support'>Login as Member</button>
                </div>
            </div>
            <div className='icon-credits'>by opendev-labs</div>
        </div>
      </>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Preloader loading={false} />
      <AdminToast toasts={adminToasts} />
      <div className="animate-fade-in-slow w-full flex min-h-screen">
        <SidebarProvider>
          {/* ── Sidebar ── */}
          <Sidebar variant="inset" collapsible="icon" className="border-r border-border sticky top-0 h-screen">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" render={<div />}>
                    <img src="/assets/images/vishwaleader-logo-hd.png" alt="VL" className="size-10 group-data-[collapsible=icon]:size-8 object-contain shrink-0" />
                    <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                      <span className="font-bold text-sm text-slate-800">VishwaLeader Admin</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Live · {totalUsers} members
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { label: "Dashboard", icon: <LayoutDashboard /> },
                      { label: "CRM", icon: <ChartBar /> },
                      { label: "Analytics", icon: <Gauge /> },
                      { label: "Users", icon: <Users /> },
                      { label: "Broadcast", icon: <Mail /> },
                      { label: "Announcements", icon: <Megaphone /> },
                      { label: "Advertisements", icon: <TrendingUp /> },
                    ].map(item => (
                      <SidebarMenuItem key={item.label}>
                        <MobileCloseSidebarMenuButton isActive={activeTab === item.label} onClick={() => setActiveTab(item.label)}>
                          {item.icon}
                          <span>{item.label === "CRM" ? "CRM & Inquiries" : item.label === "Users" ? "User Management" : item.label === "Analytics" ? "Firebase Analytics" : item.label === "Broadcast" ? "Email Broadcast" : item.label === "Announcements" ? "Announcement Banner" : item.label === "Advertisements" ? "Ads Manager" : "Default Dashboard"}</span>
                          {item.label === "Users" && totalUsers > 0 && (
                            <span className="ml-auto text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{totalUsers}</span>
                          )}
                          {item.label === "CRM" && totalInquiries > 0 && (
                            <span className="ml-auto text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{totalInquiries}</span>
                          )}
                        </MobileCloseSidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
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
                  <MobileCloseSidebarMenuButton onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut />
                    <span>Log out</span>
                  </MobileCloseSidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>

          {/* ── Main Content ── */}
          <SidebarInset className="min-h-0 bg-slate-50 h-screen overflow-y-auto">
            {/* Header */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeTab}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                {/* LIVE badge */}
                <span className="ml-1 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              {/* Sync status */}
              <div className="flex items-center gap-3">
                {lastSync && (
                  <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    Synced {lastSync}
                  </span>
                )}
                <Button
                  variant="ghost" size="sm"
                  onClick={() => fetchData()}
                  disabled={dataLoading}
                  className="text-xs h-8 gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-[180px] lg:w-[260px] pl-8 h-8 text-sm"
                  />
                </div>
              </div>
            </header>

            <main className="flex-1 space-y-6 p-6">
              {/* Page title + actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{activeTab}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {dataLoading ? "Fetching latest data..." : `Last updated at ${lastSync || "—"}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === "Users" && (
                    <>
                      <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-1.5 text-xs">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
                      </Button>
                      <Button onClick={handleExportGoogleSheets} disabled={exportingSheets} size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Database className="w-4 h-4" /> {exportingSheets ? "Syncing..." : "Google Sheets"}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* ── Dashboard Tab ── */}
              {activeTab === "Dashboard" && (
                <>
                  {/* Stats */}
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      title="Total Members"
                      value={totalUsers}
                      sub={paidUsers > 0 ? `${paidUsers} paid · ${totalUsers - paidUsers} pending` : "Registered delegates"}
                      icon={<Users className="h-4 w-4 text-blue-600" />}
                      color="bg-blue-50"
                    />
                    <StatCard
                      title="Online Now"
                      value={onlineUsers}
                      sub="Active in last 10 min"
                      icon={<Wifi className="h-4 w-4 text-emerald-600" />}
                      color="bg-emerald-50"
                    />
                    <StatCard
                      title="Total Inquiries"
                      value={totalInquiries}
                      sub="Form submissions"
                      icon={<MessageCircle className="h-4 w-4 text-amber-600" />}
                      color="bg-amber-50"
                    />
                    <StatCard
                      title="Paid Members"
                      value={paidUsers}
                      sub={totalUsers > 0 ? `${Math.round((paidUsers / totalUsers) * 100)}% conversion rate` : "No members yet"}
                      icon={<CheckCircle2 className="h-4 w-4 text-violet-600" />}
                      color="bg-violet-50"
                    />
                  </div>

                  {/* Chart + Activity */}
                  <div className="grid gap-4 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                      <CardHeader>
                        <CardTitle className="text-base">Member Registration Trend</CardTitle>
                        <CardDescription>Real data from Firestore</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={{ members: { label: "Members", color: "hsl(220 90% 56%)" }, inquiries: { label: "Inquiries", color: "hsl(35 92% 50%)" } }} className="min-h-[200px] w-full">
                          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 4 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <defs>
                              <linearGradient id="gMembers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(220 90% 56%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(220 90% 56%)" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gInquiries" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(35 92% 50%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(35 92% 50%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area dataKey="members" type="natural" fill="url(#gMembers)" stroke="hsl(220 90% 56%)" strokeWidth={3} />
                            <Area dataKey="inquiries" type="natural" fill="url(#gInquiries)" stroke="hsl(35 92% 50%)" strokeWidth={3} />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="lg:col-span-3">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          Live Activity Feed
                          <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Polling
                          </span>
                        </CardTitle>
                        <CardDescription>Member events · auto-refresh every 8s</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                          {activityFeed.length === 0 ? (
                            <div className="text-center py-8">
                              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-xs text-slate-400">No activity yet — will update when members log in or update their profiles</p>
                            </div>
                          ) : activityFeed.map((event: any, i) => {
                            const icons: Record<string, string> = { user_joined: '🎉', profile_updated: '✏️', payment_made: '💳', file_uploaded: '📎' };
                            const ts = event.timestamp ? new Date(event.timestamp) : new Date();
                            const timeStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                            return (
                              <div key={event.id || i} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                <span className="text-sm mt-0.5 flex-shrink-0">{icons[event.type] || '⚡'}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-slate-800 truncate">{event.userName || 'Member'}</p>
                                  <p className="text-[10px] text-slate-500 capitalize">{(event.type || '').replace(/_/g, ' ')}</p>
                                </div>
                                <span className="text-[9px] text-slate-400 font-mono flex-shrink-0">{timeStr}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Members */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Registrations</CardTitle>
                      <CardDescription>Latest {Math.min(users.length, 5)} members</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {users.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No members registered yet</p>
                      ) : (
                        <div className="space-y-3">
                          {[...users].reverse().slice(0, 5).map((u: any, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.photoURL || ""} />
                                <AvatarFallback className="text-xs">{u.name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{u.name || "Anonymous"}</p>
                                <p className="text-xs text-slate-500 truncate">{u.email} · {u.country}</p>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${u.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                {u.paymentStatus || 'Unpaid'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ── Announcements Tab ── */}
              {activeTab === "Announcements" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Announcement Banner</CardTitle>
                    <CardDescription>Manage the ticker banner displayed on the website homepage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-slate-800">Enable Announcement Banner</label>
                      <input 
                        type="checkbox" 
                        checked={announcementEnabled} 
                        onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">Banner Message</label>
                      <textarea
                        value={announcementMessage}
                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                        placeholder="e.g. Breaking News: The 2026 Summit is now open for registration..."
                        className="w-full min-h-[100px] p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <Button onClick={handleSaveAnnouncement} disabled={savingAnnouncement} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {savingAnnouncement ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* ── CRM Tab ── */}
              {activeTab === "CRM" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Inquiries & CRM</CardTitle>
                    <CardDescription>{totalInquiries} total queries from website contact form</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {inquiries.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No inquiries yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {inquiries.map((inq: any, i) => (
                          <div key={i} className="border rounded-xl p-4 space-y-2 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-slate-800">{inq.name || "Anonymous"}</p>
                                <p className="text-xs text-slate-500">{inq.email}{inq.phone ? ` · ${inq.phone}` : ''}</p>
                              </div>
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{inq.category || "General"}</span>
                            </div>
                            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border">{inq.message || "No message"}</p>
                            {inq.createdAt && (
                              <p className="text-[10px] text-slate-400">{new Date(inq.createdAt).toLocaleString()}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── Analytics Tab ── */}
              {activeTab === "Analytics" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Registered Members" value={totalUsers} sub="From Firestore" icon={<UserCheck className="h-4 w-4 text-blue-600" />} color="bg-blue-50" />
                    <StatCard title="Online Now" value={onlineUsers} sub="Last 10 minutes" icon={<Wifi className="h-4 w-4 text-emerald-600" />} color="bg-emerald-50" />
                    <StatCard title="Paid Members" value={paidUsers} sub={totalUsers > 0 ? `${Math.round(paidUsers/totalUsers*100)}% of total` : "—"} icon={<TrendingUp className="h-4 w-4 text-violet-600" />} color="bg-violet-50" />
                    <StatCard title="Inquiries" value={totalInquiries} sub="Website contact form" icon={<MessageCircle className="h-4 w-4 text-amber-600" />} color="bg-amber-50" />
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Web Traffic (Last 30 Days)
                        {ga4Loading && <span className="text-sm font-normal text-slate-500 flex items-center gap-2"><RefreshCw className="h-3 w-3 animate-spin"/> Fetching GA4...</span>}
                      </CardTitle>
                      <CardDescription>Real web analytics pulled directly from Google Analytics 4 API</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ga4Data?.error ? (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5 space-y-2 text-red-800">
                          <p className="text-sm font-semibold">GA4 API Error</p>
                          <p className="text-xs">{ga4Data.error}</p>
                        </div>
                      ) : ga4Data?.data ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4 border-b pb-6">
                            <div>
                              <p className="text-sm font-medium text-slate-500">Page Views</p>
                              <p className="text-3xl font-bold text-slate-900">{ga4Data.totals.pageViews.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">Sessions</p>
                              <p className="text-3xl font-bold text-slate-900">{ga4Data.totals.sessions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">Active Users</p>
                              <p className="text-3xl font-bold text-slate-900">{ga4Data.totals.activeUsers.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <ChartContainer config={{ 
                            pageViews: { label: "Page Views", color: "hsl(220 90% 56%)" },
                            sessions: { label: "Sessions", color: "hsl(280 80% 60%)" }
                          }} className="min-h-[250px] w-full mt-4">
                            <AreaChart data={ga4Data.data} margin={{ left: 0, right: 0, top: 4 }}>
                              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <defs>
                                <linearGradient id="gGa4Views" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(220 90% 56%)" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(220 90% 56%)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gGa4Sessions" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(280 80% 60%)" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(280 80% 60%)" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Area dataKey="pageViews" type="natural" fill="url(#gGa4Views)" stroke="hsl(220 90% 56%)" strokeWidth={3} />
                              <Area dataKey="sessions" type="natural" fill="url(#gGa4Sessions)" stroke="hsl(280 80% 60%)" strokeWidth={3} />
                            </AreaChart>
                          </ChartContainer>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 flex items-center justify-center text-slate-400">
                          Waiting for analytics data...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Users Tab ── */}
              {activeTab === "Users" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className={editingUser ? "lg:col-span-7" : "lg:col-span-12"}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Member Directory</span>
                          <span className="text-sm font-normal text-slate-500">{filteredUsers.length} of {totalUsers}</span>
                        </CardTitle>
                        <CardDescription>
                          {onlineUsers > 0 && <span className="text-emerald-600 font-semibold">{onlineUsers} online now · </span>}
                          {paidUsers} paid · {totalUsers - paidUsers} pending payment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {dataLoading && users.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-3" />
                            <p className="text-sm text-slate-500">Loading members from database...</p>
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="text-center py-12">
                            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm text-slate-400">{searchQuery ? "No members match your search" : "No members registered yet"}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredUsers.map((u: any, i) => {
                              const isOnline = u.isOnline === true || (u.lastSeen && (Date.now() - new Date(u.lastSeen).getTime()) < 10 * 60 * 1000);
                              return (
                                <div key={u.id || i} className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:border-blue-200 hover:bg-blue-50/30 ${editingUser?.id === u.id ? 'border-blue-300 bg-blue-50' : 'border-slate-100'}`}>
                                  <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage src={u.photoURL || ""} />
                                        <AvatarFallback className="bg-slate-100 text-slate-700 font-bold">{u.name?.charAt(0) || 'U'}</AvatarFallback>
                                      </Avatar>
                                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} title={isOnline ? 'Online' : 'Offline'} />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-slate-800">{u.name || "Anonymous"}</p>
                                        {isOnline && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">Online</span>}
                                        {u.paymentStatus === 'Paid' && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">Paid</span>}
                                      </div>
                                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                      {u.organization && <p className="text-[10px] text-slate-400 truncate">{u.organization} · {u.country}</p>}
                                    </div>
                                  </div>
                                  <Button onClick={() => {
                                    const isClosing = editingUser?.id === u.id;
                                    setEditingUser(isClosing ? null : u);
                                    if (!isClosing) {
                                      const initData: Record<string, { approved: boolean, feedback: string, label: string }> = {};
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
                                    }
                                  }} variant={editingUser?.id === u.id ? "default" : "outline"} size="sm" className="text-xs flex-shrink-0 ml-2">
                                    {editingUser?.id === u.id ? "Close" : "Details"}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* User Detail Panel */}
                  {editingUser && (
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                      {/* Panel Header */}
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-white/20">
                              <AvatarImage src={editingUser.photoURL || ""} />
                              <AvatarFallback className="bg-white/10 text-white font-bold text-lg">{editingUser.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm">{editingUser.name || "Anonymous"}</p>
                              <p className="text-xs text-white/60">{editingUser.email}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8" onClick={() => setEditingUser(null)}>✕</Button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${editingUser.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>{editingUser.paymentStatus || 'Unpaid'}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">{editingUser.delegateType || 'conference'}</span>
                          {editingUser.country && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/10 text-white/70 border border-white/20">{editingUser.country}</span>}
                        </div>
                      </div>

                      {/* PDF Viewer */}
                      <div className="flex-1 relative min-h-[600px] w-full border-b">
                        <CustomPDFViewer doc={<ProfilePDF memberData={editingUser} guestProfiles={[]} />} />
                      </div>

                      {/* Verification Panel */}
                      <div className="p-4 bg-slate-50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Document Verification</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Verify uploads and trigger automatic re-upload requests</p>
                          </div>
                          <Button 
                            disabled={verifying}
                            onClick={async () => {
                              setVerifying(true);
                              showToast("Saving verification status...", "info");
                              const res = await verifyUserDocuments(editingUser.id, editingUser.email, editingUser.name, verificationData);
                              if (res.success) {
                                showToast("Verification saved successfully. Notifications sent if required.", "success");
                                // Update local users array so the UI reflects it
                                setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, verificationStatus: verificationData } : u));
                                setEditingUser({ ...editingUser, verificationStatus: verificationData });
                              } else {
                                showToast(`Failed: ${res.error}`, "error");
                              }
                              setVerifying(false);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          >
                            {verifying ? "Saving..." : "Save & Notify"}
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {Object.entries(verificationData).map(([key, data]) => (
                            <div key={key} className={`p-3 rounded-lg border ${data.approved ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">{data.label}</span>
                                <div className="flex items-center gap-2 bg-white rounded-md border p-0.5">
                                  <button
                                    onClick={() => setVerificationData(prev => ({ ...prev, [key]: { ...prev[key], approved: true } }))}
                                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors ${data.approved ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setVerificationData(prev => ({ ...prev, [key]: { ...prev[key], approved: false } }))}
                                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors ${!data.approved ? 'bg-rose-100 text-rose-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                              {!data.approved && (
                                <div className="mt-3">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Reason for Rejection / Feedback</label>
                                  <Input 
                                    value={data.feedback}
                                    onChange={(e) => setVerificationData(prev => ({ ...prev, [key]: { ...prev[key], feedback: e.target.value } }))}
                                    placeholder="e.g. Image is blurry, please re-upload."
                                    className="h-8 text-xs bg-white"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "Broadcast" && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <h2 className="text-2xl font-black font-display text-slate-900 uppercase tracking-tight">Email Broadcast</h2>
                    <p className="text-sm text-slate-500 mt-1">Send an automated email to your registered users via Resend.</p>
                  </div>
                  
                  <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                      <CardTitle className="text-lg">Compose Message</CardTitle>
                      <CardDescription>This email will be sent from info@vishwaleader.com</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const subject = formData.get('subject') as string;
                        const body = formData.get('body') as string;
                        const target = formData.get('target') as 'all' | 'paid';
                        
                        showToast(`Sending email to ${target} users...`, 'info');
                        const res = await sendBroadcastEmail(subject, body, target);
                        
                        if (res.success) {
                          showToast(`Successfully sent email to ${res.count} users!`, 'success');
                          (e.target as HTMLFormElement).reset();
                        } else {
                          showToast(`Failed to send emails: ${res.error}`, 'error');
                        }
                      }} className="space-y-6">
                        
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Target Audience</label>
                          <select name="target" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="all">All Registered Users</option>
                            <option value="paid">Only Paid Users (VIP / Delegates)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Subject Line</label>
                          <Input name="subject" placeholder="Welcome to Vishwa Leader 2026!" required />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Message Content (HTML Supported)</label>
                          <textarea 
                            name="body"
                            required
                            placeholder="<p>Hello Delegates,</p><p>We are excited to announce...</p>"
                            className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                          />
                          <p className="text-xs text-slate-400 mt-1">Tip: You can use HTML tags like &lt;b&gt;, &lt;p&gt;, &lt;a href="..."&gt; to format your email.</p>
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button type="submit" className="bg-brandBlue hover:bg-blue-900 text-white gap-2">
                            <Send className="w-4 h-4" />
                            Send Broadcast
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}


            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
}

