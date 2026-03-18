"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { brandConfig } from "@/lib/brand-config";
import { 
  Mail, 
  Phone, 
  Twitter, 
  Linkedin, 
  Github,
  ArrowRight,
  Globe,
  Shield,
  Zap,
  Languages,
  DollarSign,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  DinersClubLogo,
  UpiLogo,
  PayPalLogo
} from "@/components/payment-logos";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  console.log("Footer component loaded");

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "ru", name: "Русский", flag: "🇷🇺" }
  ];

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" }
  ];

  const paymentMethods = [
    { name: "Visa", component: VisaLogo, color: "#1434CB" },
    { name: "Mastercard", component: MastercardLogo, color: "#EB001B" },
    { name: "American Express", component: AmexLogo, color: "#006FCF" },
    { name: "Diners Club", component: DinersClubLogo, color: "#0079BA" },
    { name: "UPI", component: UpiLogo, color: "#6FCF97" },
    { name: "PayPal", component: PayPalLogo, color: "#003087" }
  ];

  const languageRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const footerLinks = {
    product: [
      { label: "Features", href: "/features" },
      { label: "How it Works", href: "/how-it-works" },
      { label: "Use Cases", href: "/use-cases" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/api" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
    resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
      { label: "Security", href: "/security" },
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
    { icon: Github, href: "#github", label: "GitHub" },
  ];

  const features = [
    { icon: Globe, text: "Global Coverage" },
    { icon: Zap, text: "Real-time Alerts" },
    { icon: Shield, text: "Enterprise Security" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="mb-8">
                <Link href="/" className="flex items-center mb-6">
                  <Image
                    src="/reputraq-logo.svg"
                    alt="Reputraq Logo"
                    width={480}
                    height={120}
                    className="h-8 sm:h-9 md:h-10 w-auto object-contain"
                    priority
                  />
                </Link>
                
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  Uncover every story that shapes your reputation. Get real-time insights from global news, social media, and online conversations.
                </p>

                <Badge 
                  variant="outline" 
                  className="mb-6 px-4 py-2 text-sm font-medium border-2"
                  style={{
                    borderColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                    color: brandConfig.colorPalette.colors.vibrantSky.hex,
                    backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex + '10'
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Enterprise Ready
                </Badge>
              </div>

              {/* Quick Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex + '20' }}
                    >
                      <feature.icon 
                        className="w-4 h-4" 
                        style={{ color: brandConfig.colorPalette.colors.vibrantSky.hex }}
                      />
                    </div>
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-8">
              <div className="grid md:grid-cols-4 gap-8">
                {/* Product Links */}
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: brandConfig.colorPalette.colors.pureWhite.hex }}>
                    Product
                  </h3>
                  <ul className="space-y-4">
                    {footerLinks.product.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 hover:scale-105 transform inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company Links */}
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: brandConfig.colorPalette.colors.pureWhite.hex }}>
                    Company
                  </h3>
                  <ul className="space-y-4">
                    {footerLinks.company.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 hover:scale-105 transform inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources Links */}
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: brandConfig.colorPalette.colors.pureWhite.hex }}>
                    Resources
                  </h3>
                  <ul className="space-y-4">
                    {footerLinks.resources.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 hover:scale-105 transform inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal Links */}
                <div>
                  <h3 className="text-lg font-semibold mb-6" style={{ color: brandConfig.colorPalette.colors.pureWhite.hex }}>
                    Legal
                  </h3>
                  <ul className="space-y-4">
                    {footerLinks.legal.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-sm text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 hover:scale-105 transform inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 pt-8 border-t border-gray-700">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4" style={{ color: brandConfig.colorPalette.colors.pureWhite.hex }}>
                Stay Updated
              </h3>
              <p className="text-gray-300 mb-8">
                Get the latest insights on reputation management and industry trends delivered to your inbox.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  className="px-6 py-3 font-medium hover-elegant"
                  style={{
                    backgroundColor: brandConfig.colorPalette.colors.vibrantSky.hex,
                    color: brandConfig.colorPalette.colors.pureWhite.hex
                  }}
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Language & Currency Section */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Language & Currency Selectors */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Language Selector */}
                <div className="relative" ref={languageRef}>
                  <button
                    onClick={() => {
                      setIsLanguageOpen(!isLanguageOpen);
                      setIsCurrencyOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
                  >
                    <Languages className="w-4 h-4" />
                    <span className="text-sm">{selectedLanguage}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isLanguageOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.name);
                            setIsLanguageOpen(false);
                            console.log(`Language changed to: ${lang.name}`);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Currency Selector */}
                <div className="relative" ref={currencyRef}>
                  <button
                    onClick={() => {
                      setIsCurrencyOpen(!isCurrencyOpen);
                      setIsLanguageOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{selectedCurrency}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCurrencyOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedCurrency(currency.code);
                            setIsCurrencyOpen(false);
                            console.log(`Currency changed to: ${currency.code}`);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{currency.symbol}</span>
                            <span>{currency.code}</span>
                          </div>
                          <span className="text-xs text-gray-500">{currency.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col items-center lg:items-end gap-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Accepted Payment Methods</span>
                <div className="flex flex-wrap items-center gap-2">
                  {paymentMethods.map((method, index) => {
                    const LogoComponent = method.component;
                    return (
                      <div
                        key={index}
                        className="px-2 py-1.5 rounded bg-white flex items-center justify-center hover:shadow-md transition-all"
                        title={method.name}
                      >
                        <LogoComponent 
                          width={method.name === "UPI" ? 45 : method.name === "PayPal" ? 55 : 50} 
                          height={method.name === "UPI" ? 28 : method.name === "PayPal" ? 32 : 30} 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="text-sm text-gray-400">
                © {currentYear} {brandConfig.brand.name}. All rights reserved.
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Contact Info */}
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@reputraq.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
