import { Router } from "express";
import { signup, login } from "../controllers/auth.controllers.js";
import authMiddleware from "../middlewares/auth.js";
import prisma from "../utils/prisma.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, tenantId: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
            select: { id: true, orgName: true, slug: true, plan: true, aiCreditsUsed: true, storageUsedBytes: true }
        });

        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        // BigInt cannot be serialized by JSON.stringify — convert to string
        res.json({
            user,
            tenant: {
                ...tenant,
                storageUsedBytes: tenant.storageUsedBytes.toString(),
            }
        });
    } catch (error) {
        console.error("GET /api/auth/me error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

export default router;
