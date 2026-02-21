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
// gsap.registerPlugin(ScrambleTextPlugin) 

const features = [
  {
    icon: Zap,
    title: "AI-Powered",
    desc: "Let AI generate layouts, copy, and images. Just describe what you want.",
  },
  {
    icon: Building2,
    title: "Multi-Tenant",
    desc: "Manage multiple websites for your organization from one dashboard.",
  },
  {
    icon: Globe,
    title: "Publish Instantly",
    desc: "Go live in seconds with custom domains and SSL included.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    features: [
      "1 website",
      "3 pages per site",
      "500MB storage",
      "Basic templates",
      "50 AI credits/month",
      "No custom domain",
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
      "All templates",
      "500 AI credits/month",
      "Custom domain",
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
      "All templates",
      "Unlimited AI",
      "Custom domain + priority support",
    ],
    highlighted: false,
  },
];

const Landing = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 -z-20 h-full w-full object-cover"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div className="fixed inset-0 -z-10 bg-black/70 backdrop-blur-sm" />

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">SitePilot</span>
          </div>

          <div className="hidden items-center gap-8 md:flex text-gray-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#templates" className="hover:text-white">Templates</a>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="py-24 lg:py-36 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-2xl font-bold sm:text-5xl lg:text-6xl">
            Build your website with AI in minutes
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
            SitePilot gives your organization a complete website builder powered
            by AI. No code. No designers. Just results.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg"  asChild>
              <a href="#templates">View Templates</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold">
            Everything you need to build fast
          </h2>
          <p className="mt-4 text-center text-gray-300">
            Powerful features to get your website live in minutes.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white"
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                    <f.icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

      {/* PRICING */}
      <section id="pricing" className="py-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-center text-gray-300">
            Start free. Upgrade when you need more.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white ${
                  plan.highlighted
                    ? "border-blue-500 ring-1 ring-blue-500/40"
                    : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <Check className="h-4 w-4 text-blue-400" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-6 w-full"
                    // variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                SitePilot
              </span>
            </div>

            <div className="flex gap-6 text-sm">
              <a href="#features" className="hover:text-white">
                Features
              </a>
              <a href="#pricing" className="hover:text-white">
                Pricing
              </a>
              <a href="#templates" className="hover:text-white">
                Templates
              </a>
            </div>

            <p className="text-xs">
              © 2026 SitePilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;