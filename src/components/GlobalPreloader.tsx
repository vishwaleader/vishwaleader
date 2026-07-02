"use client";

import { useEffect, useState } from "react";
import Preloader from "./Preloader";

export default function GlobalPreloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return <Preloader loading={loading} />;
}
