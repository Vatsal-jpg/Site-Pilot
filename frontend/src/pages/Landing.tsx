import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Zap, Globe, Building2, ArrowRight } from "lucide-react";

const features = [
  { icon: Zap, title: "AI-Powered", desc: "Let AI generate layouts, copy, and images. Just describe what you want." },
  { icon: Building2, title: "Multi-Tenant", desc: "Manage multiple websites for your organization from one dashboard." },
  { icon: Globe, title: "Publish Instantly", desc: "Go live in seconds with custom domains and SSL included." },
];

const templates = [
  "Startup Landing", "SaaS Homepage", "Portfolio", "Blog Platform", "E-Commerce", "Agency Site",
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    features: ["1 website", "3 pages per site", "500MB storage", "Basic templates", "50 AI credits/month", "No custom domain"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: ["5 websites", "Unlimited pages", "5GB storage", "All templates", "500 AI credits/month", "Custom domain"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99/mo",
    features: ["Unlimited websites", "Unlimited pages", "50GB storage", "All templates", "Unlimited AI", "Custom domain + priority support"],
    highlighted: false,
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>
            <span className="text-lg font-bold">SitePilot</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground">Templates</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
            <Button asChild><Link to="/signup">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Build your website with AI in minutes
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            SitePilot gives your organization a complete website builder powered by AI. No code. No designers. Just results.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild><Link to="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><a href="#templates">View Templates</a></Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">Everything you need to build fast</h2>
          <p className="mt-4 text-center text-muted-foreground">Powerful features to get your website live in minutes.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="rounded-xl shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">Start with a template</h2>
          <p className="mt-4 text-center text-muted-foreground">Choose from dozens of professionally designed templates.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <Card key={t} className="rounded-xl shadow-md overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">{t}</span>
                </div>
                <CardContent className="p-4">
                  <p className="font-medium text-foreground">{t}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild><Link to="/signup">Browse All Templates</Link></Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">Simple, transparent pricing</h2>
          <p className="mt-4 text-center text-muted-foreground">Start free. Upgrade when you need more.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={`rounded-xl shadow-md ${plan.highlighted ? "border-2 border-primary ring-1 ring-primary/20" : ""}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">{plan.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">S</div>
              <span className="text-sm font-semibold">SitePilot</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#pricing" className="hover:text-foreground">Pricing</a>
              <a href="#templates" className="hover:text-foreground">Templates</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 SitePilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
