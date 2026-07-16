"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingDonateButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Link 
        href="/patron" 
        className="group relative flex items-center justify-center w-14 h-14 bg-white hover:bg-rose-50 rounded-full shadow-lg shadow-black/10 border border-slate-200 transition-all hover:scale-110 active:scale-95"
        aria-label="Donate"
      >
        <Heart className="w-6 h-6 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Support Us
        </span>
      </Link>
    </div>
  );
}
