"use client";

import React, { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
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
  Search, LogOut, Play, Pause, Maximize, ChevronLeft, ChevronRight, X, 
  Image as ImageIcon, Sparkles, Flame, Clock, FolderOpen, Tag, Grid, LayoutDashboard 
} from "lucide-react";

import galleryDataRaw from "./gallery_data.json";

interface GalleryItem {
  src: string;
  title: string;
  desc: string;
  category: string;
  tags: string[];
  isPopular: boolean;
  isFeatured: boolean;
  date: string;
}

const galleryItems: GalleryItem[] = galleryDataRaw as GalleryItem[];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<'recent' | 'popular' | 'featured' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Lightbox Modal state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideshowActive, setSlideshowActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Categories list
  const categoriesList = ['all', 'London Summit', 'Dignitaries', 'Magazine Covers', 'Social Events', 'News Portal Demo'];
  
  // Hashtags list
  const hashtagsList = ['#LondonSummit', '#DrAmbedkar', '#HouseOfLords', '#MagazineCovers', '#Dignitaries', '#SocialDrives', '#PortalDemo'];

  // Filtering Logic
  const filteredItems = galleryItems
    .filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }
      // Tab conditions
      if (activeTab === 'popular' && !item.isPopular) return false;
      if (activeTab === 'featured' && !item.isFeatured) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Slideshow loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (slideshowActive && lightboxIndex !== null && filteredItems.length > 0) {
      interval = setInterval(() => {
        setLightboxIndex((prevIndex) => {
          if (prevIndex === null) return null;
          return (prevIndex + 1) % filteredItems.length;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, lightboxIndex, filteredItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setSlideshowActive(false);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  return (
    <>
      <Preloader loading={false} />
      <div className="animate-fade-in-slow w-full flex min-h-screen bg-slate-950 text-slate-100">
        <SidebarProvider>
          <Sidebar variant="inset" collapsible="icon" className="border-r border-slate-900 bg-slate-950">
            <SidebarHeader className="border-b border-slate-900 px-4 py-3">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" render={<div />} className="hover:bg-slate-900/50">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                      <img src="/assets/images/vishwaleader-logo-globe.png" alt="VishwaLeader" className="w-full h-full object-contain p-0.5" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-bold text-sm tracking-tight text-white">VishwaLeader Media</span>
                      <span className="text-[10px] text-slate-500 font-mono tracking-wider">LIBRARY REGISTRY</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              {/* Category selector in sidebar */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-3 mb-1">Collections</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {categoriesList.map((cat) => (
                      <SidebarMenuItem key={cat}>
                        <SidebarMenuButton 
                          isActive={selectedCategory === cat} 
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedTag(null);
                          }}
                          className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg capitalize transition-all ${
                            selectedCategory === cat 
                              ? 'bg-brandBlue text-white shadow-lg shadow-brandBlue/15 font-semibold' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                          }`}
                        >
                          <FolderOpen className="size-4 shrink-0 mr-2" />
                          <span>{cat === 'all' ? 'All Collections' : cat}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Sorting filters */}
              <SidebarGroup className="mt-2">
                <SidebarGroupLabel className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-3 mb-1">Archival Filters</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === 'all'} 
                        onClick={() => setActiveTab('all')}
                        className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                          activeTab === 'all' 
                            ? 'bg-slate-900 text-white font-semibold border-l-2 border-brandBlue' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <Grid className="size-4 shrink-0 mr-2" />
                        <span>All Library Archives</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === 'recent'} 
                        onClick={() => setActiveTab('recent')}
                        className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                          activeTab === 'recent' 
                            ? 'bg-slate-900 text-white font-semibold border-l-2 border-brandBlue' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <Clock className="size-4 shrink-0 mr-2" />
                        <span>Recent Additions</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === 'popular'} 
                        onClick={() => setActiveTab('popular')}
                        className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                          activeTab === 'popular' 
                            ? 'bg-slate-900 text-white font-semibold border-l-2 border-brandBlue' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <Flame className="size-4 shrink-0 mr-2 text-amber-500" />
                        <span>Popular Highlights</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={activeTab === 'featured'} 
                        onClick={() => setActiveTab('featured')}
                        className={`w-full justify-start text-xs font-medium py-2 px-3 rounded-lg transition-all ${
                          activeTab === 'featured' 
                            ? 'bg-slate-900 text-white font-semibold border-l-2 border-brandBlue' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <Sparkles className="size-4 shrink-0 mr-2 text-yellow-500" />
                        <span>Featured Dignitaries</span>
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
                    className="w-full justify-start text-xs font-medium py-2.5 px-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                  >
                    <LogOut className="size-4 rotate-180 shrink-0 mr-2" />
                    <span>Return to Website</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>

          <SidebarInset className="bg-slate-950">
            {/* Top Header Panel */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-900 px-6 gap-4 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-slate-400 hover:text-white" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#" className="text-slate-500 hover:text-slate-300">Library</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block text-slate-700" />
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#" className="text-slate-400 hover:text-slate-200 capitalize">
                        {selectedCategory === 'all' ? 'All Collections' : selectedCategory}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block text-slate-700" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-white capitalize font-semibold">
                        {activeTab === 'all' && 'All Registry'}
                        {activeTab === 'recent' && 'Recent'}
                        {activeTab === 'popular' && 'Popular'}
                        {activeTab === 'featured' && 'Featured'}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Header Search bar */}
              <div className="relative w-44 sm:w-60 md:w-80 shrink-0">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                  type="search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog titles & descriptions..." 
                  className="w-full bg-slate-900 border-slate-800 text-xs rounded-full pl-9 pr-4 py-2 outline-none text-slate-200 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue placeholder:text-slate-500 transition-colors" 
                />
              </div>
            </header>

            {/* Quick Hashtags Strip */}
            <div className="border-b border-slate-900 bg-slate-950/40 py-3 overflow-x-auto select-none">
              <div className="px-8 flex items-center gap-2 text-xs font-semibold whitespace-nowrap scrollbar-none">
                <span className="text-slate-600 uppercase tracking-widest text-[9px] mr-2">Quick Tags:</span>
                {hashtagsList.map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag ? null : tag);
                      setSelectedCategory('all');
                    }}
                    className={`px-3 py-1 text-xs border rounded-full transition-all ${
                      selectedTag === tag 
                        ? 'bg-brandBlue border-brandBlue text-white shadow-md shadow-brandBlue/10 font-bold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {(selectedTag || selectedCategory !== 'all' || searchQuery || activeTab !== 'all') && (
                  <button 
                    onClick={() => {
                      setSelectedTag(null);
                      setSelectedCategory('all');
                      setActiveTab('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1 bg-slate-900/60 border border-slate-800 text-amber-500 hover:text-amber-400 rounded-full transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Workspace */}
            <main className="flex-grow p-8 space-y-6">
              
              {/* Header Title segment */}
              <div className="flex flex-col gap-1 border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-brandBlue rounded-full shadow-[0_0_8px_rgba(0,86,202,0.8)]"></span>
                  <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
                    {selectedCategory === 'all' ? 'All Collections' : selectedCategory}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-medium pl-4">
                  Showing {filteredItems.length} matching files from the official vishwaleader.com image library.
                </p>
              </div>

              {/* Wallpaper Card Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item, idx) => (
                    <Card 
                      key={item.src}
                      onClick={() => {
                        setLightboxIndex(idx);
                        setSlideshowActive(false);
                      }}
                      className="group border border-slate-900 bg-slate-900/40 rounded-2xl overflow-hidden hover:border-brandBlue/35 hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      {/* Image container: Set aspect ratio to aspect-video (Landscape orientatation) */}
                      <div className="relative aspect-video bg-slate-950 overflow-hidden shrink-0">
                        <img 
                          src={item.src} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-40 group-hover:opacity-75 transition-opacity"></div>
                        
                        {/* Category label overlay */}
                        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 text-[8px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1 rounded-full">
                          {item.category}
                        </span>

                        {/* Search overlay indicator */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="w-10 h-10 rounded-full bg-brandBlue shadow-lg flex items-center justify-center text-white text-xs">
                            <Maximize className="size-4" />
                          </span>
                        </div>
                      </div>

                      {/* Header details block */}
                      <CardHeader className="p-4 space-y-1">
                        <CardTitle className="text-white text-sm font-bold line-clamp-1 group-hover:text-brandBlue transition-colors">{item.title}</CardTitle>
                        <CardDescription className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-light">{item.desc}</CardDescription>
                      </CardHeader>

                      {/* Footer tags block */}
                      <CardContent className="px-4 pb-4 pt-0 flex flex-col justify-end">
                        <div className="flex flex-wrap gap-1 border-t border-slate-900/60 pt-3.5 items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[8px] font-mono bg-slate-950 text-slate-400 border border-slate-800 font-normal px-2 py-0.5 rounded-full">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-[8px] font-mono text-slate-600 shrink-0 font-medium">{item.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div id="empty-state" className="text-center py-24 space-y-4 border border-dashed border-slate-900 rounded-2xl bg-slate-900/10">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto text-lg">
                    <X className="size-5" />
                  </div>
                  <h3 className="font-display font-black text-slate-400 text-sm uppercase">No Records Found</h3>
                  <p className="text-xs text-slate-555 max-w-sm mx-auto leading-relaxed px-4">
                    Adjust your category selectors in the sidebar, reset quick tags, or clear search queries to view other segments.
                  </p>
                </div>
              )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-[10px] text-slate-650 font-normal">
              <p>© 2026 Vishwa Leader Techmedia Private Limited. All Rights Reserved. Compiled under RNI & MCA guidelines.</p>
            </footer>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div id="lightbox" className="fixed inset-0 z-50 bg-black/98 flex flex-col justify-center items-center transition-all duration-300">
          
          {/* Close button */}
          <button 
            onClick={() => {
              setLightboxIndex(null);
              setSlideshowActive(false);
            }}
            className="absolute top-6 right-6 text-slate-400 hover:text-white text-2xl focus:outline-none bg-slate-900/50 p-2 rounded-full border border-slate-800 hover:bg-slate-900 transition-colors" 
            aria-label="Close Lightbox"
          >
            <X className="size-5" />
          </button>
          
          {/* Back Navigation */}
          <button 
            onClick={() => {
              setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null));
              setSlideshowActive(false);
            }}
            className="absolute left-6 hidden md:block text-slate-400 hover:text-white text-4xl focus:outline-none bg-slate-900/40 p-3 rounded-full hover:bg-slate-900 transition-colors" 
            aria-label="Previous Image"
          >
            <ChevronLeft className="size-8" />
          </button>

          {/* Next Navigation */}
          <button 
            onClick={() => {
              setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));
              setSlideshowActive(false);
            }}
            className="absolute right-6 hidden md:block text-slate-400 hover:text-white text-4xl focus:outline-none bg-slate-900/40 p-3 rounded-full hover:bg-slate-900 transition-colors" 
            aria-label="Next Image"
          >
            <ChevronRight className="size-8" />
          </button>
          
          <div className="max-w-4xl max-h-[85vh] px-4 flex flex-col justify-center items-center text-center">
            {/* Expanded preview: Rendered landscape aspect-video */}
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-slate-950">
              <img 
                id="lightbox-img" 
                src={filteredItems[lightboxIndex].src} 
                alt={filteredItems[lightboxIndex].title} 
                className="w-full h-full object-cover" 
              />
            </div>
            <h4 id="lightbox-caption" className="text-slate-300 text-xs md:text-sm font-medium mt-6 tracking-wide max-w-2xl px-6 leading-relaxed">
              <span className="font-bold text-white block mb-1 text-sm md:text-base">{filteredItems[lightboxIndex].title}</span>
              {filteredItems[lightboxIndex].desc}
            </h4>
            <div className="flex gap-2 justify-center mt-2.5">
              {filteredItems[lightboxIndex].tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono text-brandBlue">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Controls overlay bottom */}
          <div className="absolute bottom-6 flex items-center gap-6 bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-850 text-slate-300 select-none">
            <button 
              onClick={() => {
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null));
                setSlideshowActive(false);
              }}
              className="hover:text-amber-400 transition-colors focus:outline-none text-xs" 
              title="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button 
              onClick={() => setSlideshowActive(!slideshowActive)}
              className={`hover:text-amber-400 transition-colors focus:outline-none text-xs ${slideshowActive ? 'text-amber-400' : ''}`} 
              title={slideshowActive ? "Pause Slideshow" : "Play Slideshow"}
            >
              {slideshowActive ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button 
              onClick={() => {
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));
                setSlideshowActive(false);
              }}
              className="hover:text-amber-400 transition-colors focus:outline-none text-xs" 
              title="Next"
            >
              <ChevronRight className="size-4" />
            </button>
            
            <span className="w-[1px] h-4 bg-slate-800"></span>
            
            <button 
              onClick={toggleFullscreen}
              className={`hover:text-amber-400 transition-colors focus:outline-none text-xs ${isFullscreen ? 'text-amber-400' : ''}`}
              title="Toggle Fullscreen"
            >
              <Maximize className="size-4" />
            </button>
            
            <span className="w-[1px] h-4 bg-slate-800"></span>
            
            <span id="lightbox-counter" className="text-[10px] font-mono text-slate-500">
              {lightboxIndex + 1} / {filteredItems.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
