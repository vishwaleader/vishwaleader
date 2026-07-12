"use client";

import React, { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import { 
  X, ChevronLeft, ChevronRight, Maximize, Play, Pause 
} from "lucide-react";
import galleryDataRaw from "./gallery_data.json";
import { motion } from "framer-motion";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500); // Quick animation simulation
  }, []);

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

  if (loading) return <Preloader />;

  return (
    <>
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col justify-between">

        {/* Gallery Image Grid */}
        <main className="flex-grow w-full pb-32 pt-32 md:pt-40">
          {/* Header Section */}
          <section className="text-center px-6 mb-16">
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
              Media Catalog
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto">
              A responsive, high-performance visual catalog displaying all {galleryItems.length} archival items.
            </p>
          </section>

          <section className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryItems.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx % 10 * 0.05 }}
                  key={item.src}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setSlideshowActive(false);
                  }}
                  className="group flex flex-col bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden shrink-0">
                    <img 
                      src={item.src} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-slate-200 text-[10px] font-mono font-medium text-slate-600 px-2 py-0.5 rounded-md shadow-sm">
                      {item.date.split('-')[0]}
                    </div>
                  </div>
                  
                  {/* Clean Bottom Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brandBlue mb-1">{item.category}</span>
                    <h4 className="text-slate-900 text-sm font-semibold line-clamp-1 mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-500 bg-white">
          <p>© 2026 <span translate="no" className="notranslate">Vishwa Leader</span> Techmedia Private Limited. All Rights Reserved.</p>
        </footer>
      </div>

      {/* Immersive Lightbox Modal (Kept dark for optimal image viewing) */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
        <div id="lightbox" className="fixed inset-0 z-[100] bg-black/98 flex flex-col justify-between items-center transition-all duration-300 py-6">
          
          {/* Top Panel: Counter and close button */}
          <div className="w-full max-w-7xl px-6 md:px-8 flex justify-between items-center shrink-0">
            <span className="text-xs font-medium text-slate-400">
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
              <X className="size-5" />
            </button>
          </div>

          {/* Middle Panel: Main active image with side arrows */}
          <div className="flex-grow w-full flex items-center justify-center relative px-2 md:px-10 max-h-[65vh] md:max-h-[70vh]">
            
            {/* Previous trigger */}
            <button 
              onClick={() => {
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null));
                setSlideshowActive(false);
              }}
              className="absolute left-2 md:left-10 z-10 text-slate-400 hover:text-white p-3 rounded-full bg-slate-950/60 md:bg-slate-950/40 border border-slate-900 hover:bg-slate-900 transition-colors shrink-0" 
              aria-label="Previous Image"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Main Image Container */}
            <div className="flex flex-col items-center justify-center w-full max-w-5xl max-h-full px-12 min-h-0">
              <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-900 shadow-2xl bg-black shrink-0 flex items-center justify-center">
                <img 
                  id="lightbox-img" 
                  src={galleryItems[lightboxIndex].src} 
                  alt={galleryItems[lightboxIndex].title} 
                  className="absolute inset-0 w-full h-full object-contain" 
                />
              </div>
              
              <div className="mt-6 max-w-2xl text-center px-4 shrink-0">
                <h4 className="font-semibold text-white text-base md:text-lg">{galleryItems[lightboxIndex].title}</h4>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{galleryItems[lightboxIndex].desc}</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brandBlue border border-brandBlue/30 px-2 py-0.5 rounded-md bg-brandBlue/10">
                    {galleryItems[lightboxIndex].category}
                  </span>
                  {galleryItems[lightboxIndex].tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
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
              className="absolute right-2 md:right-10 z-10 text-slate-400 hover:text-white p-3 rounded-full bg-slate-950/60 md:bg-slate-950/40 border border-slate-900 hover:bg-slate-900 transition-colors shrink-0" 
              aria-label="Next Image"
            >
              <ChevronRight className="size-6" />
            </button>

          </div>

          {/* Bottom Panel: Thumbnails */}
          <div className="w-full max-w-5xl flex flex-col items-center gap-4 shrink-0 px-6 mt-4">
            
            {/* Control buttons */}
            <div className="flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-900 text-slate-400 select-none text-xs font-medium">
              <button 
                onClick={() => setSlideshowActive(!slideshowActive)}
                className={`hover:text-white transition-colors focus:outline-none flex items-center gap-2 ${slideshowActive ? 'text-amber-400 hover:text-amber-300' : ''}`} 
              >
                {slideshowActive ? <Pause className="size-4" /> : <Play className="size-4" />}
                <span>Autoplay</span>
              </button>
              <span className="w-[1px] h-4 bg-slate-800"></span>
              <button 
                onClick={toggleFullscreen}
                className={`hover:text-white transition-colors focus:outline-none flex items-center gap-2 ${isFullscreen ? 'text-amber-400 hover:text-amber-300' : ''}`}
              >
                <Maximize className="size-4" />
                <span>Fullscreen</span>
              </button>
            </div>

            {/* Bottom thumbnail navigator strip */}
            <div className="w-full overflow-x-auto py-2 scrollbar-none flex md:justify-center justify-start gap-2 select-none px-4">
              {getAdjacentThumbnails().map(({ item, index }) => (
                <div 
                  key={`thumb-${item.src}-${index}`}
                  onClick={() => {
                    setLightboxIndex(index);
                    setSlideshowActive(false);
                  }}
                  className={`relative aspect-video w-20 md:w-24 rounded-lg overflow-hidden shrink-0 cursor-pointer border transition-all ${
                    index === lightboxIndex 
                      ? 'border-brandBlue scale-[1.05] opacity-100 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                      : 'border-slate-800 opacity-50 hover:opacity-100 hover:border-slate-600'
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
