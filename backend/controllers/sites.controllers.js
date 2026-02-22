import prisma from "../utils/prisma.js";
import { assertTenantOwns } from "../middlewares/tenantScope.js";
import PLAN_LIMITS from "../utils/planLimits.js";

// POST /api/sites/create
export const createSite = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Site name is required" });

        // Check site limits based on plan
        const planLimits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.starter;
        const siteCount = await prisma.project.count({
            where: { tenantId: req.user.tenantId }
        });

        if (siteCount >= planLimits.sites) {
            return res.status(403).json({
                success: false,
                message: "Site limit reached",
                upgradeRequired: true,
                limit: planLimits.sites
            });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

        const project = await prisma.project.create({
            data: {
                name,
                slug,
                tenantId: req.user.tenantId,
                status: 'draft'
            }
        });

        // Add creator as owner
        await prisma.projectMember.create({
            data: {
                projectId: project.id,
                userId: req.user.id,
                role: 'owner'
            }
        });

        return res.status(201).json({ success: true, project });
    } catch (error) {
        console.error("Create site error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/sites/:projectId/pages
export const createPages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, slug, sections } = req.body;

        // Verify project ownership using helper
        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        const page = await prisma.sitePage.create({
            data: {
                name,
                slug,
                projectId,
                sections: {
                    create: sections.map((s, idx) => ({
                        componentType: s.componentType,
                        variant: s.variant || "dark",
                        slots: s.slots || {},
                        orderIndex: s.orderIndex ?? idx
                    }))
                }
            },
            include: { sections: true }
        });

        return res.status(201).json({ success: true, page });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, message: error.message });
        console.error("Create page error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/sites/:projectId
export const getSiteByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;

        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                sitePages: {
                    include: {
                        sections: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                }
            }
        });

        return res.status(200).json({ success: true, project });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, message: error.message });
        console.error("Get site error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/sites/:projectId/pages/:pageId
export const updatePageSections = async (req, res) => {
    try {
        const { projectId, pageId } = req.params;
        const { sections } = req.body;

        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        // Update via transaction to replace all sections
        const updatedPage = await prisma.$transaction(async (tx) => {
            // Delete old
            await tx.siteSection.deleteMany({
                where: { pageId }
            });

            // Create new
            if (sections && sections.length > 0) {
                await tx.siteSection.createMany({
                    data: sections.map((s, idx) => ({
                        pageId,
                        componentType: s.componentType,
                        variant: s.variant || "dark",
                        slots: s.slots || {},
                        orderIndex: s.orderIndex ?? idx
                    }))
                });
            }

            return tx.sitePage.findUnique({
                where: { id: pageId },
                include: { sections: { orderBy: { orderIndex: 'asc' } } }
            });
        });

        return res.status(200).json({ success: true, page: updatedPage });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, message: error.message });
        console.error("Update sections error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE /api/sites/:projectId
export const deleteSite = async (req, res) => {
    try {
        const { projectId } = req.params;

        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        // Explicitly check role. Must be owner or admin.
        const member = await prisma.projectMember.findFirst({
            where: { projectId, userId: req.user.id, role: { in: ['owner', 'admin'] } }
        });

        // As a fallback, maybe the user is a tenant owner/admin making the request via global dashboard.
        // We will allow if req.user.role is owner/admin OR they are a project member with owner/admin role.
        if (!member && req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden - owner or admin role required to delete site." });
        }

        // Deletion cascade handles sections -> pages -> branding -> project usually, or we can manually do it if not set to cascade.
        // Assume onDelete: Cascade is set on project relations.
        await prisma.project.delete({
            where: { id: projectId }
        });

        return res.status(200).json({ success: true, message: "Site deleted" });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, message: error.message });
        console.error("Delete site error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/sites/:projectId/publish
export const publishSite = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        // Fetch full project content for snapshot
        const fullProject = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                sitePages: { include: { sections: true } }
            }
        });

        // Generate static HTML, snapshot, or simply mark live
        const publishedUrl = `https://${project.slug}.example.com`; // placeholder for real publishing logic

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { status: 'published', liveUrl: publishedUrl }
        });

        await prisma.version.create({
            data: {
                projectId,
                label: `v-${Date.now()}`,
                snapshot: { pages: fullProject.sitePages }, // primitive snapshot
                createdById: req.user.id
            }
        });

        return res.status(200).json({ success: true, publishedUrl, status: updatedProject.status });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, message: error.message });
        console.error("Publish site error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
