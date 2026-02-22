import prisma from "../utils/prisma.js";
import { assertTenantOwns } from "../middlewares/tenantScope.js";
import PLAN_LIMITS from "../utils/planLimits.js";
import axios from 'axios';
import { pushToGithub } from "../utils/github.js";

// POST /api/sites/create
export const createSite = async (req, res) => {
    try {
        const { name, businessType, brandColor, logoUrl, palette, uploadedImages, prompt } = req.body;

        const planLimits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.starter;
        const siteCount = await prisma.project.count({
            where: { tenantId: req.user.tenantId }
        });

        if (siteCount >= planLimits.sites) {
            return res.status(403).json({
                success: false,
                error: `Site limit reached (${planLimits.sites} sites on ${req.user.plan} plan)`,
                upgradeRequired: true,
                limit: planLimits.sites
            });
        }

        const project = await prisma.project.create({
            data: {
                tenantId: req.user.tenantId,
                name: name || 'Untitled Site',
                slug: (name || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '-' + Date.now(),
                status: 'draft',
                businessType,
                brandColor,
                logoUrl,
                palette: palette || {},
                uploadedImages: uploadedImages || [],
                userPrompt: prompt,
            }
        });

        await prisma.projectMember.create({
            data: { projectId: project.id, userId: req.user.id, role: 'owner' }
        });

        return res.status(201).json({ success: true, project });
    } catch (error) {
        console.error("Create site error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// POST /api/sites/:projectId/pages
export const createPages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { pages } = req.body;

        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        if (!pages || !Array.isArray(pages)) {
            return res.status(400).json({ success: false, error: 'pages array required' });
        }

        // Check page limit
        const limits = PLAN_LIMITS[req.user.plan] || PLAN_LIMITS.starter;
        if (pages.length > limits.pagesPerSite) {
            return res.status(403).json({
                success: false,
                error: `Page limit is ${limits.pagesPerSite} on ${req.user.plan} plan`,
                upgradeRequired: true
            });
        }

        // Clean up existing page sections and pages
        await prisma.siteSection.deleteMany({
            where: { page: { projectId } }
        });
        await prisma.sitePage.deleteMany({
            where: { projectId }
        });

        const createdPages = [];
        for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            const page = await prisma.sitePage.create({
                data: {
                    projectId,
                    name: p.name,
                    slug: p.slug,
                    navOrder: i,
                    isHome: p.slug === '/' || p.slug === '',
                    sections: {
                        create: (p.sections || []).map((s, idx) => ({
                            componentType: s.componentType,
                            variant: s.variant || 'dark',
                            slots: s.slots || {},
                            orderIndex: idx
                        }))
                    }
                },
                include: { sections: true }
            });
            createdPages.push(page);
        }

        return res.status(201).json({ success: true, pages: createdPages });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, error: error.message });
        console.error("Create pages error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// GET /api/sites/:projectId
export const getSiteByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                branding: true,
                sitePages: {
                    orderBy: { navOrder: 'asc' },
                    include: {
                        sections: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                }
            }
        });

        // Map `sitePages` back to `pages` for frontend compatibility, as the DB model is SitePage, but frontend expects pages
        const payload = {
            ...project,
            pages: project.sitePages
        };
        delete payload.sitePages;

        return res.status(200).json({ success: true, project: payload });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, error: error.message });
        console.error("Get site error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// PUT /api/sites/:projectId/pages/:pageId
export const updatePageSections = async (req, res) => {
    try {
        const { projectId, pageId } = req.params;
        const { sections, customHtml, customCss } = req.body;

        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        // Delete existing ones
        await prisma.siteSection.deleteMany({
            where: { pageId }
        });

        // Recreate them
        if (sections && sections.length > 0) {
            await prisma.siteSection.createMany({
                data: sections.map((s, idx) => ({
                    pageId,
                    componentType: s.componentType || 'CustomBlock',
                    variant: s.variant || 'dark',
                    slots: s.slots || {},
                    orderIndex: s.orderIndex ?? idx
                }))
            });
        }

        // Store custom HTML/CSS if from GrapesJS edits
        if (customHtml !== undefined || customCss !== undefined) {
            await prisma.sitePage.update({
                where: { id: pageId },
                data: {
                    customHtml: customHtml || null,
                    customCss: customCss || null,
                }
            });
        }

        // Auto-create version every 10 saves across the project
        const saveCount = await prisma.siteSection.count({
            where: { page: { projectId } }
        });
        if (saveCount > 0 && saveCount % 10 === 0) {
            const fullProject = await prisma.project.findUnique({
                where: { id: projectId },
                include: { sitePages: { include: { sections: true } } }
            });
            await prisma.version.create({
                data: {
                    projectId,
                    label: 'Auto-save',
                    snapshot: fullProject,
                    createdById: req.user.id
                }
            });
        }

        const updatedPage = await prisma.sitePage.findUnique({
            where: { id: pageId },
            include: { sections: { orderBy: { orderIndex: 'asc' } } }
        });

        return res.status(200).json({ success: true, page: updatedPage });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, error: error.message });
        console.error("Update sections error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// POST /api/sites/:projectId/publish


export const publishSite = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        // 1. Get full project data (including pages and sections)
        const fullProject = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                sitePages: {
                    include: { sections: true }
                },
                tenant: true // To help with the slug/domain logic
            }
        });

        // 2. Create a Version/Snapshot before publishing
        await prisma.version.create({
            data: {
                projectId,
                label: 'Pre-deployment snapshot',
                snapshot: fullProject,
                createdById: req.user.id
            }
        });

        // 3. Push to GitHub
        // This utility (see step 3) generates the dist folder and returns the repo URL
        const repoUrl = await pushToGithub(fullProject);

        // 4. Trigger Deployment Server using environment variable
        const deployEndpoint = `${process.env.DEPLOYMENT_SERVER_URL}/deploy`;

        const deployResponse = await axios.post(deployEndpoint, {
            repo: repoUrl,
            slug: project.slug
        });

        // Your deployment server returns: { message, deployment: { url, deploymentId, ... } }
        const { url, deploymentId } = deployResponse.data.deployment;

        // 5. Update Project Status in DB
        const updated = await prisma.project.update({
            where: { id: projectId },
            data: {
                status: 'published',
                publishedAt: new Date(),
                liveUrl: url
            }
        });

        return res.status(200).json({
            success: true,
            status: 'published',
            publishedAt: updated.publishedAt,
            liveUrl: updated.liveUrl,
            deploymentId: deploymentId
        });
    } catch (error) {
        if (error.status === 403 || error.status === 404) {
            return res.status(error.status).json({ success: false, error: error.message });
        }
        console.error("Publish site error:", error);
        return res.status(500).json({ success: false, error: "Deployment failed" });
    }
};

// POST /api/sites/:projectId/unpublish
export const unpublishSite = async (req, res) => {
    try {
        const { projectId } = req.params;
        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'draft', liveUrl: null }
        });

        return res.status(200).json({ success: true, status: 'draft' });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, error: error.message });
        console.error("Unpublish site error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// GET /api/sites/:projectId/versions
export const getSiteVersions = async (req, res) => {
    try {
        const { projectId } = req.params;
        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        const versions = await prisma.version.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { id: true, label: true, createdAt: true, createdById: true }
        });

        return res.status(200).json({ success: true, versions });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, error: error.message });
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// POST /api/sites/:projectId/versions/restore/:versionId
export const restoreSiteVersion = async (req, res) => {
    try {
        const { projectId, versionId } = req.params;
        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        const version = await prisma.version.findUnique({ where: { id: versionId } });
        if (!version || version.projectId !== projectId) {
            return res.status(404).json({ success: false, error: 'Version not found' });
        }

        const current = await prisma.project.findUnique({
            where: { id: projectId },
            include: { sitePages: { include: { sections: true } } }
        });

        await prisma.version.create({
            data: {
                projectId,
                label: 'Before restore',
                snapshot: current,
                createdById: req.user.id
            }
        });

        const snapshot = version.snapshot;

        await prisma.siteSection.deleteMany({ where: { page: { projectId } } });
        await prisma.sitePage.deleteMany({ where: { projectId } });

        const snapPages = snapshot.sitePages || snapshot.pages || [];
        for (const page of snapPages) {
            await prisma.sitePage.create({
                data: {
                    projectId,
                    name: page.name,
                    slug: page.slug,
                    navOrder: page.navOrder,
                    isHome: page.isHome,
                    sections: {
                        create: (page.sections || []).map(s => ({
                            componentType: s.componentType,
                            variant: s.variant,
                            slots: s.slots,
                            orderIndex: s.orderIndex
                        }))
                    }
                }
            });
        }

        return res.status(200).json({ success: true, message: 'Restored successfully', versionId });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, error: error.message });
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

// DELETE /api/sites/:projectId
export const deleteSite = async (req, res) => {
    try {
        const { projectId } = req.params;
        await assertTenantOwns(prisma, 'project', projectId, req.user.tenantId);

        if (!['owner', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Only owners and admins can delete sites' });
        }

        await prisma.siteSection.deleteMany({ where: { page: { projectId } } });
        await prisma.sitePage.deleteMany({ where: { projectId } });
        await prisma.version.deleteMany({ where: { projectId } });
        await prisma.projectBranding.deleteMany({ where: { projectId } });
        await prisma.project.delete({ where: { id: projectId } });

        return res.status(200).json({ success: true, message: "Site deleted" });
    } catch (error) {
        if (error.status === 403 || error.status === 404) return res.status(error.status).json({ success: false, error: error.message });
        console.error("Delete site error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
