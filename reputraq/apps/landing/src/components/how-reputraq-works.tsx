"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatedText } from "./animated-text";
import { brandConfig } from "@/lib/brand-config";
import { 
  Target, 
  Search, 
  Brain, 
  Bell, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export function HowReputraqWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Scroll observer for step animations
  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSteps(prev => new Set([...prev, index]));
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

  const steps = [
    {
      number: 1,
      icon: Target,
      title: "Define your topics",
      description: "brand names, executives, competitors, or campaigns",
      color: brandConfig.colorPalette.colors.vibrantSky.hex,
      gradient: "from-blue-500 to-cyan-500",
      delay: 0
    },
    {
      number: 2,
      icon: Search,
      title: "Reputraq scans global media",
      description: "& online conversations in real time",
      color: brandConfig.colorPalette.colors.oceanDepth.hex,
      gradient: "from-indigo-500 to-purple-500",
      delay: 200
    },
    {
      number: 3,
      icon: Brain,
      title: "Each mention is enriched",
      description: "with sentiment, reach, and source credibility",
      color: brandConfig.colorPalette.colors.charcoalCore.hex,
      gradient: "from-gray-700 to-gray-900",
      delay: 400
    },
    {
      number: 4,
      icon: Bell,
      title: "Turn insights into action",
      description: "Make data-driven decisions with confidence",
      color: "#8b5cf6",
      gradient: "from-purple-500 to-pink-500",
      delay: 600
    },
    {
      number: 5,
      icon: BarChart3,
      title: "Use dashboards & reports",
      description: "to analyze, report, and act",
      color: "#06b6d4",
      gradient: "from-cyan-500 to-teal-500",
      delay: 800
    }
  ];

  return (
    <section
      id="how-it-works"
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
              text="How Reputraq Works"
              className="block"
              delay={200}
              animationType="flip-in"
              highlightWords={["Reputraq", "Works"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
          >
            <AnimatedText
              text="From raw mentions to actionable intelligence — in minutes."
              className="block"
              delay={1000}
              highlightWords={["raw mentions", "actionable intelligence", "minutes"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2 hidden lg:block">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${(activeStep / (steps.length - 1)) * 100}%`,
                background: `linear-gradient(90deg, ${brandConfig.colorPalette.colors.vibrantSky.hex}, ${brandConfig.colorPalette.colors.oceanDepth.hex})`,
                boxShadow: `0 0 20px ${brandConfig.colorPalette.colors.vibrantSky.hex}40`
              }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => { stepRefs.current[index] = el; }}
                className={`relative transition-all duration-1000 transform ${
                  visibleSteps.has(index) 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                } ${activeStep === index ? 'z-20' : 'z-10'}`}
                style={{ transitionDelay: `${step.delay}ms` }}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Step Card */}
                <div className={`relative p-6 rounded-3xl bg-white/90 backdrop-blur-sm border-2 transition-all duration-500 group cursor-pointer ${
                  activeStep === index 
                    ? 'shadow-2xl scale-105' 
                    : 'shadow-lg hover:shadow-xl hover:scale-102'
                }`}
                style={{
                  borderColor: activeStep === index ? step.color : '#e5e7eb',
                  boxShadow: activeStep === index 
                    ? `0 25px 50px ${step.color}30` 
                    : '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300"
                      style={{ 
                        backgroundColor: step.color,
                        boxShadow: `0 0 20px ${step.color}50`
                      }}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="text-center mb-6">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                        activeStep === index ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: step.color + '20',
                        boxShadow: `0 10px 30px ${step.color}30`
                      }}
                    >
                      <step.icon 
                        className="w-8 h-8" 
                        style={{ color: step.color }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 
                      className="text-xl font-bold mb-3 transition-colors duration-300"
                      style={{ 
                        color: activeStep === index 
                          ? step.color 
                          : brandConfig.colorPalette.colors.charcoalCore.hex 
                      }}
                    >
                      <AnimatedText
                        text={step.title}
                        className="block"
                        delay={step.delay + 1200}
                      />
                    </h3>
                    
                    <p 
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
                    >
                      <AnimatedText
                        text={step.description}
                        className="block"
                        delay={step.delay + 1400}
                      />
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div 
                    className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      activeStep === index ? 'opacity-100' : ''
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${step.color}10, transparent)`
                    }}
                  />
                </div>

                {/* Arrow (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight 
                      className={`w-6 h-6 transition-all duration-500 ${
                        activeStep === index ? 'scale-125' : 'scale-100'
                      }`}
                      style={{ 
                        color: activeStep >= index 
                          ? brandConfig.colorPalette.colors.vibrantSky.hex 
                          : '#d1d5db' 
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
