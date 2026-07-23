"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import SaraAvatar from "./SaraAvatar";

export default function AISupportChat() {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/auth/admin") || pathname?.startsWith("/checkout");

  if (isDashboard || pathname === "/support") return null;

  return (
    <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[9999]">
      <button
        type="button"
        onClick={() => router.push("/support")}
        className="group relative flex items-center gap-2.5 px-3 py-2 md:px-3.5 md:py-2.5 rounded-full bg-slate-900/95 hover:bg-brandBlue text-white shadow-2xl border border-slate-700/80 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer drop-shadow-xl backdrop-blur-md"
        title="Chat with SARA - Support Concierge"
        aria-label="Chat with SARA - Support Concierge"
      >
        <SaraAvatar size="sm" className="w-8 h-8 md:w-9 md:h-9" />
        <div className="flex flex-col items-start pr-1 text-left hidden sm:flex">
          <span className="font-semibold text-xs text-slate-100 group-hover:text-white leading-tight">SARA</span>
          <span className="text-[9px] text-emerald-400 font-medium leading-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            Online
          </span>
        </div>
      </button>
    </div>
  );
}
