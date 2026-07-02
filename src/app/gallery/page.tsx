"use client";

import React, { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import { 
  X, ChevronLeft, ChevronRight, Maximize, Play, Pause 
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideshowActive, setSlideshowActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Slideshow timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (slideshowActive && lightboxIndex !== null) {
      interval = setInterval(() => {
        setLightboxIndex((prevIndex) => {
          if (prevIndex === null) return null;
          return (prevIndex + 1) % galleryItems.length;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, lightboxIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setSlideshowActive(false);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : null));
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  // Toggle fullscreen capability
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

  // Generate sliding window of adjacent thumbnails for bottom navigation strip
  const getAdjacentThumbnails = () => {
    if (lightboxIndex === null) return [];
    const range = 6; // Display 6 items on left and right sides
    const list = [];
    for (let i = lightboxIndex - range; i <= lightboxIndex + range; i++) {
      if (i >= 0 && i < galleryItems.length) {
        list.push({ item: galleryItems[i], index: i });
      }
    }
    return list;
  };

  return (
    <>
      <Preloader loading={false} />
      <div className="min-h-screen bg-black text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-brandBlue selection:text-white">
        
        {/* Minimal nextjsconf-pics Style Header */}
        <header className="border-b border-slate-900 bg-black/60 backdrop-blur sticky top-0 z-40">
          <div className="max-w-[1960px] mx-auto px-6 h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/assets/images/vishwaleader-logo-globe.png" alt="Vishwa Leader" className="h-8 w-auto object-contain" />
              <span className="text-white font-bold tracking-tight text-md uppercase font-display">VISHWA LEADER</span>
              <span className="hidden sm:inline-block text-[9px] font-black tracking-widest text-brandBlue uppercase border border-brandBlue/30 px-2 py-0.5 rounded bg-brandBlue/10">
                Media Library
              </span>
            </a>
            <a href="/" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-2">
              &larr; Back to Home
            </a>
          </div>
        </header>

        {/* Gallery Image Grid (aspect-video landscape, no portrait) */}
        <main className="flex-grow max-w-[1960px] w-full mx-auto px-6 py-10 space-y-6">
          <div className="flex flex-col gap-1 border-b border-slate-900 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-display">Media Catalog</h1>
            <p className="text-xs text-slate-500 font-medium">
              A responsive, high-performance visual catalog displaying all {galleryItems.length} archival items.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {galleryItems.map((item, idx) => (
              <div 
                key={item.src}
                onClick={() => {
                  setLightboxIndex(idx);
                  setSlideshowActive(false);
                }}
                className="group relative aspect-video bg-slate-950 overflow-hidden rounded-xl border border-slate-900/60 shadow hover:border-brandBlue/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                <img 
                  src={item.src} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay hover details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-0 group-hover:opacity-85 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-brandBlue mb-0.5">{item.category}</span>
                  <h4 className="text-white text-xs font-bold line-clamp-1">{item.title}</h4>
                  <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 font-light">{item.desc}</p>
                </div>

                <div className="absolute top-3 right-3 bg-black/60 border border-slate-800 text-[8px] font-mono text-slate-500 px-2 py-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.date.split('-')[0]}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Clean Minimalist Footer */}
        <footer className="border-t border-slate-900 py-6 text-center text-[10px] text-slate-600 bg-black mt-10">
          <p>© 2026 Vishwa Leader Techmedia Private Limited. All Rights Reserved.</p>
        </footer>
      </div>

      {/* Immersive Lightbox Modal (nextjsconf-pics Clone layout) */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <div id="lightbox" className="fixed inset-0 z-50 bg-black/98 flex flex-col justify-between items-center transition-all duration-300 py-6">
          
          {/* Top Panel: Counter and close button */}
          <div className="w-full max-w-[1960px] px-8 flex justify-between items-center shrink-0">
            <span className="text-[11px] font-mono text-slate-400">
              {lightboxIndex + 1} / {galleryItems.length}
            </span>
            <button 
              onClick={() => {
                setLightboxIndex(null);
                setSlideshowActive(false);
              }}
              className="text-slate-400 hover:text-white text-xl focus:outline-none bg-slate-900/60 p-2.5 rounded-full border border-slate-800 hover:bg-slate-900 transition-colors" 
              aria-label="Close Lightbox"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Middle Panel: Main active image with side arrows */}
          <div className="flex-grow w-full flex items-center justify-between px-4 md:px-10 max-h-[60vh] md:max-h-[65vh]">
            
            {/* Previous trigger */}
            <button 
              onClick={() => {
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null));
                setSlideshowActive(false);
              }}
              className="text-slate-400 hover:text-white p-3.5 rounded-full bg-slate-950/40 border border-slate-900 hover:bg-slate-900 transition-colors shrink-0 mr-4" 
              aria-label="Previous Image"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Main Landscape Fitted Widescreen Image */}
            <div className="flex flex-col items-center justify-center max-w-4xl max-h-full">
              <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-900 shadow-2xl bg-black">
                <img 
                  id="lightbox-img" 
                  src={galleryItems[lightboxIndex].src} 
                  alt={galleryItems[lightboxIndex].title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="mt-4 max-w-xl text-center px-4">
                <h4 className="font-bold text-white text-sm md:text-base leading-snug">{galleryItems[lightboxIndex].title}</h4>
                <p className="text-[11px] text-slate-400 font-light mt-1 leading-relaxed">{galleryItems[lightboxIndex].desc}</p>
                <div className="flex gap-1.5 justify-center mt-2.5">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-brandBlue border border-brandBlue/30 px-2 py-0.5 rounded bg-brandBlue/10">
                    {galleryItems[lightboxIndex].category}
                  </span>
                  {galleryItems[lightboxIndex].tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-mono text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Next trigger */}
            <button 
              onClick={() => {
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : null));
                setSlideshowActive(false);
              }}
              className="text-slate-400 hover:text-white p-3.5 rounded-full bg-slate-950/40 border border-slate-900 hover:bg-slate-900 transition-colors shrink-0 ml-4" 
              aria-label="Next Image"
            >
              <ChevronRight className="size-6" />
            </button>

          </div>

          {/* Bottom Panel: Signature nextjsconf-pics thumbnail navigation slider */}
          <div className="w-full max-w-4xl flex flex-col items-center gap-4 shrink-0 px-6">
            
            {/* Control buttons */}
            <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-5 py-2 rounded-full border border-slate-900 text-slate-400 select-none text-xs">
              <button 
                onClick={() => setSlideshowActive(!slideshowActive)}
                className={`hover:text-white transition-colors focus:outline-none flex items-center gap-1.5 ${slideshowActive ? 'text-amber-400 hover:text-amber-300' : ''}`} 
                title={slideshowActive ? "Pause Autoplay" : "Start Autoplay"}
              >
                {slideshowActive ? <Pause className="size-4" /> : <Play className="size-4" />}
                <span>Autoplay</span>
              </button>
              <span className="w-[1px] h-4 bg-slate-800"></span>
              <button 
                onClick={toggleFullscreen}
                className={`hover:text-white transition-colors focus:outline-none flex items-center gap-1.5 ${isFullscreen ? 'text-amber-400 hover:text-amber-300' : ''}`}
                title="Toggle Fullscreen"
              >
                <Maximize className="size-4" />
                <span>Fullscreen</span>
              </button>
            </div>

            {/* Bottom thumbnail navigator strip */}
            <div className="w-full overflow-x-auto py-2 scrollbar-none flex justify-center gap-2 select-none">
              {getAdjacentThumbnails().map(({ item, index }) => (
                <div 
                  key={`thumb-${item.src}-${index}`}
                  onClick={() => {
                    setLightboxIndex(index);
                    setSlideshowActive(false);
                  }}
                  className={`relative aspect-video w-16 md:w-20 rounded-lg overflow-hidden shrink-0 cursor-pointer border transition-all ${
                    index === lightboxIndex 
                      ? 'border-brandBlue scale-105 opacity-100 ring-2 ring-brandBlue/30' 
                      : 'border-slate-900 opacity-40 hover:opacity-80'
                  }`}
                >
                  <img src={item.src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

          </div>

        </div>
      )}
    </>
  );
}
