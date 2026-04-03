"use client";

import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle, Zap, Sparkles } from "lucide-react";
import { brandConfig } from "@/lib/brand-config";
import { appSignupUrl } from "@/lib/app-links";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let rafId = 0;
    let pending = false;

    const handleScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(() => {
        pending = false;
        const next = window.scrollY > 300;
        setIsVisible((prev) => (prev === next ? prev : next));
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actions = [
    {
      icon: MessageCircle,
      label: "Chat Support",
      action: () => console.log("Chat support clicked"),
      color: brandConfig.colorPalette.colors.vibrantSky.hex
    },
    {
      icon: Zap,
      label: "Quick Demo",
      action: () => console.log("Quick demo clicked"),
      color: brandConfig.colorPalette.colors.oceanDepth.hex
    },
    {
      icon: Sparkles,
      label: "Get Started",
      action: () => window.open(appSignupUrl, "_blank"),
      color: brandConfig.colorPalette.colors.charcoalCore.hex
    }
  ];

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Action Buttons */}
      <div className={`flex flex-col space-y-3 mb-4 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span 
              className="text-sm font-medium px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg"
              style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
            >
              {action.label}
            </span>
            <button
              onClick={action.action}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
              style={{
                backgroundColor: action.color,
                color: brandConfig.colorPalette.colors.pureWhite.hex
              }}
            >
              <action.icon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => {
          if (isExpanded) {
            scrollToTop();
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
        style={{
          background: `linear-gradient(135deg, ${brandConfig.colorPalette.colors.vibrantSky.hex}, ${brandConfig.colorPalette.colors.oceanDepth.hex})`,
          color: brandConfig.colorPalette.colors.pureWhite.hex
        }}
      >
        <ArrowUp className={`w-6 h-6 transition-transform duration-300 ${
          isExpanded ? 'rotate-180' : 'rotate-0'
        }`} />
      </button>
    </div>
  );
}
