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
    icon: Zap,
    title: "AI-Powered",
    desc: "Generate layouts, copy, and images with AI. Just describe your idea.",
  },
  {
    icon: Building2,
    title: "Multi-Tenant",
    desc: "Manage multiple websites for your organization from one dashboard.",
  },
  {
    icon: Globe,
    title: "Instant Publishing",
    desc: "Go live instantly with SSL, domains, and hosting included.",
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
    // HERO ANIMATION
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

    // FEATURES SCROLL
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: featureRef.current,
        start: "top 80%",
      },
      opacity: 0,
      y: 40,
      stagger: 0.2,
      duration: 0.8,
      ease: "power2.out",
    });

    // PRICING SCROLL
    gsap.from(".pricing-card", {
      scrollTrigger: {
        trigger: pricingRef.current,
        start: "top 80%",
      },
      opacity: 0,
      scale: 0.95,
      stagger: 0.2,
      duration: 0.8,
      ease: "power2.out",
    });
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
      <section
        id="features"
        ref={featureRef}
        className="py-24 bg-[#fafafa]"
      >
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            Everything you need to build fast
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Powerful tools designed for modern teams.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="feature-card rounded-xl bg-white border shadow-sm"
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold tracking-tight">
  {f.title}
</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
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