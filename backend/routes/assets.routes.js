import express from 'express';
import prisma from '../utils/prisma.js';
import authMiddleware from '../middlewares/auth.js';
import multer from 'multer';
import PLAN_LIMITS from '../utils/planLimits.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// GET /api/assets
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        const assets = await prisma.asset.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        const planLimits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.starter;

        res.json({
            assets,
            storageUsed: tenant.storageUsedBytes.toString(),
            storageLimit: planLimits.storageMB * 1024 * 1024
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

// POST /api/assets/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        const sizeBytes = file.size;

        const planLimits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.starter;
        const storageLimit = planLimits.storageMB * 1024 * 1024;

        if (BigInt(tenant.storageUsedBytes) + BigInt(sizeBytes) > BigInt(storageLimit)) {
            return res.status(403).json({ error: 'Storage limit exceeded', upgradeRequired: true });
        }

        const base64Data = file.buffer.toString('base64');
        const url = `data:${file.mimetype};base64,${base64Data}`;

        const assetType = file.mimetype.startsWith('image/') ? 'general' : 'general';

        const asset = await prisma.asset.create({
            data: {
                tenantId,
                fileName: file.originalname,
                sizeBytes,
                mimeType: file.mimetype,
                url: url,
                assetType,
                uploadedBy: req.user.id
            }
        });

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                storageUsedBytes: {
                    increment: sizeBytes
                }
            }
        });

        res.status(201).json({ asset });
    } catch (error) {
        console.error('Error uploading asset:', error);
        res.status(500).json({ error: 'Failed to upload asset' });
    }
});

// DELETE /api/assets/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const asset = await prisma.asset.findUnique({
            where: { id: req.params.id }
        });

        if (!asset || asset.tenantId !== req.user.tenantId) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        await prisma.asset.delete({
            where: { id: req.params.id }
        });

        await prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: {
                storageUsedBytes: {
                    decrement: asset.sizeBytes
                }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

export default router;
