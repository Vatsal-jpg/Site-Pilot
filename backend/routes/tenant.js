const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// PATCH /api/tenant/settings
router.patch('/settings', authMiddleware, async (req, res) => {
    try {
        const { orgName, subdomain, brandColor } = req.body;

        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const dataToUpdate = {};
        if (orgName) dataToUpdate.orgName = orgName;
        // Not mapping subdomain currently to slug if they change it because of unique constraints, but in real scenario we could.

        const tenant = await prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: dataToUpdate
        });

        res.json({ success: true, tenant });
    } catch (error) {
        console.error('Error updating tenant settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// DELETE /api/tenant
router.delete('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ error: 'Only owners can delete the organization' });
        }

        await prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: { status: 'deleted' }
        });

        res.json({ success: true, message: 'Organization queued for deletion' });
    } catch (error) {
        console.error('Error deleting tenant:', error);
        res.status(500).json({ error: 'Failed to delete organization' });
    }
});

module.exports = router;
