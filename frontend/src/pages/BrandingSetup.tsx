import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

const fonts = ["Inter", "Roboto", "Poppins", "Playfair Display", "Montserrat", "Lato"];

const BrandingSetup = () => {
  const navigate = useNavigate();
  const [brand, setBrand] = useState({
    businessName: "",
    tagline: "",
    primaryColor: "#090979",
    secondaryColor: "#F8FAFC",
    font: "Inter",
  });

  return (
    <DashboardLayout>
      {/* Steps */}
      <div className="mb-8 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">1</span>
          Choose Template
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2 font-medium text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
          Branding
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left — Form */}
        <div className="space-y-6">
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg">Business Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={brand.businessName} onChange={(e) => setBrand({ ...brand, businessName: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} placeholder="Building the future" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg">Colors</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand.primaryColor} onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })} className="h-10 w-10 cursor-pointer rounded border-0" />
                    <Input value={brand.primaryColor} onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand.secondaryColor} onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })} className="h-10 w-10 cursor-pointer rounded border-0" />
                    <Input value={brand.secondaryColor} onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })} className="flex-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg">Typography</CardTitle></CardHeader>
            <CardContent>
              <Label>Font Family</Label>
              <select
                value={brand.font}
                onChange={(e) => setBrand({ ...brand, font: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {fonts.map((f) => <option key={f}>{f}</option>)}
              </select>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg">Assets</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">Drag & drop your logo and images here</p>
                <Button variant="outline" size="sm" className="mt-3">Browse Files</Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            Suggest Theme with AI
          </Button>
        </div>

        {/* Right — Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <div className="p-4" style={{ backgroundColor: brand.secondaryColor }}>
              <div className="rounded-lg bg-card p-6" style={{ fontFamily: brand.font }}>
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-8 w-8 rounded" style={{ backgroundColor: brand.primaryColor }} />
                  <span className="font-bold text-foreground">{brand.businessName || "Your Business"}</span>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">{brand.tagline || "Your tagline here"}</h2>
                <p className="mb-6 text-sm text-muted-foreground">Preview of your website branding and styles.</p>
                <Button style={{ backgroundColor: brand.primaryColor, color: "#fff" }}>
                  Get Started
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/projects/new")}>Back</Button>
        <Button onClick={() => navigate("/builder/new")}>Create Project</Button>
      </div>
    </DashboardLayout>
  );
};

export default BrandingSetup;
