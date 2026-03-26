"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { brandConfig } from "@/lib/brand-config";
import { Menu, X } from "lucide-react";
import { Waves } from "@/components/ui/waves-background";
import { appLoginUrl, appSignupUrl } from "@/lib/app-links";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Solution", href: "/solution" },
    { label: "Features", href: "/features" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Use cases", href: "/use-cases" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      {/* Subtle Waves Background for Navbar */}
      <Waves
        className="opacity-20"
        lineColor={`rgba(${brandConfig.colorPalette.colors.oceanDepth.rgb.join(',')}, 0.3)`}
        backgroundColor="transparent"
        waveSpeedX={0.01}
        waveSpeedY={0.005} 
        waveAmpX={20}
        waveAmpY={10}
        friction={0.95}
        tension={0.005}
        maxCursorMove={60}
        xGap={15}
        yGap={40}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/reputraq-blue-arrow.svg"
              alt="Reputraq Logo"
              width={480}
              height={120}
              className="h-20 sm:h-24 md:h-28 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 hover-subtle-glow"
                style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-2 hover-elegant"
              style={{
                borderColor: brandConfig.colorPalette.colors.oceanDepth.hex,
                color: brandConfig.colorPalette.colors.oceanDepth.hex
              }}
            >
              <Link href={appLoginUrl}>Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="hover-elegant"
              style={{
                backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                color: brandConfig.colorPalette.colors.pureWhite.hex
              }}
            >
              <Link href={appSignupUrl}>Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium transition-all duration-300 hover:scale-105 hover-subtle-glow py-2"
                  style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full border-2"
                  style={{
                    borderColor: brandConfig.colorPalette.colors.oceanDepth.hex,
                    color: brandConfig.colorPalette.colors.oceanDepth.hex
                  }}
                >
                  <Link href={appLoginUrl} onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full"
                  style={{
                    backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                    color: brandConfig.colorPalette.colors.pureWhite.hex
                  }}
                >
                  <Link href={appSignupUrl} onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
