import prisma from "../utils/prisma.js";
import PLAN_LIMITS from "../utils/planLimits.js";
import slugify from "../utils/slugify.js";

// ─────────────────────────────────────────
// Helper: group array by key
// ─────────────────────────────────────────
const groupBy = (arr, key) => {
    return arr.reduce((acc, item) => {
        const group = item[key];
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});
};

// ─────────────────────────────────────────
// PATCH /api/projects/:id/rename
// ─────────────────────────────────────────
const renameProject = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        if (!name) {
            return res.status(400).json({ success: false, message: "name is required" });
        }

        const project = await prisma.project.updateMany({
            where: {
                id,
                tenantId: req.user.tenantId, // tenant isolation
            },
            data: { name },
        });

        if (project.count === 0) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        return res.status(200).json({
            success: true,
            id,
            name,
        });
    } catch (error) {
        console.error("Rename project error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// POST /api/projects/create
// ─────────────────────────────────────────
const createProject = async (req, res) => {
    try {
        const { templateId, name, branding } = req.body;

        if (!templateId || !name || !branding) {
            return res.status(400).json({
                success: false,
                message: "templateId, name, and branding are required",
            });
        }

        // 1. Check project limit
        const [projectCount, tenant] = await Promise.all([
            prisma.project.count({
                where: { tenantId: req.user.tenantId },
            }),
            prisma.tenant.findUnique({
                where: { id: req.user.tenantId },
            }),
        ]);

        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const limit = PLAN_LIMITS[tenant.plan].maxProjects;
        if (projectCount >= limit) {
            return res.status(403).json({ success: false, message: "Project limit reached" });
        }

        // 2. Read template structure
        const templateComponents = await prisma.templateComponent.findMany({
            where: { templateId },
            include: { component: true },
            orderBy: [{ pageNavOrder: "asc" }, { orderIndex: "asc" }],
        });

        if (templateComponents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Template not found or has no components",
            });
        }

        // 3. Generate slug
        let projectSlug = slugify(name);
        const existingProject = await prisma.project.findFirst({
            where: { tenantId: req.user.tenantId, slug: projectSlug },
        });
        if (existingProject) {
            const suffix = Math.random().toString(36).substring(2, 6);
            projectSlug = `${projectSlug}-${suffix}`;
        }

        // 4. Big transaction — create everything
        const project = await prisma.$transaction(async (tx) => {
            // Create project
            const proj = await tx.project.create({
                data: {
                    tenantId: req.user.tenantId,
                    templateId,
                    name,
                    slug: projectSlug,
                    status: "draft",
                },
            });

            // Create branding
            await tx.projectBranding.create({
                data: {
                    projectId: proj.id,
                    primaryColor: branding.primaryColor || "#1a1a2e",
                    secondaryColor: branding.secondaryColor || "#e94560",
                    accentColor: branding.accentColor || "#f5a623",
                    bgColor: branding.bgColor || "#ffffff",
                    headingFont: branding.headingFont || "Inter",
                    bodyFont: branding.bodyFont || "Inter",
                    logoUrl: branding.logoUrl || null,
                    heroImageUrl: branding.heroImageUrl || null,
                    businessName: branding.businessName || null,
                    tagline: branding.tagline || null,
                    description: branding.description || null,
                    businessType: branding.businessType || null,
                },
            });

            // Create project member (owner)
            await tx.projectMember.create({
                data: {
                    projectId: proj.id,
                    userId: req.user.id,
                    role: "owner",
                },
            });

            // Group templateComponents by pageSlug
            const pageGroups = groupBy(templateComponents, "pageSlug");

            for (const [pageSlug, comps] of Object.entries(pageGroups)) {
                const first = comps[0];
                const page = await tx.page.create({
                    data: {
                        projectId: proj.id,
                        title: first.pageTitle,
                        slug: pageSlug,
                        navOrder: first.pageNavOrder,
                    },
                });

                for (const tc of comps) {
                    // Merge: component defaults → template defaults → branding injections
                    const mergedProps = {
                        ...(tc.component.defaultProps || {}),
                        ...(tc.defaultProps || {}),
                        ...(tc.componentId === "navbar" && {
                            logoUrl: branding.logoUrl,
                        }),
                        ...(tc.componentId === "hero_with_cta" && {
                            heading: branding.businessName,
                            subheading: branding.tagline,
                            backgroundImage: branding.heroImageUrl,
                        }),
                        ...(tc.componentId === "footer" && {
                            companyName: branding.businessName,
                            tagline: branding.tagline,
                        }),
                    };

                    await tx.pageComponent.create({
                        data: {
                            pageId: page.id,
                            projectId: proj.id,
                            componentId: tc.componentId,
                            orderIndex: tc.orderIndex,
                            props: mergedProps,
                        },
                    });
                }
            }

            // Save v1 snapshot
            const allPages = await tx.page.findMany({
                where: { projectId: proj.id },
                include: {
                    components: { orderBy: { orderIndex: "asc" } },
                },
            });

            await tx.version.create({
                data: {
                    projectId: proj.id,
                    label: "v1 - Initial",
                    snapshot: allPages,
                    createdById: req.user.id,
                },
            });

            return proj;
        });

        return res.status(201).json({
            success: true,
            projectId: project.id,
        });
    } catch (error) {
        console.error("Create project error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { renameProject, createProject };
