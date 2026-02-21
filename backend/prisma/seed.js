import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    // 1. Components
    const components = [
        {
            id: "navbar",
            name: "Navigation Bar",
            category: "layout",
            thumbnailUrl: "https://f005.backblazeb2.com/file/sitepilot-assets/placeholders/navbar-thumb.png",
            requiredPlan: "starter",
            propsSchema: {
                logoUrl: { type: "image", label: "Logo URL" },
                links: {
                    type: "array",
                    label: "Navigation Links",
                    items: {
                        type: "object",
                        properties: {
                            label: { type: "string" },
                            href: { type: "string" },
                        },
                    },
                },
            },
            defaultProps: {
                logoUrl: null,
                links: [
                    { label: "Home", href: "#" },
                    { label: "About", href: "#about" },
                    { label: "Contact", href: "#contact" },
                ],
            },
        },
        {
            id: "hero_with_cta",
            name: "Hero with CTA",
            category: "hero",
            thumbnailUrl: "https://f005.backblazeb2.com/file/sitepilot-assets/placeholders/hero-thumb.png",
            requiredPlan: "starter",
            propsSchema: {
                heading: { type: "string", label: "Heading" },
                subheading: { type: "string", label: "Subheading" },
                buttonLabel: { type: "string", label: "Button Label" },
                buttonLink: { type: "string", label: "Button Link" },
                backgroundImage: { type: "image", label: "Background Image" },
            },
            defaultProps: {
                heading: "Welcome to our platform",
                subheading: "The best way to build your website",
                buttonLabel: "Get Started",
                buttonLink: "#",
                backgroundImage: null,
            },
        },
        {
            id: "footer",
            name: "Standard Footer",
            category: "layout",
            thumbnailUrl: "https://f005.backblazeb2.com/file/sitepilot-assets/placeholders/footer-thumb.png",
            requiredPlan: "starter",
            propsSchema: {
                companyName: { type: "string", label: "Company Name" },
                tagline: { type: "string", label: "Tagline" },
                copyrightYear: { type: "number", label: "Copyright Year" },
            },
            defaultProps: {
                companyName: "Acme Corp",
                tagline: "Building the future together",
                copyrightYear: 2025,
            },
        },
    ];

    for (const comp of components) {
        await prisma.component.upsert({
            where: { id: comp.id },
            update: comp,
            create: comp,
        });
    }
    console.log("Components seeded.");

    // 2. Templates
    const templates = [
        {
            id: "tmpl_business",
            name: "Modern Business",
            category: "business",
            thumbnailUrl: "https://f005.backblazeb2.com/file/sitepilot-assets/placeholders/tmpl-business-thumb.png",
            previewUrl: "https://f005.backblazeb2.com/file/sitepilot-assets/placeholders/demo-business/index.html",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 1,
        },
        {
            id: "tmpl_restaurant",
            name: "Classic Restaurant",
            category: "restaurant",
            thumbnailUrl: "https://f005.backblazeb2.com/file/sitepilot-assets/placeholders/tmpl-restaurant-thumb.png",
            previewUrl: "https://f005.backblazeb2.com/file/sitepilot-assets/placeholders/demo-restaurant/index.html",
            requiredPlan: "starter",
            isActive: true,
            sortOrder: 2,
        },
    ];

    for (const tmpl of templates) {
        await prisma.template.upsert({
            where: { id: tmpl.id },
            update: tmpl,
            create: tmpl,
        });
    }
    console.log("Templates seeded.");

    // 3. Template Components (The structure of tmpl_business)
    const tmplBusinessComps = [
        {
            templateId: "tmpl_business",
            componentId: "navbar",
            pageSlug: "home",
            pageTitle: "Home",
            pageNavOrder: 1,
            orderIndex: 1,
            defaultProps: {},
        },
        {
            templateId: "tmpl_business",
            componentId: "hero_with_cta",
            pageSlug: "home",
            pageTitle: "Home",
            pageNavOrder: 1,
            orderIndex: 2,
            defaultProps: {
                heading: "Professional Business Solutions",
                subheading: "Growing your enterprise with modern tech.",
            },
        },
        {
            templateId: "tmpl_business",
            componentId: "footer",
            pageSlug: "home",
            pageTitle: "Home",
            pageNavOrder: 1,
            orderIndex: 3,
            defaultProps: {},
        },
    ];

    // Clean up existing template components to avoid duplicates during dev seeding
    await prisma.templateComponent.deleteMany({
        where: { templateId: { in: ["tmpl_business", "tmpl_restaurant"] } },
    });

    for (const tc of tmplBusinessComps) {
        await prisma.templateComponent.create({
            data: tc,
        });
    }

    console.log("Template Components seeded.");
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
