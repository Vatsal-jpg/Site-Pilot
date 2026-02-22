"use client";

import { Site, Page, Section } from "./types";
import { api } from "./api";

// ─── API Methods ─────────────────────────────────────────────────────────────

/**
 * Maps backend Project to frontend Site
 */
function convertProjectToSite(project: any): Site {
    return {
        id: project.id,
        name: project.name,
        prompt: project.userPrompt || '',
        businessType: project.businessType || '',
        brandColor: project.brandColor || '',
        logoUrl: project.logoUrl || '',
        status: project.status,
        createdAt: project.createdAt,
        palette: project.palette || null,
        uploadedImages: project.uploadedImages || [],
        pages: (project.pages || project.sitePages || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            customHtml: p.customHtml || undefined,
            customCss: p.customCss || undefined,
            sections: (p.sections || []).map((s: any) => ({
                id: s.id,
                componentType: s.componentType,
                variant: s.variant,
                slots: s.slots,
            }))
        }))
    };
}

export async function getAllSites(): Promise<Site[]> {
    try {
        const res = await api.get('/api/sites');
        if (!res.success && !res.sites) return [];
        return res.sites.map(convertProjectToSite);
    } catch (e) {
        console.error("API fetch failed for getAllSites", e);
        return [];
    }
}

export async function getSite(id: string): Promise<Site | null> {
    try {
        const res = await api.get(`/api/sites/${id}`);
        if (!res.success || !res.project) return null;
        return convertProjectToSite(res.project);
    } catch (e) {
        console.error(`API fetch failed for getSite: ${id}`, e);
        return null;
    }
}

export async function saveSite(site: Site): Promise<void> {
    try {
        // 1. Create project
        const payload = {
            name: site.name,
            businessType: site.businessType,
            brandColor: site.brandColor,
            logoUrl: site.logoUrl,
            palette: site.palette,
            uploadedImages: site.uploadedImages,
            prompt: site.prompt,
        };
        const projRes = await api.post('/api/sites/create', payload);
        const projectId = projRes.project.id;
        site.id = projectId; // update local ID to true DB ID

        // 2. Create pages & sections in bulk
        if (site.pages && site.pages.length > 0) {
            await api.post(`/api/sites/${projectId}/pages`, {
                pages: site.pages.map(page => ({
                    name: page.name,
                    slug: page.slug,
                    sections: page.sections.map((s, idx) => ({
                        componentType: s.componentType,
                        variant: s.variant,
                        slots: s.slots,
                        orderIndex: idx
                    }))
                }))
            });
        }
    } catch (e) {
        console.error("Failed to save site to API", e);
        throw e;
    }
}

export async function updateSite(id: string, updates: Partial<Site>): Promise<void> {
    try {
        // If updating pages/sections, call replace endpoint per page
        if (updates.pages) {
            for (const page of updates.pages) {
                // If it's just section updates, we use the put endpoint
                // Assuming page already exists (if not, we'd need to handle creating individual pages here)
                await api.put(`/api/sites/${id}/pages/${page.id}`, {
                    sections: page.sections.map((s, idx) => ({
                        componentType: s.componentType,
                        variant: s.variant,
                        slots: s.slots,
                        orderIndex: idx
                    })),
                    customHtml: (page as any).customHtml,
                    customCss: (page as any).customCss,
                });
            }
        }

        // We can also have an endpoint for updating Project-level fields, but not in current routes.
        // It wasn't explicitly asked for other than pages!

    } catch (e) {
        console.error("Failed to update site via API", e);
        throw e;
    }
}

export async function deleteSite(id: string): Promise<void> {
    try {
        await api.delete(`/api/sites/${id}`);
    } catch (e) {
        console.error("Failed to delete site via API", e);
        throw e;
    }
}

/**
 * Optimized single-page update — avoids looping through ALL pages during auto-save.
 */
export async function updatePageContent(projectId: string, page: any): Promise<void> {
    try {
        await api.put(`/api/sites/${projectId}/pages/${page.id}`, {
            sections: page.sections.map((s: any, idx: number) => ({
                componentType: s.componentType,
                variant: s.variant,
                slots: s.slots,
                orderIndex: idx
            })),
            customHtml: page.customHtml,
            customCss: page.customCss,
        });
    } catch (e) {
        console.error("Failed to update page via API", e);
        throw e;
    }
}
