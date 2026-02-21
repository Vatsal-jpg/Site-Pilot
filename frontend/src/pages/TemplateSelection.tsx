import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TEMPLATES, type TemplateDefinition } from "@/data/templates";
import { Plus, Eye, Check } from "lucide-react";

const categories = ["All", "Business", "Creative", "Content", "Local"];

const TemplateSelection = () => {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<TemplateDefinition | null>(null);
  const navigate = useNavigate();

  const filtered = TEMPLATES.filter(
    (t) => filter === "All" || t.category === filter.toLowerCase()
  );

  // Generate a deterministic gradient per template for the thumbnail placeholder
  const gradients: Record<string, string> = {
    "modern-restaurant": "from-amber-900 via-amber-800 to-yellow-700",
    business: "from-blue-900 via-blue-700 to-cyan-600",
    portfolio: "from-purple-900 via-fuchsia-800 to-pink-600",
    "saas-landing": "from-indigo-900 via-violet-700 to-purple-500",
    blog: "from-emerald-900 via-teal-700 to-green-500",
    blank: "from-gray-400 via-gray-300 to-gray-200",
  };

  return (
    <DashboardLayout>
      {/* Steps */}
      <div className="mb-8 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
            1
          </span>
          Choose Template
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">
            2
          </span>
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
          const isSelected = selected?.id === template.id;
          const gradient = gradients[template.id] || "from-gray-700 to-gray-500";

          return (
            <Card
              key={template.id}
              className={`relative rounded-xl shadow-sm overflow-hidden transition-all cursor-pointer ${isSelected ? "ring-2 ring-primary scale-[1.02]" : "hover:shadow-md"
                }`}
              onClick={() => setSelected(template)}
            >
              {/* Thumbnail area */}
              <div
                className={`aspect-video bg-gradient-to-br ${gradient} flex items-center justify-center relative`}
              >
                {template.category === "blank" ? (
                  <Plus className="h-10 w-10 text-white/60" />
                ) : (
                  <div className="text-center px-4">
                    <p className="text-white font-semibold text-lg drop-shadow-md">
                      {template.name}
                    </p>
                    <p className="text-white/70 text-xs mt-1 line-clamp-2">
                      {template.systemPrompt}
                    </p>
                  </div>
                )}

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-foreground">{template.name}</p>
                  {template.suggestedComponents.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {template.suggestedComponents.length} sections
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" disabled>
                    <Eye className="mr-1 h-3 w-3" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(template);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="mr-1 h-3 w-3" /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Continue */}
      <div className="mt-8 flex justify-end">
        <Button
          disabled={!selected}
          onClick={() =>
            navigate("/projects/new/branding", {
              state: { template: selected },
            })
          }
        >
          Continue to Branding
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default TemplateSelection;
