import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { getDashboard } from "../controllers/dashboard.controllers.js";

const router = Router();

router.get("/", authMiddleware, getDashboard);

export default router;
