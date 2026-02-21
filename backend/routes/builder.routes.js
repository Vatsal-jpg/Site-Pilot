import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { getBuilder, saveBuilder } from "../controllers/builder.controllers.js";

const router = Router();

router.get("/:projectId", authMiddleware, getBuilder);
router.post("/:projectId/save", authMiddleware, saveBuilder);

export default router;
