// ── Template definitions ─────────────────────────────────────────────────────
// Hardcoded in the frontend. No API, no DB needed.

export interface TemplateDefinition {
    id: string;
    name: string;
    category: string;
    thumbnailUrl: string;
    previewUrl: string;
    systemPrompt: string;
    suggestedComponents: string[];
}

export const TEMPLATES: TemplateDefinition[] = [
    {
        id: "modern-restaurant",
        name: "Modern Restaurant",
        category: "local",
        thumbnailUrl: "",
        previewUrl: "",
        systemPrompt:
            "Luxury restaurant website with dark hero, warm gold accents, gallery section, menu highlights and booking CTA",
        suggestedComponents: [
            "navbar",
            "hero",
            "gallery",
            "testimonials",
            "contact",
            "footer",
        ],
    },
    {
        id: "business",
        name: "Modern Business",
        category: "business",
        thumbnailUrl: "",
        previewUrl: "",
        systemPrompt:
            "Clean professional business website, feature grid, testimonials, contact form",
        suggestedComponents: [
            "navbar",
            "hero",
            "feature_grid",
            "testimonials",
            "contact",
            "footer",
        ],
    },
    {
        id: "portfolio",
        name: "Creative Portfolio",
        category: "creative",
        thumbnailUrl: "",
        previewUrl: "",
        systemPrompt:
            "Minimal, bold creative portfolio with large imagery, project showcase grid, about section and contact",
        suggestedComponents: [
            "navbar",
            "hero",
            "gallery",
            "text_block",
            "contact",
            "footer",
        ],
    },
    {
        id: "saas-landing",
        name: "SaaS Landing Page",
        category: "business",
        thumbnailUrl: "",
        previewUrl: "",
        systemPrompt:
            "Modern SaaS product landing page with gradient hero, feature grid with icons, pricing section, testimonials and CTA",
        suggestedComponents: [
            "navbar",
            "hero",
            "feature_grid",
            "testimonials",
            "contact",
            "footer",
        ],
    },
    {
        id: "blog",
        name: "Blog Platform",
        category: "content",
        thumbnailUrl: "",
        previewUrl: "",
        systemPrompt:
            "Clean, readable blog layout with featured post hero, article grid, sidebar categories and newsletter signup",
        suggestedComponents: [
            "navbar",
            "hero",
            "text_block",
            "gallery",
            "contact",
            "footer",
        ],
    },
    {
        id: "blank",
        name: "Blank Canvas",
        category: "blank",
        thumbnailUrl: "",
        previewUrl: "",
        systemPrompt: "",
        suggestedComponents: [],
    },
];
