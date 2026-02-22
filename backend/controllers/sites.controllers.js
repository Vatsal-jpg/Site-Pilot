import prisma from "../utils/prisma.js";

// POST /api/sites/create
export const createSite = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Site name is required" });

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

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, tenantId: req.user.tenantId }
        });

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

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
        console.error("Create page error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/sites/:projectId
export const getSiteByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findFirst({
            where: { id: projectId, tenantId: req.user.tenantId },
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

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        return res.status(200).json({ success: true, project });
    } catch (error) {
        console.error("Get site error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/sites/:projectId/pages/:pageId
export const updatePageSections = async (req, res) => {
    try {
        const { projectId, pageId } = req.params;
        const { sections } = req.body; // array of sections to replace current ones

        const project = await prisma.project.findFirst({
            where: { id: projectId, tenantId: req.user.tenantId }
        });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

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
        console.error("Update sections error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE /api/sites/:projectId
export const deleteSite = async (req, res) => {
    try {
        const { projectId } = req.params;

        const member = await prisma.projectMember.findFirst({
            where: { projectId, userId: req.user.id, role: 'owner' }
        });
        if (!member) return res.status(403).json({ success: false, message: "Forbidden - owner role required" });

        const project = await prisma.project.findFirst({
            where: { id: projectId, tenantId: req.user.tenantId }
        });

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        await prisma.project.delete({
            where: { id: projectId }
        });

        return res.status(200).json({ success: true, message: "Site deleted" });
    } catch (error) {
        console.error("Delete site error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/sites/:projectId/publish
export const publishSite = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findFirst({
            where: { id: projectId, tenantId: req.user.tenantId },
            include: {
                sitePages: { include: { sections: true } }
            }
        });

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

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
                snapshot: { pages: project.sitePages }, // primitive snapshot
                createdById: req.user.id
            }
        });

        return res.status(200).json({ success: true, publishedUrl, status: updatedProject.status });
    } catch (error) {
        console.error("Publish site error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
