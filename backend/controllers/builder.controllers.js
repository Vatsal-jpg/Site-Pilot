import prisma from "../utils/prisma.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/builder/:projectId
// ─────────────────────────────────────────────────────────────────────────────
const getBuilder = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Security — verify tenant owns this project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                tenantId: req.user.tenantId,
            },
            include: {
                branding: true,
                pages: {
                    orderBy: { navOrder: "asc" },
                    include: {
                        components: {
                            orderBy: { orderIndex: "asc" },
                            // No join to Component table — componentId is just a string now.
                            // Prisma returns all fields automatically: layout, generatedHtml, spacing, props.
                        },
                    },
                },
                versions: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        label: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        return res.status(200).json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                status: project.status,
                liveUrl: project.liveUrl,
                userPrompt: project.userPrompt,
                branding: project.branding,
                pages: project.pages,
                versions: project.versions,
            },
            // Component library is now hardcoded in the frontend — not returned from the API.
        });
    } catch (error) {
        console.error("Builder error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/builder/:projectId/save
//
// Body: { pages: [{ id, components: [{ id, componentId, orderIndex, props, layout, generatedHtml, spacing }] }] }
// ─────────────────────────────────────────────────────────────────────────────
const saveBuilder = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { pages } = req.body;

        if (!Array.isArray(pages)) {
            return res.status(400).json({ success: false, message: "pages array is required" });
        }

        // Verify ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, tenantId: req.user.tenantId },
        });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        await prisma.$transaction(async (tx) => {
            for (const page of pages) {
                if (!Array.isArray(page.components)) continue;

                for (const comp of page.components) {
                    await tx.pageComponent.upsert({
                        where: { id: comp.id || "" },
                        create: {
                            pageId: page.id,
                            projectId,
                            componentId: comp.componentId,
                            orderIndex: comp.orderIndex ?? 0,
                            props: comp.props || {},
                            layout: comp.layout || {},
                            generatedHtml: comp.generatedHtml || null,
                            spacing: comp.spacing || "medium",
                        },
                        update: {
                            orderIndex: comp.orderIndex ?? 0,
                            props: comp.props || {},
                            layout: comp.layout || {},
                            generatedHtml: comp.generatedHtml || null,
                            spacing: comp.spacing || "medium",
                        },
                    });
                }
            }

            // Version snapshot
            const snapshot = await tx.page.findMany({
                where: { projectId },
                include: { components: { orderBy: { orderIndex: "asc" } } },
            });
            await tx.version.create({
                data: {
                    projectId,
                    label: `Auto-save ${new Date().toISOString()}`,
                    snapshot,
                    createdById: req.user.id,
                },
            });
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Save builder error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getBuilder, saveBuilder };
