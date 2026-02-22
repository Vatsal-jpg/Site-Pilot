import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import {
    suggestLayout,
    generateComponent,
    chatComponent,
    getChatHistory,
    generateStructure,
    generateContent,
    editSection
} from "../controllers/ai.controllers.js";

const router = Router();

router.post("/suggest-layout", authMiddleware, suggestLayout);
router.post("/generate-component", authMiddleware, generateComponent);
router.post("/chat-component", authMiddleware, chatComponent);
router.post("/generate-structure", authMiddleware, generateStructure);
router.post("/generate-content", authMiddleware, generateContent);
router.post("/edit-section", authMiddleware, editSection);
router.get("/chat/:pageComponentId", authMiddleware, getChatHistory);

export default router;
