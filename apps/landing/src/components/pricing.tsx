"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatedText } from "./animated-text";
import { brandConfig } from "@/lib/brand-config";
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
import {
  starterPlanCheckoutUrl,
  growthPlanCheckoutUrl,
  enterprisePlanCheckoutUrl,
} from "@/lib/app-links";

const Pricing = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateScreenSize(); // Set initial value
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
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

  const formatInr = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <AnimatedText text="Pricing" />
        <p className="text-center text-lg text-gray-700 mb-12">
          Choose the plan that best fits your needs. All plans include a 14-day free trial.
        </p>

        <div className="grid gap-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white p-8 rounded-2xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <span>{formatInr(plan.price.monthly)}/mo</span>
                </div>
              </div>
              <p className="text-lg text-gray-800 mb-6">{plan.description}</p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div className="flex items-center text-gray-600 text-sm mb-2 sm:mb-0">
                  <plan.icon className="w-5 h-5 mr-2 text-green-500" />
                  <span>Features:</span>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700 text-sm">
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                      {feature.text}
                    </li>
                  ))}
                </ul>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
