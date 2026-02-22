import { saveSite } from '@/lib/store';
import type { Section, Page, Site } from '@/lib/types';
import { api } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uuid(): string {
    return crypto.randomUUID();
}

async function callAPI(action: string, payload: unknown, retries = 2): Promise<unknown> {
    const endpointMap: Record<string, string> = {
        generateStructure: '/api/ai/generate-structure',
        generateContent: '/api/ai/generate-content',
        editSection: '/api/ai/edit-section',
    };

    const endpoint = endpointMap[action];
    if (!endpoint) throw new Error(`Unknown API action: ${action}`);

    try {
        const res = await api.post(endpoint, payload);
        return res; // Note: api.post already handles returning JSON
    } catch (err: any) {
        if (err.message && err.message.toLowerCase().includes('rate limit')) {
            if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                return callAPI(action, payload, retries - 1);
            }
            throw new Error('Rate limit reached. Please wait a moment and try again.');
        }

        if (retries > 0 && err instanceof TypeError) {
            // Network error — retry once
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return callAPI(action, payload, retries - 1);
        }
        throw err;
    }
}

function resolveImageUrl(query: string, width: number, height: number): string {
    const seed = Math.abs(query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000;
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
// ─── Function 1: generateSiteStructure ────────────────────────────────────────

export async function generateSiteStructure(input: {
    prompt: string;
    businessType: string;
    siteName: string;
    planPageLimit: number;
}): Promise<{
    pages: { name: string; slug: string; sections: string[] }[];
    summary: string;
}> {
    const result = await callAPI('generateStructure', input);
    return result as {
        pages: { name: string; slug: string; sections: string[] }[];
        summary: string;
    };
}

// ─── Function 2: generatePageContent ──────────────────────────────────────────

export async function generatePageContent(input: {
    pageName: string;
    pageType: string;
    sections: string[];
    siteContext: {
        siteName: string;
        prompt: string;
        businessType: string;
        brandColor: string;
        logoUrl?: string;
    };
}): Promise<Section[]> {
    const rawSections = (await callAPI('generateContent', input)) as {
        componentType: string;
        variant: string;
        slots: Record<string, unknown>;
    }[];

    // Post-process each section
    const sections: Section[] = rawSections.map((item) => {
        const slots = { ...item.slots } as Record<string, unknown>;

        // Resolve image URLs from keyword strings
        for (const [key, value] of Object.entries(slots)) {
            if (typeof value !== 'string') continue;
            if (key === 'imageQuery' || key === 'fallbackImageQuery') {
                const isHero = item.componentType.startsWith('Hero');
                slots[key] = resolveImageUrl(value, isHero ? 1200 : 800, isHero ? 800 : 600);
            } else if (key === 'avatarQuery') {
                slots[key] = resolveImageUrl(value, 400, 400);
            }
        }

        // Resolve imageQuery inside list items
        for (const [key, value] of Object.entries(slots)) {
            if (Array.isArray(value)) {
                slots[key] = value.map((listItem: Record<string, unknown>) => {
                    if (typeof listItem !== 'object' || listItem === null) return listItem;
                    const resolved = { ...listItem };
                    if (typeof resolved.imageQuery === 'string') {
                        resolved.imageQuery = resolveImageUrl(resolved.imageQuery as string, 800, 600);
                    }
                    if (typeof resolved.avatarQuery === 'string') {
                        resolved.avatarQuery = resolveImageUrl(resolved.avatarQuery as string, 400, 400);
                    }
                    if (typeof resolved.query === 'string') {
                        resolved.query = resolveImageUrl(resolved.query as string, 200, 80);
                    }
                    return resolved;
                });
            }
        }

        return {
            id: uuid(),
            componentType: item.componentType,
            variant: item.variant || 'dark',
            slots: slots as Record<string, any>,
        };
    });

    return sections;
}

// ─── Function 3: generateFullSite ─────────────────────────────────────────────

export async function generateFullSite(input: {
    prompt: string;
    businessType: string;
    siteName: string;
    brandColor: string;
    logoUrl?: string;
    palette?: any | null;
    uploadedImages?: string[];
    planPageLimit: number;
    onProgress?: (step: string, percent: number) => void;
}): Promise<Site> {
    const progress = input.onProgress ?? (() => { });

    progress('Analyzing your prompt...', 5);

    const structure = await generateSiteStructure({
        prompt: input.prompt,
        businessType: input.businessType,
        siteName: input.siteName,
        planPageLimit: input.planPageLimit,
    });

    progress('Planning site structure...', 20);

    const pages: Page[] = [];
    const total = structure.pages.length;

    for (let i = 0; i < total; i++) {
        const pageDef = structure.pages[i];
        progress(`Generating ${pageDef.name}...`, 20 + ((i / total) * 70));

        const sections = await generatePageContent({
            pageName: pageDef.name,
            pageType: pageDef.slug.replace(/^\//, '') || 'home',
            sections: pageDef.sections,
            siteContext: {
                siteName: input.siteName,
                prompt: input.prompt,
                businessType: input.businessType,
                brandColor: input.brandColor,
                logoUrl: input.logoUrl,
            },
        });

        pages.push({
            id: uuid(),
            name: pageDef.name,
            slug: pageDef.slug,
            sections,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    progress('Finalizing...', 95);

    const site: Site = {
        id: uuid(),
        name: input.siteName,
        prompt: input.prompt,
        businessType: input.businessType,
        brandColor: input.brandColor,
        logoUrl: input.logoUrl ?? '',
        pages,
        createdAt: new Date().toISOString(),
        status: 'draft',
        palette: input.palette || null,
        uploadedImages: input.uploadedImages || [],
    };

    progress('Done!', 100);

    saveSite(site);

    return site;
}

// ─── Function 4: editSectionWithAI ────────────────────────────────────────────

export async function editSectionWithAI(input: {
    instruction: string;
    currentSection: Section;
    siteContext: { siteName: string; brandColor: string; businessType: string };
}): Promise<Section> {
    const result = (await callAPI('editSection', {
        instruction: input.instruction,
        currentSection: {
            componentType: input.currentSection.componentType,
            variant: input.currentSection.variant,
            slots: input.currentSection.slots,
        },
        siteContext: input.siteContext,
    })) as {
        componentType: string;
        variant: string;
        slots: Record<string, any>;
    };

    return {
        id: input.currentSection.id,
        componentType: result.componentType || input.currentSection.componentType,
        variant: result.variant || input.currentSection.variant,
        slots: { ...input.currentSection.slots, ...result.slots },
    };
}
