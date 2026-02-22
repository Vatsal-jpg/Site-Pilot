import express from 'express';
import multer from 'multer';
import prisma from '../utils/prisma.js';
import authMiddleware from '../middlewares/auth.js';
import PLAN_LIMITS from '../utils/planLimits.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Storage: local filesystem for now
// Files stored in: uploads/[tenantId]/[filename]
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', req.user.tenantId);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.random().toString(36).slice(2);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif',
            'image/webp', 'image/svg+xml', 'image/avif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

// POST /api/assets/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Check storage limit
        const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.starter;
        const limitBytes = limits.storageMB * 1024 * 1024;
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.user.tenantId }
        });

        if (Number(tenant.storageUsedBytes) + req.file.size > limitBytes) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                error: `Storage limit reached (${limits.storageMB}MB on ${req.user.plan} plan)`,
                upgradeRequired: true,
                used: Number(tenant.storageUsedBytes),
                limit: limitBytes
            });
        }

        // Build public URL
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        const url = `${baseUrl}/uploads/${req.user.tenantId}/${req.file.filename}`;

        // Create asset record
        const asset = await prisma.asset.create({
            data: {
                tenantId: req.user.tenantId,
                fileName: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                sizeBytes: req.file.size,
                url,
                storageKey: req.file.path,
                isLogo: req.body.isLogo === 'true',
                uploadedBy: req.user.id
            }
        });

        // Update tenant storage usage
        await prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: { storageUsedBytes: { increment: req.file.size } }
        });

        return res.status(201).json({ asset });

    } catch (err) {
        console.error('upload error:', err);
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch { }
        }
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/assets
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { type } = req.query;
        const where = { tenantId: req.user.tenantId };
        if (type === 'image') {
            where.mimeType = { startsWith: 'image/' };
        }

        const assets = await prisma.asset.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ assets });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

// GET /api/assets/usage
router.get('/usage', authMiddleware, async (req, res) => {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.user.tenantId }
        });
        const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.starter;
        const limitBytes = limits.storageMB * 1024 * 1024;
        const usedBytes = Number(tenant.storageUsedBytes);

        return res.json({
            usedBytes,
            limitBytes,
            usedMB: (usedBytes / (1024 * 1024)).toFixed(1),
            limitMB: limits.storageMB,
            percent: Math.round((usedBytes / limitBytes) * 100)
        });
    } catch (error) {
        console.error('Error fetching usage:', error);
        res.status(500).json({ error: 'Failed to fetch usage status' });
    }
});

// DELETE /api/assets/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const asset = await prisma.asset.findUnique({
            where: { id: req.params.id }
        });

        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        if (asset.tenantId !== req.user.tenantId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Delete file from disk
        try {
            if (asset.storageKey && fs.existsSync(asset.storageKey)) {
                fs.unlinkSync(asset.storageKey);
            }
        } catch (err) {
            console.error('File delete error:', err);
        }

        // Delete record and update storage
        await prisma.$transaction([
            prisma.asset.delete({ where: { id: req.params.id } }),
            prisma.tenant.update({
                where: { id: req.user.tenantId },
                data: { storageUsedBytes: { decrement: asset.sizeBytes } }
            })
        ]);

        return res.json({ success: true, message: 'Asset deleted' });
    } catch (err) {
        console.error('delete error:', err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
