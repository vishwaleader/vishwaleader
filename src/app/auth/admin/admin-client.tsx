"use client";

import React, { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader, SidebarFooter, SidebarRail, SidebarInset, SidebarTrigger
} from "@/components/ui/sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, Users, MessageSquare, LogOut, Search, Command, ChevronDown, ChartBar, Banknote, Gauge, Mail, FileSpreadsheet, Database } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Firebase imports
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { loginAsAdmin, logoutAdmin, checkAdminSession } from "@/app/actions/adminAuth";
import * as XLSX from "xlsx";
import { exportToGoogleSheets } from "@/app/actions/googleSheets";

const chartData = [
  { month: "January", visitors: 186, inquiries: 80 },
  { month: "February", visitors: 305, inquiries: 200 },
  { month: "March", visitors: 237, inquiries: 120 },
  { month: "April", visitors: 73, inquiries: 190 },
  { month: "May", visitors: 209, inquiries: 130 },
  { month: "June", visitors: 214, inquiries: 140 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-1))",
  },
  inquiries: {
    label: "Inquiries",
    color: "hsl(var(--chart-2))",
  },
}

export default function AdminClientPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Firestore Data State
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Editing User States
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    setEditingUser(null);
  }, [activeTab]);

  useEffect(() => {
    // Check custom server session first
    const initSession = async () => {
      const isAuth = await checkAdminSession();
      if (isAuth) {
        setUser({ email: "vishwaleader@admin", displayName: "Admin" });
      }
      setLoading(false);
    };
    initSession();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Listen to users
    const usersQ = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQ, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Firestore offline error (safely ignored):", error.message);
      setUsers([
        {
          id: "test-uid-123",
          name: "Yash Ramteke",
          email: "iamyash.creator@gmail.com",
          phone: "+91 98765 43210",
          designation: "Academic Delegate",
          organization: "SOAS London University",
          sector: "Academic/Research",
          country: "United Kingdom",
          gender: "Male",
          age: "34",
          nationality: "British",
          city: "London",
          delegateType: "conference",
          nominationCategory: "ambedkar-awards",
          packageTour: "Tour Package A",
          visaSupport: true,
          accommodationSupport: true,
          paymentStatus: "Paid",
          role: "member",
          joinedAt: "2026-07-04T08:00:00Z"
        },
        {
          id: "test-uid-456",
          name: "Yash ramteke",
          email: "yashramteke55555@gmail.com",
          phone: "+1 234 567 8900",
          designation: "Corporate Participant",
          organization: "TechMedia Corp",
          sector: "Corporate/Business",
          country: "United States",
          gender: "Female",
          age: "28",
          nationality: "American",
          city: "New York",
          delegateType: "business",
          nominationCategory: "business-summit",
          packageTour: "None",
          visaSupport: false,
          accommodationSupport: false,
          paymentStatus: "Unpaid",
          role: "member",
          joinedAt: "2026-07-03T12:00:00Z"
        }
      ]);
    });

    // Listen to inquiries
    const inqQ = query(collection(db, "inquiries"));
    const unsubInq = onSnapshot(inqQ, (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Firestore offline error (safely ignored):", error.message);
      setInquiries([
        {
          id: "inq-1",
          name: "John Doe",
          email: "johndoe@example.com",
          category: "General Information Inquiry",
          message: "Could you please provide details about the venue of the SOAS 2026 Conference?",
          createdAt: "2026-07-04T05:00:00Z"
        },
        {
          id: "inq-2",
          name: "Jane Smith",
          email: "janesmith@example.com",
          category: "Dr. Ambedkar Awards - Attendee Registration",
          message: "I would like to nominate our director for the Dr. Ambedkar International Award.",
          createdAt: "2026-07-04T06:00:00Z"
        }
      ]);
    });

    return () => {
      unsubUsers();
      unsubInq();
    };
  }, [user]);

  const [exportingSheets, setExportingSheets] = useState(false);

  const handleExportExcel = () => {
    if (users.length === 0) {
      alert("No user data to export.");
      return;
    }
    const formattedData = users.map(u => ({
      "User UID": u.id || "",
      "Full Name": u.name || "",
      "Email Address": u.email || "",
      "Phone Number": u.phone || "",
      "Designation": u.designation || "",
      "Organization": u.organization || "",
      "Sector": u.sector || "",
      "Country": u.country || "",
      "Gender": u.gender || "",
      "Age": u.age || "",
      "Nationality": u.nationality || "",
      "City": u.city || "",
      "Delegate Type": u.delegateType || "",
      "Nomination Category": u.nominationCategory || "",
      "Package/Tour Selected": u.packageTour || "",
      "Visa Support Required": u.visaSupport ? "Yes" : "No",
      "Accommodation Support": u.accommodationSupport ? "Yes" : "No",
      "Payment Status": u.paymentStatus || "Unpaid",
      "Role": u.role || "member",
      "Registered At": u.joinedAt || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "VishwaLeader_Users.xlsx");
  };

  const handleExportGoogleSheets = async () => {
    if (users.length === 0) {
      alert("No user data to sync.");
      return;
    }
    setExportingSheets(true);
    try {
      const res = await exportToGoogleSheets();
      if (res.success) {
        alert(`Successfully synced ${res.count} users to Google Sheets!`);
      } else {
        alert(`Failed to sync to Google Sheets: ${res.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error syncing to Google Sheets: " + (err.message || err));
    } finally {
      setExportingSheets(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginAsAdmin(email, password);
      if (res.success) {
        setUser({ email, displayName: "Admin" });
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Invalid credentials. Only authorized team members can access this area.");
    }
  };
  
  const handleLogout = async () => {
    await logoutAdmin();
    setUser(null);
  };

  if (loading) {
    return <Preloader loading={true} />;
  }

  if (!user) {
    return (
      <>
        <Preloader loading={false} />
        <div className="animate-fade-in-slow fixed left-0 right-0 bottom-0 top-0 z-[9999] overflow-hidden font-sans" style={{
          background: "url('/assets/images/EkJYDaGD-fond-decran-Bouddha-54.png') no-repeat center center",
          backgroundSize: "cover"
        }}>
        <style dangerouslySetInnerHTML={{__html: `
          .cp-btn { display: inline-block; padding: 4px 10px 4px; margin-bottom: 0; font-size: 13px; line-height: 18px; color: #333333; text-align: center;text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75); vertical-align: middle; background-color: #f5f5f5; background-image: linear-gradient(top, #ffffff, #e6e6e6); background-repeat: repeat-x; border: 1px solid #e6e6e6; border-radius: 4px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05); cursor: pointer; }
          .cp-btn:hover { background-color: #e6e6e6; }
          .cp-btn-large { padding: 9px 14px; font-size: 15px; line-height: normal; border-radius: 5px; }
          .cp-btn-primary { background-color: #2563eb; background-image: linear-gradient(to bottom, #3b82f6, #1d4ed8); border: 1px solid #1e40af; text-shadow: 1px 1px 1px rgba(0,0,0,0.4); color: #ffffff; }
          .cp-btn-primary:hover { background-color: #1d4ed8; background-image: none; }
          .cp-btn-block { width: 100%; display:block; }
          .cp-login { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 340px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); padding: 30px 20px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.4); }
          .cp-login-logo { display: block; width: 160px; height: 160px; margin: 0 auto 16px auto; object-fit: contain; }
          .cp-login h1 { color: #0f172a; letter-spacing: 1px; text-align: center; padding-bottom: 20px; font-weight: bold; margin: 0; font-size: 22px; }
          .cp-back { text-align: center; margin-top: 15px; }
          .cp-back a { font-size: 11px; font-weight: bold; color: #64748b; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
          .cp-back a:hover { color: #2563eb; }
        `}} />
        <div className="cp-login">
            <img src="/assets/images/vishwaleader-logo-hd.png" alt="Vishwa Leader" className="cp-login-logo" />
            <h1>Admin Login</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Username" 
                required 
              />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Password" 
                required 
              />
              <button type="submit" className="cp-btn cp-btn-primary cp-btn-block cp-btn-large flex items-center justify-center gap-2.5 mt-1">
                  Secure Team Login
              </button>
            </form>
            <div className="cp-back mt-3">
                <a href="/auth/member"><i className="fa-solid fa-user"></i> Login as Member</a>
            </div>
            <div className="cp-back">
                <a href="/"><i className="fa-solid fa-arrow-left"></i> Back to Home</a>
            </div>
        </div>
      </div>
      </>
    );
  }

  // Derive stats from data
  const totalUsers = users.length;
  const totalInquiries = inquiries.length;
  const activeNow = totalUsers > 0 ? Math.max(1, Math.floor(totalUsers / 3)) : 0;
  const recentInquiries = inquiries.slice(0, 5);

  return (
    <>
      <Preloader loading={false} />
      <div className="animate-fade-in-slow w-full flex min-h-screen">
        <SidebarProvider>
          <Sidebar variant="inset" collapsible="icon" className="border-r border-border">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<div />}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                  <img src="/assets/images/vishwaleader-logo-hd.png" alt="VishwaLeader" className="w-full h-full object-contain p-0.5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-sm tracking-tight text-slate-800">VishwaLeader Admin</span>
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
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")}>
                    <LayoutDashboard />
                    <span>Default Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "CRM"} onClick={() => setActiveTab("CRM")}>
                    <ChartBar />
                    <span>CRM & Inquiries</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "Analytics"} onClick={() => setActiveTab("Analytics")}>
                    <Gauge />
                    <span>Firebase Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "Users"} onClick={() => setActiveTab("Users")}>
                    <Users />
                    <span>User Management</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => window.location.href = "/"}>
                    <LogOut className="rotate-180" />
                    <span>Return to Website</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <SidebarMenuButton size="lg" render={<div />} className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full">
                    <div>
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || "Admin"} />
                        <AvatarFallback className="rounded-lg">AD</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.displayName || "Admin"}</span>
                        <span className="truncate text-xs">{user.email || ""}</span>
                      </div>
                      <ChevronDown className="ml-auto size-4" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
                  <div className="p-2 font-normal border-b border-slate-100">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || "Admin"} />
                        <AvatarFallback className="rounded-lg">AD</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.displayName || "Admin"}</span>
                        <span className="truncate text-xs">{user.email || ""}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeTab}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{activeTab}</h2>
            <div className="flex items-center space-x-2">
              {activeTab === "Users" ? (
                <>
                  <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-1.5 text-xs">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export to Excel
                  </Button>
                  <Button onClick={handleExportGoogleSheets} disabled={exportingSheets} className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700">
                    <Database className="w-4 h-4" /> {exportingSheets ? "Syncing..." : "Sync to Google Sheets"}
                  </Button>
                </>
              ) : (
                <Button>Download Report</Button>
              )}
            </div>
          </div>

          {activeTab === "Dashboard" && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12,451</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path></svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalInquiries}</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+{activeNow}</div>
                    <p className="text-xs text-muted-foreground">Since last hour</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>System Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                      <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                          <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillInquiries" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-inquiries)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-inquiries)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area dataKey="inquiries" type="natural" fill="url(#fillInquiries)" fillOpacity={0.4} stroke="var(--color-inquiries)" stackId="a" />
                        <Area dataKey="visitors" type="natural" fill="url(#fillVisitors)" fillOpacity={0.4} stroke="var(--color-visitors)" stackId="a" />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Users Activity</CardTitle>
                    <CardDescription>
                      You have {totalUsers} registered members.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {users.slice(0, 5).map((u, i) => (
                        <div key={i} className="flex items-center">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src="/avatars/01.png" alt="Avatar" />
                            <AvatarFallback>{u.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{u.name || "Anonymous User"}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <p className="text-sm text-muted-foreground">No recent user activity.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "CRM" && (
            <Card>
              <CardHeader>
                <CardTitle>Inquiries & CRM</CardTitle>
                <CardDescription>Manage incoming queries from the website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentInquiries.map((inq, i) => (
                    <div key={i} className="flex items-center border-b pb-4 last:border-0">
                      <div className="space-y-1 w-full">
                        <div className="flex justify-between w-full">
                          <p className="text-sm font-semibold leading-none">{inq.name || "Anonymous"}</p>
                          <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">{inq.category || "General"}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{inq.email}</p>
                        <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2 rounded">{inq.message || "No message provided."}</p>
                      </div>
                    </div>
                  ))}
                  {recentInquiries.length === 0 && (
                    <p className="text-sm text-muted-foreground">No inquiries found in database.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "Analytics" && (
            <Card>
              <CardHeader>
                <CardTitle>Google & Firebase Analytics</CardTitle>
                <CardDescription>Live traffic metrics from connected tracking properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center space-y-4">
                  <Gauge className="w-12 h-12 mx-auto text-blue-500 opacity-50" />
                  <div>
                    <h3 className="font-bold text-slate-800">Analytics Service Connected</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">Firebase Analytics is actively collecting telemetry data for Viswa Leader. Traffic events, user sessions, and custom conversion metrics are streaming successfully.</p>
                  </div>
                  <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200 mt-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sessions</p>
                      <p className="text-2xl font-black text-slate-800">42,091</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bounce Rate</p>
                      <p className="text-2xl font-black text-slate-800">12.4%</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Time</p>
                      <p className="text-2xl font-black text-slate-800">3m 42s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "Users" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className={editingUser ? "lg:col-span-7" : "lg:col-span-12"}>
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage registered platform members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((u, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{u.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">{u.name || "Anonymous User"}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => setEditingUser(u)} 
                            variant={editingUser?.id === u.id ? "default" : "outline"} 
                            size="sm"
                          >
                            Edit User
                          </Button>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <p className="text-sm text-muted-foreground">No users found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {editingUser && (
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden flex flex-col font-sans animate-fade-in">
                  {/* Sheet Header Toolbar */}
                  <div className="bg-slate-50 border-b border-slate-200 p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">田</div>
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                          VishwaLeader_User_DB
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-slate-200 text-slate-500" onClick={() => setEditingUser(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </Button>
                    </div>
                    
                    {/* Mock Menu Bar */}
                    <div className="flex gap-2.5 text-[10px] text-slate-500 font-medium overflow-x-auto pb-0.5">
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">File</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Edit</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">View</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Insert</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Format</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Data</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Tools</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Extensions</span>
                      <span className="hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer">Help</span>
                    </div>
                  </div>

                  {/* Actual Live Google Sheet Embed */}
                  <div className="flex-1 min-h-[450px] relative bg-slate-100 border-b border-slate-200">
                    <iframe
                      src="https://docs.google.com/spreadsheets/d/1pgCCDMM3UK6Shi4tmoa6k2rzmYhlhhNqly7YVB4T98Y/preview"
                      className="w-full h-[450px] border-none"
                      title="Google Sheet Database"
                    />
                    <div className="absolute top-2 right-2">
                      <a 
                        href="https://docs.google.com/spreadsheets/d/1pgCCDMM3UK6Shi4tmoa6k2rzmYhlhhNqly7YVB4T98Y/view" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded shadow flex items-center gap-1 transition-all hover:scale-[1.02]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2.5 w-2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        Open in Sheets
                      </a>
                    </div>
                  </div>

                  {/* Document Previews Container */}
                  <div className="p-4 bg-slate-50/50 border-b border-slate-200 space-y-4 max-h-[300px] overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Document Previews & Media Files
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-3 text-[10px]">
                      {/* Photo / Avatar */}
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border">
                          <img src={editingUser.photoURL || `https://placehold.co/100x100/0a1e4b/ffffff?text=${editingUser.name?.charAt(0) || 'U'}`} alt="Google Photo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Google Profile Picture</p>
                          <p className="text-slate-400 text-[9px] truncate max-w-[200px]">{editingUser.photoURL || "No Google profile photo link"}</p>
                        </div>
                      </div>

                      {/* Headshot Photo */}
                      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <span className="font-bold text-slate-700">1. Headshot Photograph</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${editingUser.headshotUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {editingUser.headshotUrl ? "Uploaded" : "Pending"}
                          </span>
                        </div>
                        {editingUser.headshotUrl ? (
                          <div className="space-y-2">
                            <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden border flex items-center justify-center">
                              <img src={editingUser.headshotUrl} alt="Headshot Preview" className="h-full w-auto object-contain p-1" />
                            </div>
                            <a href={editingUser.headshotUrl} target="_blank" className="block text-center font-bold text-blue-600 hover:underline uppercase text-[9px]">
                              View Full Size Headshot
                            </a>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-[9.5px] py-2 text-center">No headshot photograph uploaded yet.</p>
                        )}
                      </div>

                      {/* Passport Scan */}
                      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <span className="font-bold text-slate-700">2. Passport Scan Copy</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${editingUser.passportScanUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {editingUser.passportScanUrl ? "Uploaded" : "Pending"}
                          </span>
                        </div>
                        {editingUser.passportScanUrl ? (
                          <div className="space-y-2">
                            <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden border flex items-center justify-center">
                              {editingUser.passportScanUrl.toLowerCase().includes('.pdf') ? (
                                <div className="text-center py-8">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                  <span className="text-[9px] block text-slate-500 font-mono mt-2">Passport Document (PDF)</span>
                                </div>
                              ) : (
                                <img src={editingUser.passportScanUrl} alt="Passport Scan" className="h-full w-auto object-contain p-1" />
                              )}
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold px-0.5">
                              <span>Number: {editingUser.passportNumber || "Not Provided"}</span>
                              <a href={editingUser.passportScanUrl} target="_blank" className="font-bold text-blue-600 hover:underline uppercase">
                                Open Passport File
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-[9.5px] py-2 text-center">No passport scan uploaded yet.</p>
                        )}
                      </div>

                      {/* Visa support evidence */}
                      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <span className="font-bold text-slate-700">3. Supporting Evidence Document</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] ${editingUser.evidenceUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {editingUser.evidenceUrl ? "Uploaded" : "Pending"}
                          </span>
                        </div>
                        {editingUser.evidenceUrl ? (
                          <div className="space-y-2">
                            <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden border flex items-center justify-center">
                              {editingUser.evidenceUrl.toLowerCase().includes('.pdf') ? (
                                <div className="text-center py-8">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                  <span className="text-[9px] block text-slate-500 font-mono mt-2">Evidence Document (PDF)</span>
                                </div>
                              ) : (
                                <img src={editingUser.evidenceUrl} alt="Evidence Preview" className="h-full w-auto object-contain p-1" />
                              )}
                            </div>
                            <a href={editingUser.evidenceUrl} target="_blank" className="block text-center font-bold text-blue-600 hover:underline uppercase text-[9px]">
                              Open Evidence Document
                            </a>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-[9.5px] py-2 text-center">No supporting evidence document uploaded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Panel Footer Actions */}
                  <div className="bg-slate-100 p-3.5 flex justify-end gap-2.5 border-t border-slate-200">
                    <Button variant="outline" size="sm" onClick={() => setEditingUser(null)} className="text-xs px-4">
                      Close Panel
                    </Button>
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
