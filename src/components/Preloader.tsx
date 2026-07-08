"use client";

import { useEffect, useState } from "react";

interface PreloaderProps {
  loading?: boolean;
  onFadeComplete?: () => void;
  isComingSoon?: boolean;
}

export default function Preloader({ loading = true, onFadeComplete, isComingSoon = false }: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isComingSoon) {
      setFadingOut(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onFadeComplete) onFadeComplete();
      }, 600); // matches the 600ms CSS transition
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setFadingOut(false);
    }
  }, [loading, isComingSoon, onFadeComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-[100vw] h-[100vh] z-[10000] flex flex-col items-center justify-center bg-white transition-opacity duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="vl-logo-container">
        {/* Pure SVG Animated Wifi */}
        <svg className="vl-preloader-wifi" viewBox="0 -22 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="45" cy="42" r="5" fill="#D4AF37" />
          <path className="vl-arc vl-arc-1" d="M30 32 Q45 18 60 32" stroke="#D4AF37" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
          <path className="vl-arc vl-arc-2" d="M16 20 Q45 0 74 20" stroke="#D4AF37" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
          <path className="vl-arc vl-arc-3" d="M2 8 Q45 -18 88 8" stroke="#D4AF37" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        </svg>
        
        {/* Static Globe Base */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="vl-globe-img" src="/assets/images/vishwaleader-logo-globe.png" alt="Vishwa Leader" />
      </div>

      {/* Brand name */}
      <p translate="no" className="notranslate" style={{ marginTop: "18px", fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "15px", letterSpacing: "0.04em", color: "#0056CA" }}>
        VISHWA LEADER
      </p>
      
      {/* Subtitles */}
      <div className="flex flex-col items-center mt-[2px]">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#1e3a8a", textTransform: "uppercase" }}>
            TECHMEDIA
          </p>
          {isComingSoon && (
            <p className="animate-pulse" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#1e3a8a", textTransform: "uppercase", marginTop: "4px" }}>
              COMING SOON
            </p>
          )}
      </div>
    </div>
  );
}
