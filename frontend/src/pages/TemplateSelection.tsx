import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockTemplates } from "@/data/mockData";
import { Lock, Plus, Eye } from "lucide-react";

const categories = ["All", "Business", "Creative", "Content", "Local"];

const TemplateSelection = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const planOrder = { starter: 0, pro: 1, enterprise: 2 };
  const userPlanLevel = planOrder[user?.plan || "starter"];

  const filtered = mockTemplates.filter(
    (t) => filter === "All" || t.category === filter.toLowerCase()
  );

  return (
    <DashboardLayout>
      {/* Steps */}
      <div className="mb-8 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
          Choose Template
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">2</span>
          Branding
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={filter === cat ? "default" : "outline"}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Templates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => {
          const locked = planOrder[template.requiredPlan] > userPlanLevel;
          const isSelected = selected === template.id;

          return (
            <Card
              key={template.id}
              className={`relative rounded-xl shadow-sm overflow-hidden transition-colors ${
                isSelected ? "ring-2 ring-primary" : ""
              } ${locked ? "opacity-60" : ""}`}
            >
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {template.category === "blank" ? (
                  <Plus className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <span className="text-sm text-muted-foreground">{template.name}</span>
                )}
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-foreground">{template.name}</p>
                  {template.requiredPlan !== "starter" && (
                    <Badge variant="secondary" className="text-xs uppercase">{template.requiredPlan}</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" disabled={locked}>
                    <Eye className="mr-1 h-3 w-3" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={locked}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelected(template.id)}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Continue */}
      <div className="mt-8 flex justify-end">
        <Button disabled={!selected} onClick={() => navigate("/projects/new/branding")}>
          Continue to Branding
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default TemplateSelection;
