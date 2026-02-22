import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import prisma from "../utils/prisma.js";
import { renameProject, createProject } from "../controllers/projects.controllers.js";

const router = Router();

// GET /api/projects — list all projects for the authenticated tenant
router.get("/", authMiddleware, async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { tenantId: req.user.tenantId },
            orderBy: { updatedAt: "desc" },
        });
        res.json({ success: true, projects });
    } catch (error) {
        console.error("GET /api/projects error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch projects" });
    }
});

router.post("/create", authMiddleware, createProject);
router.patch("/:id/rename", authMiddleware, renameProject);

export default router;
