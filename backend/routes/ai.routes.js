import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { suggestTheme } from "../controllers/ai.controllers.js";

const router = Router();

router.post("/suggest-theme", authMiddleware, suggestTheme);

export default router;
