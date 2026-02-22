import express from 'express';
import prisma from '../utils/prisma.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// GET /api/team - Returns all users + pending invites
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const members = await prisma.user.findMany({
            where: { tenantId },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        const pendingInvites = await prisma.invite.findMany({
            where: { tenantId, accepted: false },
            select: { id: true, email: true, role: true, createdAt: true, expiresAt: true }
        });
        res.json({ members, pendingInvites });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// POST /api/team/invite
router.post('/invite', authMiddleware, async (req, res) => {
    try {
        const { email, role } = req.body;
        const tenantId = req.user.tenantId;

        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to invite members' });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.invite.create({
            data: {
                tenantId,
                email,
                role: role || 'editor',
                invitedById: req.user.id,
                expiresAt
            }
        });
        res.status(201).json({ invite });
    } catch (error) {
        console.error('Error creating invite:', error);
        res.status(500).json({ error: 'Failed to create invite' });
    }
});

// GET /api/team/invites
router.get('/invites', authMiddleware, async (req, res) => {
    try {
        const invites = await prisma.invite.findMany({
            where: { tenantId: req.user.tenantId, accepted: false }
        });
        res.json({ invites });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invites' });
    }
});

// DELETE /api/team/invites/:id
router.delete('/invites/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await prisma.invite.delete({
            where: { id: req.params.id, tenantId: req.user.tenantId }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete invite' });
    }
});

// PATCH /api/team/:userId/role
router.patch('/:userId/role', authMiddleware, async (req, res) => {
    try {
        const { role } = req.body;

        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: req.params.userId }
        });

        if (!targetUser || targetUser.tenantId !== req.user.tenantId) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (targetUser.role === 'owner') {
            return res.status(400).json({ error: 'Cannot change owner role' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.params.userId },
            data: { role }
        });
        res.json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// DELETE /api/team/:userId
router.delete('/:userId', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: req.params.userId }
        });

        if (!targetUser || targetUser.tenantId !== req.user.tenantId) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (targetUser.role === 'owner') {
            return res.status(400).json({ error: 'Cannot remove owner' });
        }

        await prisma.user.delete({
            where: { id: req.params.userId }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove user' });
    }
});

export default router;
