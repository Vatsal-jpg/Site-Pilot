import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    // Templates — now prompt-based, no TemplateComponent rows needed.
    const templates = [
        {
            id: "tmpl-modern-restaurant",
            name: "Modern Restaurant",
            category: "local",
            thumbnailUrl: "",
            previewUrl: "",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 1,
            systemPrompt: "Luxury restaurant website with dark hero, warm gold accents, gallery section, menu highlights and booking CTA",
            suggestedComponents: ["navbar", "hero", "gallery", "testimonials", "contact", "footer"],
        },
        {
            id: "tmpl-business",
            name: "Modern Business",
            category: "business",
            thumbnailUrl: "",
            previewUrl: "",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 2,
            systemPrompt: "Clean professional business website, feature grid, testimonials, contact form",
            suggestedComponents: ["navbar", "hero", "feature_grid", "testimonials", "contact", "footer"],
        },
        {
            id: "tmpl-portfolio",
            name: "Creative Portfolio",
            category: "creative",
            thumbnailUrl: "",
            previewUrl: "",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 3,
            systemPrompt: "Minimal, bold creative portfolio with large imagery, project showcase grid, about section and contact",
            suggestedComponents: ["navbar", "hero", "gallery", "text_block", "contact", "footer"],
        },
        {
            id: "tmpl-saas-landing",
            name: "SaaS Landing Page",
            category: "business",
            thumbnailUrl: "",
            previewUrl: "",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 4,
            systemPrompt: "Modern SaaS product landing page with gradient hero, feature grid with icons, pricing section, testimonials and CTA",
            suggestedComponents: ["navbar", "hero", "feature_grid", "testimonials", "contact", "footer"],
        },
        {
            id: "tmpl-blog",
            name: "Blog Platform",
            category: "content",
            thumbnailUrl: "",
            previewUrl: "",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 5,
            systemPrompt: "Clean, readable blog layout with featured post hero, article grid, sidebar categories and newsletter signup",
            suggestedComponents: ["navbar", "hero", "text_block", "gallery", "contact", "footer"],
        },
        {
            id: "tmpl-blank",
            name: "Blank Canvas",
            category: "blank",
            thumbnailUrl: "",
            previewUrl: "",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 99,
            systemPrompt: "",
            suggestedComponents: [],
        },
    ];

    for (const tmpl of templates) {
        await prisma.template.upsert({
            where: { id: tmpl.id },
            update: tmpl,
            create: tmpl,
        });
    }

    console.log(`Templates seeded: ${templates.length} templates`);
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
