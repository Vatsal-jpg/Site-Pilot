import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import prisma from "../utils/prisma.js";
import {
    createSite,
    createPages,
    getSiteByProjectId,
    updatePageSections,
    deleteSite,
    publishSite
} from "../controllers/sites.controllers.js";

const router = Router();

// GET /api/sites — list all projects for the authenticated tenant
router.get("/", authMiddleware, async (req, res) => {
    try {
        const sites = await prisma.project.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                liveUrl: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.json({ success: true, sites });
    } catch (error) {
        console.error("GET /api/sites error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch sites" });
    }
});

// POST /api/sites/:projectId/duplicate — duplicate a project
router.post("/:projectId/duplicate", authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;

        const source = await prisma.project.findFirst({
            where: { id: projectId, tenantId: req.user.tenantId },
            include: {
                sitePages: {
                    include: { sections: { orderBy: { orderIndex: "asc" } } }
                }
            }
        });

        if (!source) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const slug = source.slug + "-copy-" + Date.now();

        const newProject = await prisma.$transaction(async (tx) => {
            const proj = await tx.project.create({
                data: {
                    tenantId: req.user.tenantId,
                    name: source.name + " (Copy)",
                    slug,
                    status: "draft",
                }
            });

            await tx.projectMember.create({
                data: {
                    projectId: proj.id,
                    userId: req.user.id,
                    role: "owner",
                }
            });

            if (source.sitePages) {
                for (const page of source.sitePages) {
                    await tx.sitePage.create({
                        data: {
                            projectId: proj.id,
                            name: page.name,
                            slug: page.slug,
                            sections: {
                                create: page.sections.map((s) => ({
                                    componentType: s.componentType,
                                    variant: s.variant,
                                    slots: s.slots,
                                    orderIndex: s.orderIndex,
                                }))
                            }
                        }
                    });
                }
            }

            return proj;
        });

        res.status(201).json({ success: true, site: newProject });
    } catch (error) {
        console.error("Duplicate site error:", error);
        res.status(500).json({ success: false, message: "Failed to duplicate site" });
    }
});

router.post("/create", authMiddleware, createSite);
router.post("/:projectId/pages", authMiddleware, createPages);
router.get("/:projectId", authMiddleware, getSiteByProjectId);
router.put("/:projectId/pages/:pageId", authMiddleware, updatePageSections);
router.delete("/:projectId", authMiddleware, deleteSite);
router.post("/:projectId/publish", authMiddleware, publishSite);

export default router;
