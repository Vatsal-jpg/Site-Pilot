import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { renameProject, createProject } from "../controllers/projects.controllers.js";

const router = Router();

router.post("/create", authMiddleware, createProject);
router.patch("/:id/rename", authMiddleware, renameProject);

export default router;
