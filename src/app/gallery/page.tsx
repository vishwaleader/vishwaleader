"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500); // Quick animation simulation
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  if (loading) return <Preloader />;

  return (
    <>
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col justify-between">

        {/* Hero Section */}
        <div className="bg-brandBlue relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 mt-0 shrink-0">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
                    Media Catalog
                </h1>
                <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
                    A responsive, high-performance visual catalog displaying all {galleryItems.length} archival items.
                </p>
            </div>
        </div>

        {/* Gallery Image Grid */}
        <main className="flex-grow w-full pb-32 pt-16">
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
                  <div className="p-4 flex flex-col flex-grow items-center justify-center">
                    <span className="text-[14px] font-medium text-slate-800">{item.category}</span>
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

      {/* Simple Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && galleryItems[lightboxIndex] && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black flex items-center justify-center">
          <button 
            onClick={() => {
              setLightboxIndex(null);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl focus:outline-none p-2 bg-black/30 rounded-full" 
            aria-label="Close"
          >
            <X className="size-8" />
          </button>
          <img 
            src={galleryItems[lightboxIndex].src} 
            alt="Fullscreen" 
            className="max-w-full max-h-full object-contain" 
          />
        </div>,
        document.body
      )}
    </>
  );
}
