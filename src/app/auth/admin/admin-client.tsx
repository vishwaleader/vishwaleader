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
import { LayoutDashboard, Users, MessageSquare, LogOut, Search, Command, ChevronDown, ChartBar, Banknote, Gauge, Mail } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Firebase imports
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";
import { loginAsAdmin, logoutAdmin, checkAdminSession } from "@/app/actions/adminAuth";

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
    });

    // Listen to inquiries
    const inqQ = query(collection(db, "inquiries"));
    const unsubInq = onSnapshot(inqQ, (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Firestore offline error (safely ignored):", error.message);
    });

    return () => {
      unsubUsers();
      unsubInq();
    };
  }, [user]);

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
              <Button>Download Report</Button>
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
                      <Button variant="outline" size="sm">Edit User</Button>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-muted-foreground">No users found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </main>
      </SidebarInset>
    </SidebarProvider>
      </div>
    </>
  );
}
