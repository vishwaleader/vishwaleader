"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Preloader from "@/components/Preloader";
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
  LayoutDashboard, Users, LogOut, Search, ChevronDown, ChartBar,
  Gauge, FileSpreadsheet, Database, RefreshCw, CheckCircle2, Clock,
  TrendingUp, MessageCircle, UserCheck, Wifi
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import * as XLSX from "@e965/xlsx";

// Server Actions — run on server, bypass Firestore security rules entirely
import { loginAsAdmin, logoutAdmin, checkAdminSession, getAdminDashboardData } from "@/app/actions/adminAuth";
import { exportToGoogleSheets } from "@/app/actions/googleSheets";
import { getWebTrafficData } from "@/app/actions/analytics";

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

  // Editing
  const [editingUser, setEditingUser] = useState<any>(null);

  // Toasts
  const [adminToasts, setAdminToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);
  const toastCounter = useRef(0);
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
    const res = await loginAsAdmin(email, password);
    if (res.success) setUser({ email, displayName: "Admin" });
    else showToast(res.error || "Invalid credentials", 'error');
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

  const filteredUsers = searchQuery
    ? users.filter(u => `${u.name} ${u.email} ${u.organization} ${u.country}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

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
        <div className="animate-fade-in-slow fixed inset-0 z-[9999] overflow-hidden font-sans" style={{
          background: "url('/assets/images/EkJYDaGD-fond-decran-Bouddha-54.png') no-repeat center center",
          backgroundSize: "cover"
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            .cp-login { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 340px; background: rgba(255,255,255,0.88); backdrop-filter: blur(16px); padding: 32px 24px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.5); }
            .cp-logo { display: block; width: 120px; height: 120px; margin: 0 auto 12px; object-fit: contain; }
            .cp-h1 { color: #0f172a; text-align: center; padding-bottom: 20px; font-weight: 800; margin: 0; font-size: 20px; letter-spacing: 0.5px; }
            .cp-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
            .cp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
            .cp-btn { width: 100%; padding: 11px; background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; font-weight: 700; font-size: 14px; border: none; border-radius: 10px; cursor: pointer; margin-top: 8px; transition: transform 0.15s, box-shadow 0.15s; }
            .cp-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.35); }
            .cp-links { text-align: center; margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
            .cp-links a { font-size: 11px; font-weight: 600; color: #64748b; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
            .cp-links a:hover { color: #2563eb; }
          `}} />
          <AdminToast toasts={adminToasts} />
          <div className="cp-login">
            <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="cp-logo" />
            <h1 className="cp-h1">Admin Login</h1>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="cp-input" placeholder="Username" required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="cp-input" placeholder="Password" required />
              <button type="submit" className="cp-btn">Secure Team Login</button>
            </form>
            <div className="cp-links">
              <a href="/auth/member">Login as Member</a>
              <a href="/">← Back to Home</a>
            </div>
          </div>
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
                    ].map(item => (
                      <SidebarMenuItem key={item.label}>
                        <MobileCloseSidebarMenuButton isActive={activeTab === item.label} onClick={() => setActiveTab(item.label)}>
                          {item.icon}
                          <span>{item.label === "CRM" ? "CRM & Inquiries" : item.label === "Users" ? "User Management" : item.label === "Analytics" ? "Firebase Analytics" : "Default Dashboard"}</span>
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
                                  <Button onClick={() => setEditingUser(editingUser?.id === u.id ? null : u)} variant={editingUser?.id === u.id ? "default" : "outline"} size="sm" className="text-xs flex-shrink-0 ml-2">
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

                      {/* Profile Fields */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[11px]">
                        {[
                          ["UID", editingUser.id],
                          ["Full Name", editingUser.name],
                          ["Email", editingUser.email],
                          ["Phone", editingUser.phone],
                          ["Gender", editingUser.gender],
                          ["Age", editingUser.age],
                          ["Nationality", editingUser.nationality],
                          ["City", editingUser.city],
                          ["Country", editingUser.country],
                          ["Designation", editingUser.designation],
                          ["Organization", editingUser.organization],
                          ["Sector", editingUser.sector],
                          ["Delegate Type", editingUser.delegateType],
                          ["Nomination Category", editingUser.nominationCategory],
                          ["Package/Tour", editingUser.packageTour],
                          ["Visa Support", editingUser.visaSupport ? "Yes" : "No"],
                          ["Accommodation", editingUser.accommodationSupport ? "Yes" : "No"],
                          ["Payment Status", editingUser.paymentStatus],
                          ["Payment ID", editingUser.paymentId],
                          ["Passport No.", editingUser.passportNumber],
                          ["Registered At", editingUser.joinedAt ? new Date(editingUser.joinedAt).toLocaleDateString() : "—"],
                        ].filter(([, v]) => v).map(([label, value]) => (
                          <div key={label} className="flex items-start gap-2 border-b border-slate-50 pb-2 last:border-0">
                            <span className="text-slate-400 font-semibold w-32 flex-shrink-0">{label}</span>
                            <span className="text-slate-700 break-all font-medium">{value}</span>
                          </div>
                        ))}

                        {/* Documents */}
                        <div className="pt-2 space-y-3">
                          <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Documents</p>
                          {[
                            { label: "Headshot Photo", url: editingUser.headshotUrl },
                            { label: "Passport Scan", url: editingUser.passportScanUrl },
                            { label: "Evidence Doc", url: editingUser.evidenceUrl },
                          ].map(({ label, url }) => (
                            <div key={label} className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5 border">
                              <span className="text-slate-600 font-semibold">{label}</span>
                              {url ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold uppercase text-[9px]">
                                  View ↗
                                </a>
                              ) : (
                                <span className="text-amber-500 font-bold text-[9px] uppercase">Pending</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Google Sheet Embed */}
                      <div className="border-t">
                        <div className="bg-slate-50 px-3 py-1.5 flex items-center justify-between border-b">
                          <span className="text-[10px] font-bold text-slate-600">VishwaLeader_User_DB</span>
                          <a href="https://docs.google.com/spreadsheets/d/1pgCCDMM3UK6Shi4tmoa6k2rzmYhlhhNqly7YVB4T98Y/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-emerald-600 hover:underline uppercase">Open ↗</a>
                        </div>
                        <iframe
                          src="https://docs.google.com/spreadsheets/d/1pgCCDMM3UK6Shi4tmoa6k2rzmYhlhhNqly7YVB4T98Y/edit?rm=minimal"
                          className="w-full h-[280px] border-none"
                          allow="clipboard-write"
                          title="Google Sheet Database"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
}
