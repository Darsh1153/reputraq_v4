"use client";

import { useState } from "react";
import { brandConfig } from "@/lib/brand-config";
import { 
  Plus, 
  Minus, 
  HelpCircle, 
  Shield, 
  Download, 
  Globe,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Clock,
  Users,
  Bell,
  Zap,
  CreditCard,
  BarChart3
} from "lucide-react";

export function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    console.log(`Toggling FAQ item at index: ${index}`);
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      console.log(`Open items:`, Array.from(newSet));
      return newSet;
    });
  };

  const faqs = [
    {
      question: "What does Reputraq track?",
      answer: "Reputraq tracks global news, blogs, and social mentions. We monitor your brand across major news outlets, blogs, and social media platforms in real time.",
      icon: Globe,
      color: brandConfig.colorPalette.primary.main
    },
    {
      question: "Can I export reports?",
      answer: "Yes — CSV exports, comprehensive reports, and email digests are included. You can download detailed analytics, sentiment reports, and custom date range exports anytime.",
      icon: Download,
      color: brandConfig.colorPalette.secondary.main
    },
    {
      question: "Is the data secure?",
      answer: "Absolutely — encrypted connections & secure authentication are standard. We use enterprise-grade security with end-to-end encryption, SOC 2 compliance, and regular security audits.",
      icon: Shield,
      color: brandConfig.colorPalette.colors.charcoalCore.hex
    },
    {
      question: "How often is the data updated?",
      answer: "Reputraq provides real-time monitoring with data updates every few minutes. Critical alerts are sent immediately, while comprehensive reports are compiled hourly.",
      icon: Clock,
      color: brandConfig.colorPalette.primary.main
    },
    {
      question: "Can multiple team members access the account?",
      answer: "Yes, Reputraq supports team collaboration with role-based access control. You can invite team members, assign different permission levels, and track who viewed what reports.",
      icon: Users,
      color: brandConfig.colorPalette.secondary.main
    },
    {
      question: "What types of alerts can I set up?",
      answer: "You can configure alerts for brand mentions, sentiment changes, keyword triggers, competitor mentions, and custom events. Choose between email, SMS, or in-app notifications.",
      icon: Bell,
      color: brandConfig.colorPalette.primary.main
    },
    {
      question: "How fast are notifications delivered?",
      answer: "Real-time alerts are delivered within seconds of detection. Email digests can be scheduled for daily, weekly, or monthly delivery at your preferred time.",
      icon: Zap,
      color: brandConfig.colorPalette.secondary.main
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), Diners Club, UPI, and PayPal. All payments are processed securely through our encrypted payment gateway.",
      icon: CreditCard,
      color: brandConfig.colorPalette.colors.charcoalCore.hex
    },
    {
      question: "Can I customize the dashboard?",
      answer: "Yes, you can customize your dashboard with widgets, charts, and metrics that matter most to your business. Save multiple dashboard views for different team members or use cases.",
      icon: BarChart3,
      color: brandConfig.colorPalette.primary.main
    }
  ];

  return (
    <section id="faq" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 
            className="text-6xl md:text-7xl font-bold mb-8"
            style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
          >
            FAQ
          </h2>
          <p 
            className="text-2xl max-w-2xl mx-auto leading-relaxed font-light"
            style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
          >
            Everything you need to know about Reputraq
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group"
            >
              <div
                className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => toggleItem(index)}
              >
                {/* Question Row */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Icon */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: faq.color + '10',
                        }}
                      >
                        <faq.icon 
                          className="w-5 h-5" 
                          style={{ color: faq.color }}
                        />
                      </div>
                      
                      {/* Question */}
                      <h3 
                        className="text-lg font-semibold flex-1"
                        style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
                      >
                        {faq.question}
                      </h3>
                    </div>
                    
                    {/* Toggle Icon */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center ml-4 transition-colors duration-200"
                      style={{ 
                        backgroundColor: openItems.has(index) ? faq.color : 'transparent',
                        color: openItems.has(index) ? 'white' : faq.color
                      }}
                    >
                      {openItems.has(index) ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Answer */}
                {openItems.has(index) && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      <p 
                        className="text-base leading-relaxed"
                        style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-gray-200 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <MessageSquare 
                className="w-6 h-6 mr-3" 
                style={{ color: brandConfig.colorPalette.primary.main }}
              />
              <h3 
                className="text-2xl font-bold"
                style={{ color: brandConfig.colorPalette.colors.charcoalCore.hex }}
              >
                Still have questions?
              </h3>
            </div>
            
            <p 
              className="text-base mb-6"
              style={{ color: brandConfig.colorPalette.colors.oceanDepth.hex }}
            >
              Our team is here to help you get the most out of Reputraq
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                className="px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 hover:scale-105 flex items-center justify-center"
                style={{
                  backgroundColor: brandConfig.colorPalette.primary.main,
                  color: 'white',
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              
              <button 
                className="px-6 py-3 rounded-lg font-semibold text-base border transition-all duration-200 hover:scale-105 flex items-center justify-center"
                style={{
                  borderColor: brandConfig.colorPalette.secondary.main,
                  color: brandConfig.colorPalette.secondary.main,
                  backgroundColor: 'transparent'
                }}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
