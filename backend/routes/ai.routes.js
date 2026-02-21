import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import {
    suggestLayout,
    generateComponent,
    chatComponent,
    getChatHistory,
} from "../controllers/ai.controllers.js";

const router = Router();

router.post("/suggest-layout", authMiddleware, suggestLayout);
router.post("/generate-component", authMiddleware, generateComponent);
router.post("/chat-component", authMiddleware, chatComponent);
router.get("/chat/:pageComponentId", authMiddleware, getChatHistory);

export default router;
