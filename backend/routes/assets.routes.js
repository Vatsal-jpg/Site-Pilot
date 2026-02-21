import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { getUploadUrl, confirmUpload } from "../controllers/assets.controllers.js";

const router = Router();

router.post("/upload-url", authMiddleware, getUploadUrl);
router.post("/confirm", authMiddleware, confirmUpload);

export default router;
