"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Waves } from "@/components/ui/waves-background"
import { brandConfig } from "@/lib/brand-config"
import { appSignupUrl } from "@/lib/app-links"
import { DemoModal } from "@/components/demo-modal"

interface HeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function Hero({
  eyebrow = "Introducing Reputraq",
  title,
  subtitle,
  ctaLabel = "Get Early Access",
  ctaHref = appSignupUrl,
}: HeroProps) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-40 px-6 text-center md:px-8 
      min-h-[calc(100vh-40px)] overflow-hidden 
      rounded-b-xl"
      style={{
        background: `linear-gradient(135deg, ${brandConfig.colorPalette.colors.pureWhite.hex} 0%, ${brandConfig.uiGuidelines.backgroundGradient.colors[1]} 100%)`
      }}
    >
      {/* Interactive Waves Background */}
      <Waves
        className="opacity-30"
        lineColor={`rgba(${brandConfig.colorPalette.colors.vibrantSky.rgb.join(',')}, 0.4)`}
        backgroundColor="transparent"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />

      {/* Grid BG */}
      <div
        className="absolute -z-10 inset-0 opacity-60 h-[600px] w-full 
        bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] 
        bg-[size:6rem_5rem] 
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Radial Accent with Brand Colors */}
      <div
        className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] 
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] animate-fade-up"
        style={{
          background: `radial-gradient(closest-side, ${brandConfig.colorPalette.colors.pureWhite.hex} 82%, ${brandConfig.colorPalette.colors.vibrantSky.hex}20)`,
          border: `2px solid ${brandConfig.colorPalette.colors.vibrantSky.hex}40`
        }}
      />

      {/* Eyebrow */}
      {eyebrow && (
        <a href="#" className="group">
          <span
            className="text-sm mx-auto px-5 py-2 
            bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent  
            border-[2px] rounded-3xl w-fit tracking-tight uppercase flex items-center justify-center
            font-semibold"
            style={{
              color: brandConfig.colorPalette.colors.oceanDepth.hex,
              borderColor: `${brandConfig.colorPalette.colors.vibrantSky.hex}40`
            }}
          >
            {eyebrow}
            <ChevronRight 
              className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: brandConfig.colorPalette.colors.vibrantSky.hex }}
            />
          </span>
        </a>
      )}

      {/* Title */}
      <h1
        className="text-balance py-6 text-4xl font-medium leading-tight tracking-tight 
        sm:text-5xl md:text-6xl lg:text-7xl"
        style={{
          background: `linear-gradient(135deg, ${brandConfig.colorPalette.colors.charcoalCore.hex} 0%, ${brandConfig.colorPalette.colors.oceanDepth.hex} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: 1,
          transform: 'translateY(0)',
          animation: 'fade-in 0.8s ease-out 0.5s forwards'
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        className="mb-12 text-balance text-lg tracking-tight md:text-xl"
        style={{ 
          color: brandConfig.colorPalette.colors.oceanDepth.hex,
          opacity: 1,
          transform: 'translateY(0)',
          animation: 'fade-in 0.8s ease-out 0.8s forwards'
        }}
      >
        {subtitle}
      </p>

      {/* CTA */}
      {ctaLabel && (
        <div 
          className="flex justify-center gap-4" 
          style={{ 
            opacity: 1,
            transform: 'translateY(0)',
            animation: 'fade-in 0.8s ease-out 1.1s forwards'
          }}
        >
          <Button
            asChild
            className="mt-[-20px] w-fit md:w-52 z-20 tracking-tighter text-center text-lg hover-elegant"
            style={{
              backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
              color: brandConfig.colorPalette.colors.pureWhite.hex,
              border: `2px solid ${brandConfig.colorPalette.colors.vibrantSky.hex}`
            }}
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsDemoOpen(true);
            }}
            className="mt-[-20px] w-fit md:w-52 z-20 tracking-tighter text-center text-lg hover-elegant flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'transparent',
              color: brandConfig.colorPalette.colors.oceanDepth.hex,
              border: `2px solid ${brandConfig.colorPalette.colors.oceanDepth.hex}`
            }}
          >
            Request Demo
            <Eye className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Bottom Fade */}
      <div
        className="animate-fade-up relative mt-32 opacity-0 [perspective:2000px] 
        after:absolute after:inset-0 after:z-50 
        after:[background:linear-gradient(to_top,hsl(var(--background))_10%,transparent)]"
      />

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  )
}
