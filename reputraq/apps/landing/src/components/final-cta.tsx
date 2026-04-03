"use client";

import Link from "next/link";
import { brandConfig } from "@/lib/brand-config";
import { 
  ArrowRight, 
  CheckCircle
} from "lucide-react";
import { appSignupUrl } from "@/lib/app-links";

export function FinalCTA() {
  return (
    <section className="relative py-20 overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <h2 
              className="text-5xl md:text-6xl font-bold mb-8 leading-tight"
              style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
            >
              Stay Ahead of Every Story with{' '}
              <span style={{ color: brandConfig.colorPalette.primary.main }}>
                Reputraq
              </span>
            </h2>
            
            <p 
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light"
              style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
            >
              Your reputation is your most valuable asset. Reputraq ensures you&apos;re never blindsided by a breaking headline or viral post.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-12">
            <Link 
              href={appSignupUrl}
              className="group relative px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto shadow-lg"
              style={{
                backgroundColor: brandConfig.colorPalette.primary.main,
                color: 'white',
                boxShadow: `0 10px 30px ${brandConfig.colorPalette.primary.main}30`
              }}
            >
              <span className="flex items-center">
                <span className="mr-3 text-2xl">👉</span>
                Get Early Access Today
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" style={{ color: brandConfig.colorPalette.primary.main }} />
              <span 
                className="text-sm font-medium"
                style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
              >
                No credit card required
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" style={{ color: brandConfig.colorPalette.primary.main }} />
              <span 
                className="text-sm font-medium"
                style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
              >
                14-day free trial
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" style={{ color: brandConfig.colorPalette.primary.main }} />
              <span 
                className="text-sm font-medium"
                style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
              >
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
