import prisma from "../utils/prisma.js";
import PLAN_LIMITS from "../utils/planLimits.js";
import slugify from "../utils/slugify.js";

// ─────────────────────────────────────────────────────────────────────────────
// Hardcoded defaults — mirrors frontend data/componentTypes.ts
// No DB lookup needed; these are string-based, not DB Component rows.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_LAYOUTS = {
    navbar: { linksAlign: "right", background: "solid", sticky: true },
    hero: { style: "centered", height: "fullscreen", overlay: "dark-60" },
    feature_grid: { columns: 3, cardStyle: "bordered", alignment: "center" },
    gallery: { grid: "3x2", aspect: "square" },
    text_block: { alignment: "left", width: "contained" },
    testimonials: { style: "cards", columns: 3 },
    contact: { style: "form-left", width: "contained" },
    footer: { columns: 3 },
};

function buildDefaultProps(componentId, branding = {}) {
    const base = {
        navbar: { logo: branding.businessName || "", links: ["Home", "About", "Contact"], ctaText: "Get Started" },
        hero: { heading: branding.businessName || "Welcome", subheading: branding.tagline || "Your tagline here", buttonText: "Learn More", bgImage: branding.heroImageUrl || "" },
        feature_grid: { heading: "Why Choose Us", items: [{ icon: "star", title: "Quality", text: "We deliver the best" }, { icon: "clock", title: "Fast", text: "Quick turnaround" }, { icon: "heart", title: "Trusted", text: "Loved by customers" }] },
        gallery: { heading: "Our Work", images: [] },
        text_block: { heading: "About Us", content: "Tell your story here..." },
        testimonials: { heading: "What People Say", items: [{ name: "Jane Doe", role: "CEO", text: "Amazing experience!" }, { name: "John Smith", role: "CTO", text: "Highly recommended." }] },
        contact: { heading: "Get In Touch", fields: ["name", "email", "message"], buttonText: "Send Message" },
        footer: { logo: branding.businessName || "", links: ["Home", "About", "Contact", "Privacy"], copyright: `© 2026 ${branding.businessName || "Your Company"}` },
    };
    return base[componentId] || {};
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/projects/:id/rename
// ─────────────────────────────────────────────────────────────────────────────
const renameProject = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        if (!name) {
            return res.status(400).json({ success: false, message: "name is required" });
        }

        const project = await prisma.project.updateMany({
            where: { id, tenantId: req.user.tenantId },
            data: { name },
        });

        if (project.count === 0) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        return res.status(200).json({ success: true, id, name });
    } catch (error) {
        console.error("Rename project error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/projects/create
//
// Body:
//   templateId      string   (optional — just stored for reference)
//   name            string
//   branding        object   { primaryColor, secondaryColor, accentColor, bgColor,
//                              headingFont, bodyFont, logoUrl, heroImageUrl,
//                              businessName, tagline, description, businessType }
//   userPrompt      string   (optional — user's free-text vision)
//   suggestedLayout string[] (e.g. ["navbar","hero","gallery","contact","footer"])
// ─────────────────────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
    try {
        const { templateId, name, branding, userPrompt, suggestedLayout } = req.body;

        if (!name || !branding) {
            return res.status(400).json({
                success: false,
                message: "name and branding are required",
            });
        }

        const components = Array.isArray(suggestedLayout) && suggestedLayout.length > 0
            ? suggestedLayout
            : ["navbar", "hero", "contact", "footer"]; // sensible default

        // 1. Check project limit
        const [projectCount, tenant] = await Promise.all([
            prisma.project.count({ where: { tenantId: req.user.tenantId } }),
            prisma.tenant.findUnique({ where: { id: req.user.tenantId } }),
        ]);

        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const limit = PLAN_LIMITS[tenant.plan].maxProjects;
        if (projectCount >= limit) {
            return res.status(403).json({ success: false, message: "Project limit reached" });
        }

        // 2. Generate unique slug
        let projectSlug = slugify(name);
        const existingProject = await prisma.project.findFirst({
            where: { tenantId: req.user.tenantId, slug: projectSlug },
        });
        if (existingProject) {
            projectSlug = `${projectSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        // 3. Transaction — create project, branding, member, page, components, v1
        const project = await prisma.$transaction(async (tx) => {

            // Project
            const proj = await tx.project.create({
                data: {
                    tenantId: req.user.tenantId,
                    templateId: templateId || null,
                    name,
                    slug: projectSlug,
                    status: "draft",
                    userPrompt: userPrompt || null,
                },
            });

            // Branding
            await tx.projectBranding.create({
                data: {
                    projectId: proj.id,
                    primaryColor: branding.primaryColor || "#1a1a2e",
                    secondaryColor: branding.secondaryColor || "#e94560",
                    accentColor: branding.accentColor || "#f5a623",
                    bgColor: branding.bgColor || "#ffffff",
                    headingFont: branding.headingFont || branding.font || "Inter",
                    bodyFont: branding.bodyFont || branding.font || "Inter",
                    logoUrl: branding.logoUrl || null,
                    heroImageUrl: branding.heroImageUrl || null,
                    businessName: branding.businessName || null,
                    tagline: branding.tagline || null,
                    description: branding.description || null,
                    businessType: branding.businessType || null,
                },
            });

            // Owner membership
            await tx.projectMember.create({
                data: {
                    projectId: proj.id,
                    userId: req.user.id,
                    role: "owner",
                },
            });

            // Home page + one PageComponent per suggested component
            const page = await tx.page.create({
                data: {
                    projectId: proj.id,
                    title: "Home",
                    slug: "home",
                    navOrder: 0,
                },
            });

            for (let i = 0; i < components.length; i++) {
                const compId = components[i];
                await tx.pageComponent.create({
                    data: {
                        pageId: page.id,
                        projectId: proj.id,
                        componentId: compId,
                        orderIndex: i,
                        props: buildDefaultProps(compId, branding),
                        layout: DEFAULT_LAYOUTS[compId] || {},
                        generatedHtml: null,
                        spacing: "medium",
                    },
                });
            }

            // Save v1 snapshot
            const snapshot = await tx.page.findMany({
                where: { projectId: proj.id },
                include: { components: { orderBy: { orderIndex: "asc" } } },
            });

            await tx.version.create({
                data: {
                    projectId: proj.id,
                    label: "v1 - Initial",
                    snapshot,
                    createdById: req.user.id,
                },
            });

            return proj;
        });

        return res.status(201).json({ success: true, projectId: project.id });
    } catch (error) {
        console.error("Create project error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { renameProject, createProject };
