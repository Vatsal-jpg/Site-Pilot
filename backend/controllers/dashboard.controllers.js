import prisma from "../utils/prisma.js";
import PLAN_LIMITS from "../utils/planLimits.js";

// ─────────────────────────────────────────
// GET /api/dashboard
// ─────────────────────────────────────────
const getDashboard = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        // Parallel queries for performance
        const [projects, tenant, memberCount] = await Promise.all([
            prisma.project.findMany({
                where: { tenantId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    liveUrl: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: "desc" },
            }),

            prisma.tenant.findUnique({
                where: { id: tenantId },
                select: {
                    plan: true,
                    orgName: true,
                    storageUsedBytes: true,
                    aiCreditsUsed: true,
                },
            }),

            prisma.user.count({
                where: { tenantId },
            }),
        ]);

        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const limits = PLAN_LIMITS[tenant.plan];

        return res.status(200).json({
            success: true,
            projects,
            tenant: {
                orgName: tenant.orgName,
                plan: tenant.plan,
                storageUsedBytes: tenant.storageUsedBytes.toString(),
                aiCreditsUsed: tenant.aiCreditsUsed,
            },
            memberCount,
            limits,
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getDashboard };
