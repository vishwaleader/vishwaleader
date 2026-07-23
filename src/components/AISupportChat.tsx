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
        className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 hover:bg-brandBlue text-white shadow-2xl border border-slate-700/80 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer drop-shadow-xl"
        title="Contact SARA - 24/7 AI Customer Support"
        aria-label="Contact SARA - 24/7 AI Customer Support"
      >
        <div className="relative">
          <Headset className="w-5 h-5 md:w-6 md:h-6 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
        </div>
      </button>
    </div>
  );
}
