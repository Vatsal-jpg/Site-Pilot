import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import type { TemplateDefinition } from "@/data/templates";

const fonts = ["Inter", "Roboto", "Poppins", "Playfair Display", "Montserrat", "Lato"];

// ── Simulated layout suggestions (no API yet) ────────────────────────────────
const LAYOUT_SUGGESTIONS: Record<string, string[]> = {
  Restaurant: ["navbar", "hero", "gallery", "testimonials", "contact", "footer"],
  "Tech Startup": ["navbar", "hero", "feature_grid", "testimonials", "contact", "footer"],
  Portfolio: ["navbar", "hero", "gallery", "text_block", "contact", "footer"],
  "Law Firm": ["navbar", "hero", "feature_grid", "text_block", "contact", "footer"],
  Blog: ["navbar", "hero", "text_block", "gallery", "contact", "footer"],
  default: ["navbar", "hero", "feature_grid", "contact", "footer"],
};

const BrandingSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const template = (location.state as { template?: TemplateDefinition })?.template ?? null;

  const [brand, setBrand] = useState({
    businessName: "",
    tagline: "",
    primaryColor: "#090979",
    secondaryColor: "#F8FAFC",
    font: "Inter",
  });

  // ── New: user prompt field ─────────────────────────────────────────────────
  const [userPrompt, setUserPrompt] = useState("");

  // ── New: suggest layout ────────────────────────────────────────────────────
  const [suggestedLayout, setSuggestedLayout] = useState<string[]>(
    template?.suggestedComponents ?? []
  );
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  async function handleSuggestLayout() {
    setIsLoadingSuggestion(true);
    // LATER: POST /api/ai/suggest-layout { businessType, userPrompt }
    // FOR NOW: simulate with a timeout + lookup
    await new Promise((r) => setTimeout(r, 800));

    // Try to match business name to suggestions, fallback to template or default
    const nameLC = brand.businessName.toLowerCase();
    let matched: string[] | undefined;
    for (const key of Object.keys(LAYOUT_SUGGESTIONS)) {
      if (nameLC.includes(key.toLowerCase())) {
        matched = LAYOUT_SUGGESTIONS[key];
        break;
      }
    }
    setSuggestedLayout(matched ?? template?.suggestedComponents ?? LAYOUT_SUGGESTIONS.default);
    setIsLoadingSuggestion(false);
  }

  function handleCreateProject() {
    // No API yet — navigate with all state to the builder
    navigate("/builder/new", {
      state: {
        branding: brand,
        userPrompt,
        template,
        suggestedLayout,
      },
    });
  }

  return (
    <DashboardLayout>
      {/* Steps */}
      <div className="mb-8 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">
            1
          </span>
          Choose Template
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2 font-medium text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
            2
          </span>
          Branding
        </div>
      </div>

      {/* Template badge */}
      {template && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          Template:
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {template.name}
          </span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left — Form */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Business Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={brand.businessName}
                  onChange={(e) =>
                    setBrand({ ...brand, businessName: e.target.value })
                  }
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={brand.tagline}
                  onChange={(e) =>
                    setBrand({ ...brand, tagline: e.target.value })
                  }
                  placeholder="Building the future"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brand.primaryColor}
                      onChange={(e) =>
                        setBrand({ ...brand, primaryColor: e.target.value })
                      }
                      className="h-10 w-10 cursor-pointer rounded border-0"
                    />
                    <Input
                      value={brand.primaryColor}
                      onChange={(e) =>
                        setBrand({ ...brand, primaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brand.secondaryColor}
                      onChange={(e) =>
                        setBrand({ ...brand, secondaryColor: e.target.value })
                      }
                      className="h-10 w-10 cursor-pointer rounded border-0"
                    />
                    <Input
                      value={brand.secondaryColor}
                      onChange={(e) =>
                        setBrand({ ...brand, secondaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Typography</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Font Family</Label>
              <select
                value={brand.font}
                onChange={(e) => setBrand({ ...brand, font: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {fonts.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Drag & drop your logo and images here
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── New section: Your Vision ─────────────────────────────────── */}
          <Card className="rounded-xl shadow-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe what you want your website to feel like, who your customers are, what makes you special..."
                rows={4}
                className="resize-none"
              />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleSuggestLayout}
                disabled={isLoadingSuggestion}
              >
                {isLoadingSuggestion ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoadingSuggestion
                  ? "Suggesting..."
                  : "Suggest Layout for Me"}
              </Button>

              {/* Show suggested layout chips */}
              {suggestedLayout.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Suggested Layout:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedLayout.map((comp, i) => (
                      <span
                        key={`${comp}-${i}`}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <div className="p-4" style={{ backgroundColor: brand.secondaryColor }}>
              <div
                className="rounded-lg bg-card p-6"
                style={{ fontFamily: brand.font }}
              >
                <div className="mb-6 flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                  <span className="font-bold text-foreground">
                    {brand.businessName || "Your Business"}
                  </span>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  {brand.tagline || "Your tagline here"}
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Preview of your website branding and styles.
                </p>
                <Button
                  style={{
                    backgroundColor: brand.primaryColor,
                    color: "#fff",
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </Card>

          {/* Layout preview */}
          {suggestedLayout.length > 0 && (
            <Card className="rounded-xl shadow-sm mt-4">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Page Structure Preview
                </p>
                <div className="space-y-1">
                  {suggestedLayout.map((comp, i) => {
                    const heights: Record<string, string> = {
                      navbar: "h-3",
                      hero: "h-10",
                      feature_grid: "h-8",
                      gallery: "h-7",
                      text_block: "h-5",
                      testimonials: "h-6",
                      contact: "h-8",
                      footer: "h-3",
                    };
                    return (
                      <div
                        key={`${comp}-${i}`}
                        className={`${heights[comp] ?? "h-5"} rounded bg-muted flex items-center justify-center`}
                      >
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          {comp.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() =>
            navigate("/projects/new", { state: { template } })
          }
        >
          Back
        </Button>
        <Button onClick={handleCreateProject}>Create Project</Button>
      </div>
    </DashboardLayout>
  );
};

export default BrandingSetup;
