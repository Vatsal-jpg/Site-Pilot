"use client";

import { Site } from "./types";
import { api } from "./api";

const STORAGE_KEY = "sitebuilder_sites";

// Cache helpers
function getCache(): Site[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCache(sites: Site[]): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    }
}

// ─── API Methods ─────────────────────────────────────────────────────────────

/**
 * Returns the cached sites immediately, then fetches from the API 
 * and updates the cache.
 */
export async function getAllSites(): Promise<Site[]> {
    try {
        const res = await api.get('/api/projects');

        // Map backend Project -> frontend Site shape
        const sites: Site[] = res.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            prompt: p.userPrompt,
            businessType: p.businessType,
            brandColor: p.brandColor,
            logoUrl: p.logoUrl,
            status: p.status,
            createdAt: p.createdAt,
            palette: p.palette,
            uploadedImages: p.uploadedImages,
            // we skip pages here, or fetch them if backend returns them
        }));

        saveCache(sites);
        return sites;
    } catch (e) {
        console.warn("API fetch failed, returning cache", e);
        return getCache();
    }
}

export async function getSite(id: string): Promise<Site | null> {
    const cached = getCache().find((s) => s.id === id);

    // Fire and forget background update or await it?
    // We will await it for accuracy, but apps can show `cached` first if using SWR/React Query.
    try {
        const res = await api.get(`/api/sites/${id}`);
        if (!res.success) return cached ?? null;

        const p = res.project;
        const site: Site = {
            id: p.id,
            name: p.name,
            prompt: p.userPrompt || '',
            businessType: p.businessType || '',
            brandColor: p.brandColor || '',
            logoUrl: p.logoUrl || '',
            status: p.status,
            createdAt: p.createdAt,
            palette: p.palette || null,
            uploadedImages: p.uploadedImages || [],
            pages: p.sitePages?.map((page: any) => ({
                id: page.id,
                name: page.name,
                slug: page.slug,
                sections: page.sections.map((sec: any) => ({
                    id: sec.id,
                    componentType: sec.componentType,
                    variant: sec.variant,
                    slots: sec.slots
                }))
            })) || []
        };

        const sites = getCache();
        const idx = sites.findIndex((s) => s.id === id);
        if (idx >= 0) sites[idx] = site;
        else sites.push(site);
        saveCache(sites);

        return site;
    } catch (e) {
        console.warn("API fetch failed, returning cache", e);
        return cached ?? null;
    }
}

export async function saveSite(site: Site): Promise<void> {
    try {
        // 1. Create project
        const projRes = await api.post('/api/sites/create', { name: site.name });
        const projectId = projRes.project.id;
        site.id = projectId; // update local ID to true DB ID

        // 2. Create pages & sections
        if (site.pages) {
            for (const page of site.pages) {
                await api.post(`/api/sites/${projectId}/pages`, {
                    name: page.name,
                    slug: page.slug,
                    sections: page.sections.map((s, idx) => ({
                        componentType: s.componentType,
                        variant: s.variant,
                        slots: s.slots,
                        orderIndex: idx
                    }))
                });
            }
        }

        // Cache update
        const sites = getCache();
        sites.push(site);
        saveCache(sites);

    } catch (e) {
        console.error("Failed to save site to API", e);
        // Fallback to local cache only if API fails (optional depending on UX needs)
        const sites = getCache();
        sites.push(site);
        saveCache(sites);
    }
}

export async function updateSite(id: string, updates: Partial<Site>): Promise<void> {
    try {
        // If updating pages/sections, call replace endpoint per page
        if (updates.pages) {
            for (const page of updates.pages) {
                await api.put(`/api/sites/${id}/pages/${page.id}`, {
                    sections: page.sections.map((s, idx) => ({
                        componentType: s.componentType,
                        variant: s.variant,
                        slots: s.slots,
                        orderIndex: idx
                    }))
                });
            }
        }

        // Update local cache
        const sites = getCache();
        const idx = sites.findIndex((s) => s.id === id);
        if (idx >= 0) {
            sites[idx] = { ...sites[idx], ...updates };
            saveCache(sites);
        }
    } catch (e) {
        console.error("Failed to update site via API", e);
        // Fallback cache update
        const sites = getCache();
        const idx = sites.findIndex((s) => s.id === id);
        if (idx >= 0) {
            sites[idx] = { ...sites[idx], ...updates };
            saveCache(sites);
        }
    }
}

export async function deleteSite(id: string): Promise<void> {
    try {
        await api.delete(`/api/sites/${id}`);
    } catch (e) {
        console.error("Failed to delete site via API", e);
    } finally {
        const sites = getCache().filter((s) => s.id !== id);
        saveCache(sites);
    }
}
