"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatedText } from "./animated-text";
import { brandConfig } from "@/lib/brand-config";
import { appSignupUrl } from "@/lib/app-links";
import { DemoModal } from "./demo-modal";
import { 
  Radio, 
  Cpu, 
  Settings, 
  FileDown,
  BarChart4,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Star,
  Eye
} from "lucide-react";

export function Features() {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set());
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll observer for feature animations
  useEffect(() => {
    const observers = featureRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleFeatures(prev => new Set([...prev, index]));
            }
          });
        },
        { threshold: 0.3 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  const features = [
    {
      icon: Radio,
      title: "Real Time Media Intelligence",
      description: "Track breaking news, online articles, and blogs",
      subDescription: "Detect early signals of crises or opportunities",
      color: brandConfig.colorPalette.colors.vibrantSky.hex,
      gradient: "from-blue-500 to-cyan-500",
      delay: 0,
    },
    {
      icon: MessageSquare,
      title: "Social Intelligence",
      description: "Capture hashtags, keywords, and competitor mentions",
      subDescription: "Surface relevant conversations across social platforms",
      color: brandConfig.colorPalette.colors.oceanDepth.hex,
      gradient: "from-indigo-500 to-purple-500",
      delay: 200
    },
    {
      icon: Cpu,
      title: "AI-Powered Sentiment",
      description: "Classify mentions as positive, neutral, or negative",
      subDescription: "Spot shifts in public perception",
      color: brandConfig.colorPalette.colors.charcoalCore.hex,
      gradient: "from-gray-700 to-gray-900",
      delay: 400
    },
    {
      icon: BarChart4,
      title: "Competitor Intelligence",
      description: "Benchmark your visibility and sentiment against rivals",
      subDescription: "Detect competitor campaigns before they dominate",
      color: "#8b5cf6",
      gradient: "from-purple-500 to-pink-500",
      delay: 600
    },
    {
      icon: Settings,
      title: "Intelligent Discovery",
      description: "Find the stories and mentions that truly matter",
      subDescription: "Filter results by sentiment, source, or reach for deeper insights",
      color: "#06b6d4",
      gradient: "from-cyan-500 to-teal-500",
      delay: 800
    },    
    {
      icon: FileDown,
      title: "Exports & Reports",
      description: "Export CSV data and generate comprehensive reports",
      subDescription: "Create detailed reports and easy-to-share summaries for teams and stakeholders",
      color: "#f59e0b",
      gradient: "from-amber-500 to-orange-500",
      delay: 1000
    }
  ];

  return (
    <section
      id="features"
      className="relative scroll-mt-24 md:scroll-mt-28 overflow-hidden pb-20 pt-24 md:pt-28"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            <AnimatedText
              text="Features"
              className="block"
              delay={200}
              animationType="zoom-in"
              highlightWords={["Features"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
          >
            <AnimatedText
              text="Powerful tools to monitor, analyze, and protect your reputation across all channels"
              className="block"
              delay={1000}
              animationType="slide-up"
            />
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => { featureRefs.current[index] = el; }}
              className={`group relative transition-all duration-1000 transform ${
                visibleFeatures.has(index) 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <div className="relative h-full p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover-elegant">
                {/* Elegant Hover Background */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}15, transparent)`
                  }}
                />
                
                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500"
                    style={{ 
                      backgroundColor: feature.color + '20',
                      boxShadow: `0 10px 30px ${feature.color}30`
                    }}
                  >
                    <feature.icon 
                      className="w-8 h-8" 
                      style={{ color: feature.color }}
                    />
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className="text-2xl font-bold mb-3 group-hover:scale-105 transition-all duration-500"
                    style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                  >
                    <AnimatedText
                      text={feature.title}
                      className="block"
                      delay={feature.delay + 1200}
                      animationType="slide-up"
                    />
                  </h3>
                </div>

                {/* Description */}
                <div className="relative z-10 space-y-4">
                  <p 
                    className="text-lg font-medium leading-relaxed"
                    style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                  >
                    <AnimatedText
                      text={feature.description}
                      className="block"
                      delay={feature.delay + 1400}
                      animationType="slide-up"
                    />
                  </p>
                  
                  <p 
                    className="text-base leading-relaxed"
                    style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
                  >
                    <AnimatedText
                      text={feature.subDescription}
                      className="block"
                      delay={feature.delay + 1600}
                      animationType="slide-up"
                    />
                  </p>
                </div>

                {/* Elegant Border Effect */}
                <div 
                  className="absolute inset-0 rounded-3xl border-2 opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{ 
                    borderColor: feature.color,
                    boxShadow: `0 0 30px ${feature.color}20`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm border border-gray-200 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <Star 
                className="w-8 h-8 mr-3 animate-pulse" 
                style={{ color: brandConfig.colorPalette.colors.vibrantSky.hex }}
              />
              <h3 
                className="text-2xl md:text-3xl font-bold"
                style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
              >
                <AnimatedText
                  text="Ready to experience these features?"
                  className="block"
                  delay={2000}
                      animationType="slide-up"
                  highlightWords={["features"]}
                  highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
                />
              </h3>
            </div>
            
            <p 
              className="text-lg mb-8"
              style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
            >
              <AnimatedText
                text="Start your free trial and see how Reputraq can transform your reputation management."
                className="block"
                delay={2500}
                      animationType="slide-up"
              />
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={appSignupUrl}
                onClick={() => {
                  console.log("Start Free Trial button clicked");
                }}
                className="px-8 py-4 rounded-xl font-semibold text-lg hover-elegant flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                  color: brandConfig.colorPalette.colors.pureWhite.hex,
                  boxShadow: `0 10px 30px ${brandConfig.colorPalette.colors.vibrantSky.hex}30`
                }}
              >
                <AnimatedText
                  text="Start Free Trial"
                  className="block"
                  delay={3000}
                  animationType="bounce-in"
                />
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <button 
                onClick={() => {
                  setIsDemoOpen(true);
                  console.log("View Demo button clicked");
                }}
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2 hover-elegant flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                style={{
                  borderColor: brandConfig.colorPalette.colors.oceanDepth.hex,
                  color: brandConfig.colorPalette.colors.oceanDepth.hex,
                  backgroundColor: 'transparent'
                }}
              >
                <AnimatedText
                  text="View Demo"
                  className="block"
                  delay={3200}
                  animationType="bounce-in"
                />
                <Eye className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}
