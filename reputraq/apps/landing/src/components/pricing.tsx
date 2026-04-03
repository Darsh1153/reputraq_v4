"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatedText } from "./animated-text";
import { brandConfig } from "@/lib/brand-config";
import {
  starterPlanCheckoutUrl,
  growthPlanCheckoutUrl,
  enterprisePlanCheckoutUrl,
} from "@/lib/app-links";
import { 
  Check, 
  Star, 
  Crown, 
  Users, 
  BarChart3, 
  Bell, 
  Download, 
  Headphones, 
  Settings, 
  Shield, 
  ArrowRight,
  TrendingUp,
  Globe,
  Target,
  Rocket
} from "lucide-react";

export function Pricing() {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [visiblePlans, setVisiblePlans] = useState<Set<number>>(new Set());
  const planRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll observer for plan animations
  useEffect(() => {
    const observers = planRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisiblePlans(prev => new Set(prev).add(index));
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  const plans = [
    {
      id: 0,
      name: "Starter Plan",
      price: { monthly: 6999 },
      description: "For individuals and small teams",
      icon: Users,
      color: brandConfig.colorPalette.colors.vibrantSky.hex,
      gradient: "from-blue-500 to-cyan-500",
      popular: false,
      features: [
        { text: "Up to 2 keywords", icon: Target },
        { text: "Weekly reports", icon: BarChart3 },
        { text: "Basic sentiment insights", icon: TrendingUp }
      ],
      cta: "Get Started",
      ctaIcon: ArrowRight,
      ctaHref: starterPlanCheckoutUrl,
    },
    {
      id: 1,
      name: "Growth Plan",
      price: { monthly: 9999 },
      description: "For scaling organizations and agencies",
      icon: Rocket,
      color: brandConfig.colorPalette.colors.oceanDepth.hex,
      gradient: "from-indigo-500 to-purple-500",
      popular: true,
      features: [
        { text: "Up to 3 keywords", icon: Target },
        { text: "Real-time alerts via Slack & Teams", icon: Bell },
        { text: "Competitor dashboard", icon: Globe },
        { text: "Unlimited exports & reports", icon: Download }
      ],
      cta: "Get Started",
      ctaIcon: Rocket,
      ctaHref: growthPlanCheckoutUrl,
    },
    {
      id: 2,
      name: "Enterprise Plan",
      price: { monthly: 14999 },
      description: "For large organizations needing scale and support",
      icon: Crown,
      color: brandConfig.colorPalette.colors.charcoalCore.hex,
      gradient: "from-gray-700 to-gray-900",
      popular: false,
      features: [
        { text: "Up to 5 keywords", icon: Target },
        { text: "Dedicated account manager", icon: Headphones },
        { text: "Custom integrations", icon: Settings },
        { text: "Priority onboarding & support", icon: Shield }
      ],
      cta: "Get Started",
      ctaIcon: Crown,
      ctaHref: enterprisePlanCheckoutUrl,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 md:scroll-mt-28 overflow-hidden pb-20 pt-24 md:pt-28"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(30)].map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const positions = [
            { left: 5, top: 10, delay: 0.2, duration: 3.1 },
            { left: 15, top: 25, delay: 1.5, duration: 4.2 },
            { left: 25, top: 40, delay: 2.8, duration: 3.7 },
            { left: 35, top: 55, delay: 0.7, duration: 4.9 },
            { left: 45, top: 70, delay: 3.2, duration: 3.4 },
            { left: 55, top: 85, delay: 1.1, duration: 4.6 },
            { left: 65, top: 15, delay: 2.4, duration: 3.8 },
            { left: 75, top: 30, delay: 0.9, duration: 4.3 },
            { left: 85, top: 45, delay: 3.6, duration: 3.2 },
            { left: 95, top: 60, delay: 1.8, duration: 4.7 },
            { left: 8, top: 75, delay: 2.1, duration: 3.9 },
            { left: 18, top: 90, delay: 0.4, duration: 4.1 },
            { left: 28, top: 5, delay: 3.3, duration: 3.5 },
            { left: 38, top: 20, delay: 1.7, duration: 4.8 },
            { left: 48, top: 35, delay: 2.5, duration: 3.6 },
            { left: 58, top: 50, delay: 0.6, duration: 4.4 },
            { left: 68, top: 65, delay: 3.9, duration: 3.3 },
            { left: 78, top: 80, delay: 1.3, duration: 4.5 },
            { left: 88, top: 95, delay: 2.7, duration: 3.8 },
            { left: 12, top: 12, delay: 0.8, duration: 4.2 },
            { left: 22, top: 27, delay: 3.1, duration: 3.7 },
            { left: 32, top: 42, delay: 1.4, duration: 4.9 },
            { left: 42, top: 57, delay: 2.6, duration: 3.4 },
            { left: 52, top: 72, delay: 0.3, duration: 4.6 },
            { left: 62, top: 87, delay: 3.7, duration: 3.2 },
            { left: 72, top: 8, delay: 1.9, duration: 4.8 },
            { left: 82, top: 23, delay: 2.2, duration: 3.6 },
            { left: 92, top: 38, delay: 0.5, duration: 4.3 },
            { left: 2, top: 53, delay: 3.4, duration: 3.9 },
            { left: 7, top: 68, delay: 1.6, duration: 4.1 }
          ];
          const pos = positions[i] || { left: 50, top: 50, delay: 1, duration: 4 };
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-float"
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
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            <AnimatedText
              text="Simple, Transparent Pricing"
              className="block"
              delay={200}
              animationType="bounce-in"
              highlightWords={["Simple", "Transparent", "Pricing"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </h2>
          <p 
            className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-8"
            style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
          >
            <AnimatedText
              text="Choose the perfect plan for your reputation management needs"
              className="block"
              delay={1000}
              animationType="slide-up"
              highlightWords={["perfect plan", "reputation management"]}
              highlightColor={brandConfig.colorPalette.colors.vibrantSky.hex}
            />
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              ref={(el) => { planRefs.current[index] = el; }}
              className={`relative transition-all duration-700 transform ${
                visiblePlans.has(index) 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              } ${plan.popular ? 'md:scale-105 z-10' : ''}`}
              style={{ transitionDelay: `${index * 200}ms` }}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div 
                    className="px-6 py-2 rounded-full text-white font-bold text-sm shadow-lg animate-pulse-glow"
                    style={{ backgroundColor: plan.color }}
                  >
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Card */}
              <div 
                className={`relative p-8 rounded-3xl bg-white/90 backdrop-blur-sm border-2 transition-all duration-500 cursor-pointer ${
                  plan.popular 
                    ? 'shadow-2xl scale-105' 
                    : 'shadow-lg hover-elegant'
                } ${
                  hoveredPlan === index ? 'scale-105' : ''
                }`}
                style={{
                  borderColor: plan.popular ? plan.color : '#e5e7eb',
                  boxShadow: plan.popular 
                    ? `0 25px 50px ${plan.color}30, 0 0 0 1px ${plan.color}20`
                    : hoveredPlan === index 
                      ? `0 20px 40px ${plan.color}20`
                      : '0 10px 25px rgba(0,0,0,0.1)',
                  background: plan.popular 
                    ? `linear-gradient(135deg, ${plan.color}05, white 50%)`
                    : 'rgba(255, 255, 255, 0.9)'
                }}
                onClick={() => {}}
              >
                {/* Hover Effect */}
                <div 
                  className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${
                    hoveredPlan === index ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${plan.color}10, transparent)`
                  }}
                />

                {/* Plan Icon */}
                <div className="relative z-10 text-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300"
                    style={{ 
                      backgroundColor: plan.color + '20',
                      boxShadow: `0 10px 25px ${plan.color}30`
                    }}
                  >
                    <plan.icon 
                      className="w-8 h-8" 
                      style={{ color: plan.color }}
                    />
                  </div>
                </div>

                {/* Plan Details */}
                <div className="relative z-10 text-center mb-8">
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                  >
                    {plan.name}
                  </h3>
                  <p 
                    className="text-gray-600 mb-6"
                    style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
                  >
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div 
                      className="text-4xl font-bold mb-2"
                      style={{ color: plan.color }}
                    >
                      {formatPrice(plan.price.monthly)}
                      <span className="text-lg text-gray-500">/month</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="relative z-10 space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: plan.color + '20' }}
                      >
                        <Check 
                          className="w-4 h-4" 
                          style={{ color: plan.color }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <feature.icon 
                          className="w-4 h-4 text-gray-500" 
                        />
                        <span 
                          className="text-sm"
                          style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                        >
                          {feature.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="relative z-10">
                  <Link 
                    href={plan.ctaHref}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg hover-elegant flex items-center justify-center space-x-2 ${
                      plan.popular 
                        ? 'text-white shadow-lg' 
                        : 'border-2'
                    }`}
                    style={{
                      backgroundColor: plan.popular ? plan.color : 'transparent',
                      borderColor: plan.popular ? plan.color : plan.color,
                      color: plan.popular ? 'white' : plan.color,
                      boxShadow: plan.popular 
                        ? `0 10px 30px ${plan.color}30`
                        : 'none'
                    }}
                  >
                    <span>{plan.cta}</span>
                    <plan.ctaIcon className="w-5 h-5" />
                  </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: plan.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
