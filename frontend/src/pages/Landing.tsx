import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

const Landing = () => {
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

    // ✅ FIXED FEATURES
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
          once: true, // IMPORTANT
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
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <span className="text-lg font-bold">SitePilot</span>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="py-24 lg:py-32">
        <div
          ref={heroRef}
          className="mx-auto max-w-7xl px-4 grid gap-12 lg:grid-cols-2 items-center"
        >
          {/* TEXT */}
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-[1.05]
               sm:text-5xl lg:text-6xl">
              Build your website <br />
              <span className="text-primary font-extrabold">with AI in minutes</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              SitePilot helps teams design, launch, and scale websites
              without designers or developers.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">See Features</a>
              </Button>
            </div>
          </div>

          {/* IMAGES */}
          <div className="relative">
            <img
              src="/img1.png"
              className="rounded-xl shadow-xl"
            />
            <img
              src="/img2.png"
              className="float absolute -top-10 -left-10 w-48 rounded-lg shadow-lg"
            />
            <img
              src="/img3.png"
              className="float absolute -bottom-10 -right-10 w-48 rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featureRef} className="py-28 bg-[#fafafa]">
  <div className="mx-auto max-w-7xl px-4">
    
    {/* Heading */}
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-semibold tracking-tight">
        Built for scale, simplicity, and speed
      </h2>
      <p className="mt-3 text-sm text-slate-500">
        Everything you need to build, manage, and scale websites across organizations.
      </p>
    </div>

    {/* Feature Cards */}
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <Card
          key={f.title}
          className="feature-card relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition hover:-translate-y-1"
        >
          {/* Accent bar */}
          <div className="absolute left-0 top-0 h-full w-1 bg-primary/70" />

          <CardHeader className="flex flex-col items-center text-center px-8 pt-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center
                rounded-full bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">
              {f.title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              {f.desc}
            </CardDescription>
          </CardHeader>

          <CardContent className="pl-6 pt-0">
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {f.points.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-primary" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>

      {/* PRICING */}
      <section
        id="pricing"
        ref={pricingRef}
        className="py-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Start free. Upgrade when you grow.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`pricing-card rounded-xl border bg-white shadow-sm ${
                  plan.highlighted ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Check className="h-4 w-4 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 flex justify-between text-sm text-slate-500">
          <span>© 2026 SitePilot</span>
          <div className="flex gap-6">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;