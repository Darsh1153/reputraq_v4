"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatedText } from "./animated-text";
import { brandConfig } from "@/lib/brand-config";
import { appSignupUrl } from "@/lib/app-links";
import { cn } from "@/lib/utils";
import { DemoModal } from "./demo-modal";
import { 
  Megaphone, 
  Users, 
  Crown, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Zap, 
  Eye, 
  Search, 
  ArrowRight,
  Sparkles,
  Lightbulb,
  Activity,
  Monitor,
  Shield,
  Bell,
  PieChart,
  Award,
  FileText,
  Calendar
} from "lucide-react";

export function UseCases({ standaloneLayout = false }: { standaloneLayout?: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const useCases = [
    {
      id: 0,
      title: "Brand Analytics",
      icon: Crown,
      color: brandConfig.colorPalette.colors.charcoalCore.hex,
      gradient: "from-purple-500 to-pink-500",
      description: "Comprehensive brand health tracking",
      features: [
        {
          icon: Activity,
          title: "Brand Health Metrics",
          description: "Monitor key brand health indicators and track changes over time"
        },
        {
          icon: Monitor,
          title: "Multi-Platform Coverage",
          description: "Track your brand across news, social media, blogs, and forums"
        },
        {
          icon: Sparkles,
          title: "Influencer Tracking",
          description: "Monitor mentions from key influencers and thought leaders"
        },
        {
          icon: Lightbulb,
          title: "Trend Analysis",
          description: "Identify emerging trends and opportunities in your industry"
        },
        {
          icon: PieChart,
          title: "Audience Insights",
          description: "Understand your audience demographics, sentiment distribution, and engagement patterns"
        },
        {
          icon: Award,
          title: "Performance Benchmarking",
          description: "Compare your brand performance against industry standards and competitors"
        }
      ]
    },
    {
      id: 1,
      title: "PR & Communications",
      icon: Megaphone,
      color: brandConfig.colorPalette.colors.vibrantSky.hex,
      gradient: "from-blue-500 to-cyan-500",
      description: "Track executives, campaigns, and products",
      features: [
        {
          icon: Users,
          title: "Track executives, campaigns, and products",
          description: "Monitor mentions of your executives and key personnel across all media channels"
        },
        {
          icon: Target,
          title: "Campaign Performance",
          description: "Measure the impact and reach of your PR campaigns in real-time"
        },
        {
          icon: TrendingUp,
          title: "Media Sentiment",
          description: "Track positive and negative sentiment trends across different media outlets"
        },
        {
          icon: BarChart3,
          title: "Competitive Analysis",
          description: "Compare your media presence against competitors and industry benchmarks"
        },
        {
          icon: FileText,
          title: "Press Release Tracking",
          description: "Monitor coverage and distribution of your press releases across news outlets and media channels"
        },
        {
          icon: Calendar,
          title: "Event & Campaign Timeline",
          description: "Track PR events, product launches, and campaign milestones with detailed timeline analytics"
        }
      ]
    },
    {
      id: 2,
      title: "Crisis Management",
      icon: AlertTriangle,
      color: brandConfig.colorPalette.colors.oceanDepth.hex,
      gradient: "from-red-500 to-orange-500",
      description: "Rapid response to reputation threats",
      features: [
        {
          icon: Eye,
          title: "Real-time Threat Detection",
          description: "Get instant alerts when negative stories about your brand start trending"
        },
        {
          icon: Search,
          title: "Source Tracking",
          description: "Identify the origin of negative content and track its spread across platforms"
        },
        {
          icon: Zap,
          title: "Rapid Response",
          description: "Quickly assess the scope and impact of reputation threats"
        },
        {
          icon: Globe,
          title: "Global Monitoring",
          description: "Track reputation threats across all languages and regions worldwide"
        },
        {
          icon: Shield,
          title: "Crisis Escalation Management",
          description: "Automatically prioritize and escalate critical threats based on severity and reach"
        },
        {
          icon: Bell,
          title: "Automated Alert System",
          description: "Receive instant notifications via email, SMS, or dashboard when threats are detected"
        }
      ]
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance categories
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveCategory(prev => (prev + 1) % useCases.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, useCases.length]);

  return (
    <section
      id="use-cases"
      className={cn(
        // Clip overflow: dots near 100% left, card hover scales, and tab panels must not widen the page
        "relative scroll-mt-24 md:scroll-mt-28 overflow-hidden max-w-full",
        // Top padding must live on the section (not an outer wrapper) so the gradient
        // background fills the area below the fixed navbar — otherwise the wrapper shows as plain white.
        standaloneLayout
          ? "pb-20 pt-24 md:pt-28"
          : "py-20",
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
      
      {/* Animated Background Elements — overflow hidden so edge-positioned dots cannot widen the viewport */}
      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const positions = [
            { left: 10, top: 20, delay: 0.5, duration: 3.2 },
            { left: 85, top: 15, delay: 1.2, duration: 4.1 },
            { left: 30, top: 80, delay: 2.8, duration: 5.3 },
            { left: 70, top: 45, delay: 0.8, duration: 3.7 },
            { left: 15, top: 60, delay: 3.5, duration: 4.9 },
            { left: 90, top: 75, delay: 1.7, duration: 3.4 },
            { left: 45, top: 25, delay: 2.1, duration: 4.6 },
            { left: 60, top: 90, delay: 0.3, duration: 5.1 },
            { left: 25, top: 35, delay: 4.2, duration: 3.8 },
            { left: 80, top: 55, delay: 1.9, duration: 4.3 },
            { left: 5, top: 70, delay: 2.6, duration: 3.9 },
            { left: 95, top: 30, delay: 0.7, duration: 4.7 },
            { left: 40, top: 85, delay: 3.1, duration: 3.5 },
            { left: 75, top: 10, delay: 1.4, duration: 5.0 },
            { left: 20, top: 50, delay: 2.9, duration: 4.2 },
            { left: 65, top: 65, delay: 0.9, duration: 3.6 },
            { left: 35, top: 40, delay: 3.8, duration: 4.4 },
            { left: 55, top: 95, delay: 1.6, duration: 3.3 },
            { left: 12, top: 5, delay: 2.4, duration: 4.8 },
            { left: 88, top: 85, delay: 0.1, duration: 3.1 }
          ];
          const pos = positions[i] || { left: 50, top: 50, delay: 1, duration: 4 };
          
          return (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                animationDelay: `${pos.delay}s`,
                animationDuration: `${pos.duration}s`
              }}
            />
          );
        })}
      </div>
      
      <div className="container mx-auto max-w-full px-4 relative z-10 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            <AnimatedText
              text="Use Cases"
              className="block"
              delay={200}
              highlightWords={["Use Cases"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
          >
            <AnimatedText
              text="Powering reputation management across industries and roles"
              className="block"
              delay={1000}
              highlightWords={["reputation management", "industries", "roles"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </p>
        </div>

        {/* Category Navigation — avoid scale transforms (they overflow and cause horizontal scroll) */}
        <div className="w-full max-w-full overflow-hidden mb-16">
          <div className="flex flex-wrap justify-center gap-4">
          {useCases.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(index)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-md ${
                activeCategory === index 
                  ? 'shadow-lg' 
                  : ''
              }`}
              style={{
                backgroundColor: activeCategory === index ? category.color : 'rgba(255, 255, 255, 0.8)',
                color: activeCategory === index ? 'white' : brandConfig.colorPalette.colors.charcoalCore.hex,
                border: `2px solid ${activeCategory === index ? category.color : 'transparent'}`,
                boxShadow: activeCategory === index 
                  ? `0 10px 30px ${category.color}30` 
                  : '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center space-x-2">
                <category.icon className="w-5 h-5" />
                <span>{category.title}</span>
              </div>
            </button>
          ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto w-full min-w-0 overflow-hidden">
          {/* Active Category Display — relative wrapper contains absolute inactive panels */}
          <div className="relative mb-16 w-full min-h-[1px] min-w-0 overflow-hidden">
            {useCases.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className={`transition-all duration-1000 w-full max-w-full ${
                  activeCategory === categoryIndex 
                    ? 'relative z-10 opacity-100 translate-y-0' 
                    : 'pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0 translate-y-8'
                }`}
              >
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl"
                    style={{ 
                      backgroundColor: category.color,
                      boxShadow: `0 20px 40px ${category.color}30`
                    }}
                  >
                    <category.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 
                    className="text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                  >
                    <AnimatedText
                      text={category.title}
                      className="block"
                      delay={200}
                    />
                  </h3>
                  <p 
                    className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
                    style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
                  >
                    <AnimatedText
                      text={category.description}
                      className="block"
                      delay={800}
                    />
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 min-w-0">
                  {category.features.map((feature, featureIndex) => (
                    <div
                      key={`${categoryIndex}-${featureIndex}`}
                      className={`relative p-8 rounded-3xl bg-white/90 backdrop-blur-sm border-2 transition-all duration-700 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer min-w-0 ${
                        activeCategory === categoryIndex
                          ? 'opacity-100 translate-y-0 scale-100' 
                          : 'opacity-0 translate-y-8 scale-95'
                      }`}
                      style={{
                        borderColor: category.color,
                        boxShadow: `0 15px 35px ${category.color}20`,
                        transitionDelay: `${featureIndex * 200}ms`
                      }}
                      onMouseEnter={() => setHoveredCard(featureIndex)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Hover Effect */}
                      <div 
                        className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                          hoveredCard === featureIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${category.color}10, transparent)`
                        }}
                      />
                      
                      {/* Icon */}
                      <div className="relative z-10 mb-6">
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300"
                          style={{ 
                            backgroundColor: category.color + '20',
                            boxShadow: `0 10px 25px ${category.color}30`
                          }}
                        >
                          <feature.icon 
                            className="w-8 h-8" 
                            style={{ color: category.color }}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <h4 
                          className="text-xl font-bold mb-3"
                          style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                        >
                          {feature.title}
                        </h4>
                        <p 
                          className="text-gray-600 leading-relaxed"
                          style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
                        >
                          {feature.description}
                        </p>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-4 right-4">
                        <div 
                          className="w-3 h-3 rounded-full animate-pulse"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className="text-center">
            <div 
              className="max-w-4xl mx-auto p-12 rounded-3xl shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${brandConfig.colorPalette.colors.vibrantSky.hex}10, ${brandConfig.colorPalette.colors.oceanDepth.hex}10)`,
                border: `2px solid ${brandConfig.colorPalette.colors.vibrantSky.hex}20`
              }}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6 min-w-0">
                <Sparkles 
                  className="w-8 h-8 shrink-0 animate-pulse" 
                  style={{ color: brandConfig.colorPalette.colors.vibrantSky.hex }}
                />
                <h3 
                  className="text-3xl md:text-4xl font-bold min-w-0 max-w-full text-center"
                  style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                >
                  <AnimatedText
                    text="Ready to transform your reputation management?"
                    className="block"
                    delay={200}
                    highlightWords={["transform", "reputation management"]}
                    highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
                  />
                </h3>
              </div>
              
              <p 
                className="text-lg mb-8 max-w-2xl mx-auto"
                style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
              >
                <AnimatedText
                  text="Join thousands of professionals who trust Reputraq to protect and enhance their reputation across all channels."
                  className="block"
                  delay={1000}
                />
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={appSignupUrl}
                  onClick={() => {
                    console.log("Start Free Trial button clicked from Use Cases");
                  }}
                  className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:brightness-105 flex items-center justify-center group"
                  style={{
                    backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                    color: brandConfig.colorPalette.colors.pureWhite.hex,
                    boxShadow: `0 10px 30px ${brandConfig.colorPalette.colors.vibrantSky.hex}30`
                  }}
                >
                  <AnimatedText
                    text="Start Free Trial"
                    className="block"
                    delay={1500}
                  />
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                
                <button 
                  onClick={() => {
                    setIsDemoOpen(true);
                    console.log("Schedule Demo button clicked from Use Cases");
                  }}
                  className="px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 hover:brightness-95 flex items-center justify-center group"
                  style={{
                    borderColor: brandConfig.colorPalette.colors.oceanDepth.hex,
                    color: brandConfig.colorPalette.colors.oceanDepth.hex,
                    backgroundColor: 'transparent'
                  }}
                >
                  <AnimatedText
                    text="Schedule Demo"
                    className="block"
                    delay={1700}
                  />
                  <Eye className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
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
