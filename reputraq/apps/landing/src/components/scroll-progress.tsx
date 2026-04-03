"use client";

import { useState, useEffect } from "react";
import { brandConfig } from "@/lib/brand-config";

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let pending = false;

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      pending = false;
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
      <div 
        className="h-full will-change-[width]"
        style={{
          width: `${scrollProgress}%`,
          background: `linear-gradient(90deg, ${brandConfig.colorPalette.colors.vibrantSky.hex}, ${brandConfig.colorPalette.colors.oceanDepth.hex})`,
          boxShadow: `0 0 10px ${brandConfig.colorPalette.colors.vibrantSky.hex}50`
        }}
      />
    </div>
  );
}
