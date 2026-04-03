"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatedText } from "./animated-text";
import { brandConfig } from "@/lib/brand-config";
import { appSignupUrl } from "@/lib/app-links";
import { DemoModal } from "./demo-modal";
import { 
  Globe, 
  Zap, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Download,
  Users,
  Eye,
  ArrowRight,
  Sparkles,
  Target
} from "lucide-react";

export function TheReputraqSolution() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll observer for section animations
  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections(prev => new Set([...prev, index]));
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

  const poweredByFeatures = [
    {
      icon: Globe,
      title: "Global News Intelligence",
      description: "Access 500,000+ news & blog sources in 177 countries and 60+ languages",
      color: brandConfig.colorPalette.colors.vibrantSky.hex,
      delay: 0
    },
    {
      icon: Users,
      title: "Social Data",
      description: "Track mentions by keyword, hashtag, or handle across key platforms",
      color: brandConfig.colorPalette.colors.oceanDepth.hex,
      delay: 200
    }
  ];

  const whyChooseFeatures = [
    {
      icon: BarChart3,
      title: "One Dashboard, Full Coverage",
      description: "All news & mentions in one place",
      color: brandConfig.colorPalette.colors.vibrantSky.hex,
      delay: 0
    },
    {
      icon: Zap,
      title: "Unified Media Visibility",
      description: "View every story and mention from one powerful dashboard",
      color: brandConfig.colorPalette.colors.oceanDepth.hex,
      delay: 200
    },    
    {
      icon: TrendingUp,
      title: "Built-In Sentiment Analysis",
      description: "Spot positive, neutral, or negative coverage instantly",
      color: brandConfig.colorPalette.colors.charcoalCore.hex,
      delay: 400
    },
    {
      icon: Target,
      title: "Competitor Intelligence",
      description: "Compare reach, visibility, and sentiment side by side",
      color: brandConfig.colorPalette.colors.vibrantSky.hex,
      delay: 600
    },
    {
      icon: Download,
      title: "Comprehensive Reports & Exports",
      description: "Generate detailed reports and share insights instantly with leadership and clients",
      color: brandConfig.colorPalette.colors.oceanDepth.hex,
      delay: 800
    },
    {
      icon: Shield,
      title: "Scales with You",
      description: "From startups to enterprises",
      color: brandConfig.colorPalette.colors.charcoalCore.hex,
      delay: 1000
    }
  ];

  return (
    <section id="solution" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-gray-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Title */}
        <div className="text-center mb-20">
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            <AnimatedText
              text="The Reputraq Solution"
              className="block"
              delay={200}
              highlightWords={["Reputraq", "Solution"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
          >
            <AnimatedText
              text="Reputraq unifies global news intelligence and social intelligence into one seamless platform."
              className="block"
              delay={1000}
            />
          </p>
        </div>

        {/* Powered By Section */}
        <div className="mb-20">
          <h3 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            <AnimatedText
              text="Powered by:"
              className="block"
              delay={1500}
              highlightWords={["Powered"]}
              highlightColor={brandConfig.colorPalette.colors.oceanDepth.hex}
            />
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {poweredByFeatures.map((feature, index) => (
              <div
                key={index}
                ref={(el) => { sectionRefs.current[index] = el; }}
                className={`transition-all duration-1000 transform ${
                  visibleSections.has(index) 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start space-x-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse"
                      style={{ 
                        backgroundColor: feature.color + '20',
                        boxShadow: `0 0 20px ${feature.color}30`
                      }}
                    >
                      <feature.icon 
                        className="w-8 h-8" 
                        style={{ color: feature.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 
                        className="text-2xl font-bold mb-3"
                        style={{ color: feature.color }}
                      >
                        <AnimatedText
                          text={feature.title}
                          className="block"
                          delay={feature.delay + 2000}
                        />
                      </h4>
                      <p 
                        className="text-lg leading-relaxed"
                        style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                      >
                        <AnimatedText
                          text={feature.description}
                          className="block"
                          delay={feature.delay + 2500}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="mb-20">
          <h3 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            <AnimatedText
              text="Why organizations choose Reputraq:"
              className="block"
              delay={3000}
              highlightWords={["organizations", "Reputraq"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseFeatures.map((feature, index) => (
              <div
                key={index}
                ref={(el) => { sectionRefs.current[index + 2] = el; }}
                className={`transition-all duration-1000 transform ${
                  visibleSections.has(index + 2) 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="text-center">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        backgroundColor: feature.color + '20',
                        boxShadow: `0 0 15px ${feature.color}30`
                      }}
                    >
                      <feature.icon 
                        className="w-7 h-7" 
                        style={{ color: feature.color }}
                      />
                    </div>
                    <h4 
                      className="text-lg font-bold mb-3"
                      style={{ color: feature.color }}
                    >
                      <AnimatedText
                        text={feature.title}
                        className="block"
                        delay={feature.delay + 4000}
                      />
                    </h4>
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                    >
                      <AnimatedText
                        text={feature.description}
                        className="block"
                        delay={feature.delay + 4500}
                      />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div
            ref={(el) => { sectionRefs.current[8] = el; }}
            className={`transition-all duration-1000 transform ${
              visibleSections.has(8) 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm border border-gray-200 shadow-xl">
              <div className="flex items-center justify-center mb-6">
                <Sparkles 
                  className="w-8 h-8 mr-3 animate-pulse" 
                  style={{ color: brandConfig.colorPalette.colors.vibrantSky.hex }}
                />
                <h3 
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                >
                  <AnimatedText
                    text="Ready to transform your reputation management?"
                    className="block"
                    delay={6000}
                    highlightWords={["transform", "reputation management"]}
                    highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
                  />
                </h3>
              </div>
              <p 
                className="text-lg mb-8"
                style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
              >
                <AnimatedText
                  text="Join organizations worldwide who trust Reputraq to protect and enhance their reputation."
                  className="block"
                  delay={7000}
                />
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href={appSignupUrl}
                  className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  style={{
                    backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                    color: brandConfig.colorPalette.colors.pureWhite.hex,
                    boxShadow: `0 10px 30px ${brandConfig.colorPalette.colors.vibrantSky.hex}30`
                  }}
                >
                  <AnimatedText
                    text="Get Started Today"
                    className="block"
                    delay={8000}
                  />
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button 
                  onClick={() => {
                    setIsDemoOpen(true);
                    console.log("Schedule Demo button clicked");
                  }}
                  className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  style={{
                    borderColor: brandConfig.colorPalette.colors.oceanDepth.hex,
                    color: brandConfig.colorPalette.colors.oceanDepth.hex,
                    backgroundColor: 'transparent'
                  }}
                >
                  <AnimatedText
                    text="Schedule Demo"
                    className="block"
                    delay={8500}
                  />
                  <Eye className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}
