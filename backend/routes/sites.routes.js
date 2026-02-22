import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import prisma from "../utils/prisma.js";
import {
    createSite,
    createPages,
    getSiteByProjectId,
    updatePageSections,
    deleteSite,
    publishSite,
    unpublishSite,
    getSiteVersions,
    restoreSiteVersion
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

        // Assert ownership using the new helper
        const { assertTenantOwns } = await import("../middlewares/tenantScope.js");
        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        // Check site limits before duplicating
        const PLAN_LIMITS = (await import("../utils/planLimits.js")).default;
        const planLimits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.starter;
        const siteCount = await prisma.project.count({ where: { tenantId: req.user.tenantId } });

        if (siteCount >= planLimits.sites) {
            return res.status(403).json({
                success: false,
                message: "Site limit reached",
                upgradeRequired: true,
                limit: planLimits.sites
            });
        }

        const source = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                sitePages: {
                    include: { sections: { orderBy: { orderIndex: "asc" } } }
                }
            }
        });

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
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, message: error.message });
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
router.post("/:projectId/unpublish", authMiddleware, unpublishSite);
router.get("/:projectId/versions", authMiddleware, getSiteVersions);
router.post("/:projectId/versions/restore/:versionId", authMiddleware, restoreSiteVersion);

export default router;
