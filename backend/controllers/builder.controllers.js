import prisma from "../utils/prisma.js";

// ─────────────────────────────────────────
// GET /api/builder/:projectId
// ─────────────────────────────────────────
const getBuilder = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Security — verify tenant owns this project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                tenantId: req.user.tenantId, // tenant isolation
            },
            include: {
                branding: true,
                pages: {
                    orderBy: { navOrder: "asc" },
                    include: {
                        components: {
                            orderBy: { orderIndex: "asc" },
                            include: {
                                component: {
                                    select: {
                                        name: true,
                                        propsSchema: true,
                                        thumbnailUrl: true,
                                        category: true,
                                    },
                                },
                            },
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

        // Full component library for left panel
        const componentLibrary = await prisma.component.findMany({
            where: { isActive: true },
            orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
        });

        return res.status(200).json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                status: project.status,
                liveUrl: project.liveUrl,
                branding: project.branding,
                pages: project.pages,
                versions: project.versions,
            },
            componentLibrary,
        });
    } catch (error) {
        console.error("Builder error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getBuilder };
