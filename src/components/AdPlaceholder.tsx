'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdPlaceholder() {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ad settings globally from public action
    const fetchAdStatus = async () => {
      try {
        const { getAdSettings } = await import('@/app/actions/adminAuth');
        const res = await getAdSettings();
        if (res.success && res.data) {
          setAdsEnabled(res.data.enabled);
        }
      } catch (e) {
        console.error("Failed to load ad settings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdStatus();
  }, []);

  if (loading || !adsEnabled) return null;

  return (
    <div className="w-full my-6 p-[2px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30">
      <div className="bg-white dark:bg-[#0d0f14] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Advertisement
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">
            Your Brand Here
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Reach thousands of influential leaders, professionals, and academics globally. Sponsor Vishwa Leader and showcase your brand to a premium audience.
          </p>
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          <Link 
            href="/pricing"
            className="block w-full md:w-auto text-center px-6 py-3 bg-brandBlue hover:bg-[#0a1e4b] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
          >
            Become a Sponsor
          </Link>
        </div>
      </div>
    </div>
  );
}
