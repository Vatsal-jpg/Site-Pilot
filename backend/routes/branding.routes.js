import express from 'express';
import prisma from '../utils/prisma.js';
import authMiddleware from '../middlewares/auth.js';
import { assertTenantOwns } from '../middlewares/tenantScope.js';

const router = express.Router();

// GET /api/sites/:projectId/branding
router.get('/:projectId/branding', authMiddleware, async (req, res) => {
    try {
        await assertTenantOwns(prisma, 'project', req.params.projectId, req.user.tenantId);
        let branding = await prisma.projectBranding.findUnique({
            where: { projectId: req.params.projectId }
        });
        if (!branding) {
            branding = await prisma.projectBranding.create({
                data: { projectId: req.params.projectId }
            });
        }
        return res.json({ branding });
    } catch (error) {
        console.error('Error fetching branding:', error);
        res.status(500).json({ error: 'Failed to fetch branding' });
    }
});

// PUT /api/sites/:projectId/branding
router.put('/:projectId/branding', authMiddleware, async (req, res) => {
    try {
        await assertTenantOwns(prisma, 'project', req.params.projectId, req.user.tenantId);

        const {
            primaryColor, secondaryColor, accentColor,
            fontHeading, fontBody, borderRadius,
            businessName, logoUrl, palette
        } = req.body;

        const updateData = {};
        if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
        if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
        if (accentColor !== undefined) updateData.accentColor = accentColor;
        if (fontHeading !== undefined) updateData.fontHeading = fontHeading;
        if (fontBody !== undefined) updateData.fontBody = fontBody;
        if (borderRadius !== undefined) updateData.borderRadius = borderRadius;
        if (businessName !== undefined) updateData.businessName = businessName;
        if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
        if (palette !== undefined) updateData.palette = palette;

        const branding = await prisma.projectBranding.upsert({
            where: { projectId: req.params.projectId },
            create: {
                projectId: req.params.projectId,
                ...updateData
            },
            update: updateData
        });

        // Also update project top-level fields
        const projectUpdate = {};
        if (primaryColor !== undefined) projectUpdate.brandColor = primaryColor;
        if (logoUrl !== undefined) projectUpdate.logoUrl = logoUrl;
        if (palette !== undefined) projectUpdate.palette = palette;

        if (Object.keys(projectUpdate).length > 0) {
            await prisma.project.update({
                where: { id: req.params.projectId },
                data: projectUpdate
            });
        }

        return res.json({ branding });
    } catch (error) {
        console.error('Error updating branding:', error);
        res.status(500).json({ error: 'Failed to update branding' });
    }
});

export default router;
