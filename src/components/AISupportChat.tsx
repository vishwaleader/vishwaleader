"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Headset } from "lucide-react";

export default function AISupportChat() {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/auth/admin") || pathname?.startsWith("/checkout");

  if (isDashboard || pathname === "/support") return null;

  return (
    <div className="fixed bottom-4 md:bottom-8 left-4 z-[9999]">
      <button
        type="button"
        onClick={() => router.push("/support")}
        className="group relative flex items-center h-12 md:h-14 p-3 md:p-3.5 rounded-full bg-slate-900 hover:bg-brandBlue text-white shadow-2xl border border-slate-700/80 transition-all duration-500 ease-out cursor-pointer overflow-hidden max-w-[48px] md:max-w-[56px] hover:max-w-[160px] md:hover:max-w-[180px] drop-shadow-xl hover:shadow-brandBlue/30 active:scale-95"
        title="Contact SARA - 24/7 AI Customer Support"
        aria-label="Contact SARA - 24/7 AI Customer Support"
      >
        <div className="relative shrink-0 flex items-center justify-center">
          <Headset className="w-5 h-5 md:w-6 md:h-6 text-amber-300 group-hover:rotate-12 transition-transform shrink-0" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full transition-transform group-hover:scale-110"></span>
        </div>
        <span className="pl-2.5 pr-1.5 whitespace-nowrap font-bold text-xs md:text-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0 tracking-wide font-display">
          Sara AI
        </span>
      </button>
    </div>
  );
}
