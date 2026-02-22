"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Check, Zap, Globe, Building2, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Building2,
    title: "Multi-Tenant Architecture",
    desc: "Securely manage multiple organizations on a single platform with strict data isolation.",
    points: [
      "Tenant-level isolation",
      "Multiple websites per organization",
      "Plan-based limits enforced automatically",
    ],
  },
  {
    icon: Zap,
    title: "AI-Powered Website Builder",
    desc: "Use AI to generate layouts, page structures, and starter content from simple prompts.",
    points: [
      "Business-type based generation",
      "Smart layout & navigation suggestions",
      "Accessibility-aware design assistance",
    ],
  },
  {
    icon: Globe,
    title: "Structured Site Creation",
    desc: "Build websites using reusable components with draft, preview, and publish workflows.",
    points: [
      "Page & navigation management",
      "Reusable sections & components",
      "Draft → live deployment flow",
    ],
  },
  {
    icon: Zap,
    title: "Branding & Asset Management",
    desc: "Define consistent branding across all websites with centralized asset management.",
    points: [
      "Colors, fonts, logos per tenant",
      "Central asset library",
      "Storage limits by plan",
    ],
  },
  {
    icon: Globe,
    title: "Domain & Deployment",
    desc: "Deploy sites instantly using default URLs or custom domains with controlled publishing.",
    points: [
      "Default hosted URLs",
      "Custom domain support",
      "Deployment history tracking",
    ],
  },
  {
    icon: Building2,
    title: "Role-Based Access Control",
    desc: "Control who can edit content, manage domains, or view billing using defined roles.",
    points: [
      "Owner, admin, editor roles",
      "Permission-based actions",
      "Secure authorization checks",
    ],
  },
  {
    icon: Zap,
    title: "Usage Monitoring & Insights",
    desc: "Track usage, performance, and limits through tenant-level dashboards.",
    points: [
      "Website & asset usage",
      "AI credit consumption",
      "Upgrade recommendations",
    ],
  },
  {
    icon: Building2,
    title: "Subscription & Billing",
    desc: "Flexible plans with automatic feature unlocking and usage enforcement.",
    points: [
      "Plan upgrades & downgrades",
      "Feature entitlements by plan",
      "Billing visibility & renewals",
    ],
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    features: [
      "1 website",
      "3 pages",
      "500MB storage",
      "50 AI credits",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: [
      "5 websites",
      "Unlimited pages",
      "5GB storage",
      "500 AI credits",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99/mo",
    features: [
      "Unlimited websites",
      "Unlimited pages",
      "50GB storage",
      "Unlimited AI",
    ],
    highlighted: false,
  },
];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // HERO
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "power3.out",
      });

      // FLOATING IMAGES
      gsap.to(".float", {
        y: -15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // FIXED FEATURES
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featureRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      // PRICING
      gsap.fromTo(
        ".pricing-card",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pricingRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white overflow-x-hidden selection:bg-indigo-500/30">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0d0d12]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SitePilot</span>
            <div className="flex ml-100 gap-10 text-sm text-gray-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div
          ref={heroRef}
          className="mx-auto max-w-7xl px-4 grid gap-16 lg:grid-cols-2 lg:items-center relative z-10"
        >
          {/* TEXT */}
          <div className="max-w-2xl">
            
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] sm:text-6xl lg:text-7xl mb-6">
              Build your website <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
                with AI in minutes
              </span>
            </h1>
            <p className="max-w-xl text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
              SitePilot helps teams design, launch, and scale production-ready websites
              without designers or developers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                Start building free <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="bg-white/5 text-white border border-white/10 px-8 py-4 rounded-full font-medium text-lg hover:bg-white/10 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                Explore features
              </a>
            </div>
          </div>

          {/* IMAGES */}
          <div className="relative mt-8 lg:mt-0 aspect-square lg:aspect-auto">
            {/* The primary showcase card mock */}
            <div className="relative z-20 bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl p-2 w-full max-w-lg mx-auto lg:ml-auto transform transition-transform hover:-translate-y-2 duration-500">
              <div className="flex items-center justify-end gap-1.5 px-3 py-2 mb-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="relative z-20 bg-[#1a1a24] border border-white/10 rounded-2xl shadow-2xl p-2 w-full max-w-lg mx-auto lg:ml-auto">
                <img
                  src="/img1.png"
                  alt="Builder Interface"
                  className="rounded-lg w-full h-auto"
                />
              </div>

              {/* Floating images */}
              {/* Floating images */}
<img
  src="/img2.png"
  className="float absolute -top-13 -left-16 w-40 rounded-xl shadow-xl"
/>

<img
  src="/img3.png"
  className="float absolute -bottom-28 -right-20 w-40 rounded-xl shadow-xl"
/>
            </div>

            {/* Floating accent elements */}
            

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featureRef} className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 relative z-10">

          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Built for scale, <br className="hidden sm:block" />
              <span className="text-gray-400">simplicity, and speed</span>
            </h2>
            <p className="text-lg text-gray-400">
              Everything you need to build, manage, and scale websites across organizations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card group relative p-8 rounded-2xl bg-[#1a1a24] border border-white/10 hover:border-indigo-500/50 transition-all duration-300"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {f.desc}
                  </p>

                  <ul className="space-y-3">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className="mt-0.5 h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" ref={pricingRef} className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-400">
              Start free. Upgrade when you grow.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card relative flex flex-col p-8 rounded-3xl bg-[#1a1a24] border ${plan.highlighted
                    ? "border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-10"
                    : "border-white/10"
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-gray-300">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-indigo-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`w-full py-3 px-4 rounded-xl font-medium text-center transition-all ${plan.highlighted
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 mt-12">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          

          
        </div>

        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5 text-sm text-gray-500">
          <span>© 2026 SitePilot Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
