import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { getTemplates } from "../controllers/templates.controllers.js";

const router = Router();

router.get("/", authMiddleware, getTemplates);

export default router;
