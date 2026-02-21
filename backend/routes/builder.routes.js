import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { getBuilder } from "../controllers/builder.controllers.js";

const router = Router();

router.get("/:projectId", authMiddleware, getBuilder);

export default router;
