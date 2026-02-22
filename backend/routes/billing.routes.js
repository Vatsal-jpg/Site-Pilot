import express from 'express';
import prisma from '../utils/prisma.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

const PLAN_LIMITS = {
    starter: {
        maxProjects: 1,
        maxPagesPerProject: 3,
        storageLimitBytes: 500 * 1024 * 1024, // 500MB
        aiCreditsMonthly: 50,
    },
    pro: {
        maxProjects: 5,
        maxPagesPerProject: 99999, // unlimited practically
        storageLimitBytes: 5 * 1024 * 1024 * 1024, // 5GB
        aiCreditsMonthly: 500,
    },
    enterprise: {
        maxProjects: 99999,
        maxPagesPerProject: 99999,
        storageLimitBytes: 50 * 1024 * 1024 * 1024, // 50GB
        aiCreditsMonthly: 99999,
    }
};

// GET /api/billing
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        const siteCount = await prisma.project.count({
            where: { tenantId }
        });

        const memberCount = await prisma.user.count({
            where: { tenantId }
        });

        const limits = PLAN_LIMITS[tenant.plan || 'starter'] || PLAN_LIMITS.starter;

        res.json({
            plan: tenant.plan,
            aiCreditsUsed: tenant.aiCreditsUsed,
            aiCreditsLimit: limits.aiCreditsMonthly,
            storageUsedBytes: tenant.storageUsedBytes.toString(),
            storageLimit: limits.storageLimitBytes.toString(),
            siteCount,
            siteLimit: limits.maxProjects,
            memberCount,
            memberLimit: tenant.plan === 'starter' ? 1 : tenant.plan === 'pro' ? 5 : 99999,
            limits
        });
    } catch (error) {
        console.error('Error fetching billing info:', error);
        res.status(500).json({ error: 'Failed to fetch billing info' });
    }
});

// POST /api/billing/upgrade
router.post('/upgrade', authMiddleware, async (req, res) => {
    try {
        const { plan } = req.body;
        const tenantId = req.user.tenantId;

        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const validPlans = ['starter', 'pro', 'enterprise'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                plan,
                aiCreditsUsed: 0 // Reset on upgrade
            }
        });

        res.json({ success: true, tenant: updatedTenant });
    } catch (error) {
        console.error('Error upgrading plan:', error);
        res.status(500).json({ error: 'Failed to upgrade plan' });
    }
});

export default router;
