"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Preloader from "./Preloader";

export default function GlobalPreloader() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  
  // Use state to detect domain on client-side mount to avoid hydration errors
  const [isComingSoon, setIsComingSoon] = useState(false);

  useEffect(() => {
    if (pathname === '/coming-soon') {
      setIsComingSoon(true);
    }
  }, [pathname]);

  useEffect(() => {
    // If we are on the coming-soon page, never stop loading.
    if (isComingSoon) {
      setLoading(true);
      return;
    }

    const handleLoad = () => {
      // Small visual padding delay of 800ms to allow smooth hydration and visual settle
      setTimeout(() => setLoading(false), 800);
    };

    if (document.readyState === "complete") {
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener("load", handleLoad);
      // Fallback timeout in case the load event doesn't fire
      const timer = setTimeout(() => setLoading(false), 2500);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timer);
      };
    }
  }, [isComingSoon]);

  return <Preloader loading={loading} isComingSoon={isComingSoon} />;
}
