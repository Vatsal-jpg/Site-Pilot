import componentsData from '@/data/components.json';
import pageRulesData from '@/data/pageRules.json';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SlotDefinition {
    key: string;
    type: 'text' | 'number' | 'image' | 'list' | 'boolean' | 'select';
    label: string;
    required: boolean;
    default?: string | number | boolean | unknown[];
    maxWords?: number;
    unsplashKeyword?: boolean;
    options?: string[];
    minItems?: number;
    maxItems?: number;
    itemShape?: Record<string, string>;
}

export interface ComponentDefinition {
    name: string;
    category: string;
    description: string;
    variants: string[];
    allowedPages: string[];
    maxPerPage: number;
    slots: SlotDefinition[];
}

interface PageRules {
    rules: {
        always: {
            first: string[];
            last: string[];
            maxSectionsPerPage: number;
            minSectionsPerPage: number;
        };
        once: string[];
        heroMustBeSecond: boolean;
        pageTypeDefaults: Record<string, string[]>;
    };
    businessTypeToPages: Record<string, string[]>;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const components = componentsData as Record<string, ComponentDefinition>;
const pageRules = pageRulesData as PageRules;

/**
 * Get a single component definition by name.
 */
export function getComponent(name: string): ComponentDefinition {
    const comp = components[name];
    if (!comp) {
        throw new Error(`Component "${name}" not found in registry.`);
    }
    return comp;
}

/**
 * Get all component definitions as a flat array.
 */
export function getAllComponents(): ComponentDefinition[] {
    return Object.values(components);
}

/**
 * Get all components that belong to a given category.
 */
export function getComponentsByCategory(category: string): ComponentDefinition[] {
    return Object.values(components).filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Validate a list of section names against the page rules.
 * Returns { valid, errors } where errors describes every failing rule.
 */
export function validateSectionList(sections: string[]): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const { always, once, heroMustBeSecond } = pageRules.rules;

    // ── Length checks ──────────────────────────────────────────────────────────
    if (sections.length < always.minSectionsPerPage) {
        errors.push(
            `Page must have at least ${always.minSectionsPerPage} sections (got ${sections.length}).`
        );
    }
    if (sections.length > always.maxSectionsPerPage) {
        errors.push(
            `Page must have at most ${always.maxSectionsPerPage} sections (got ${sections.length}).`
        );
    }

    // ── First must be a nav ────────────────────────────────────────────────────
    if (sections.length > 0 && !always.first.includes(sections[0])) {
        errors.push(
            `First section must be one of: ${always.first.join(', ')}. Got "${sections[0]}".`
        );
    }

    // ── Last must be a footer ──────────────────────────────────────────────────
    if (
        sections.length > 0 &&
        !always.last.includes(sections[sections.length - 1])
    ) {
        errors.push(
            `Last section must be one of: ${always.last.join(', ')}. Got "${sections[sections.length - 1]}".`
        );
    }

    // ── Hero must be second ────────────────────────────────────────────────────
    if (heroMustBeSecond && sections.length > 1) {
        const heroNames = Object.values(components)
            .filter((c) => c.category === 'Hero')
            .map((c) => c.name);
        if (!heroNames.includes(sections[1])) {
            errors.push(
                `Second section must be a Hero component. Got "${sections[1]}".`
            );
        }
    }

    // ── "once" components can appear at most once ──────────────────────────────
    const counts = new Map<string, number>();
    for (const s of sections) {
        counts.set(s, (counts.get(s) || 0) + 1);
    }
    for (const name of once) {
        if ((counts.get(name) || 0) > 1) {
            errors.push(`"${name}" may only appear once per page.`);
        }
    }

    // ── Every name must exist in the registry ──────────────────────────────────
    for (const s of sections) {
        if (!components[s]) {
            errors.push(`Unknown component "${s}".`);
        }
    }

    // ── Respect maxPerPage for each component ──────────────────────────────────
    for (const [name, count] of counts.entries()) {
        const def = components[name];
        if (def && count > def.maxPerPage) {
            errors.push(
                `"${name}" may appear at most ${def.maxPerPage} time(s) per page (got ${count}).`
            );
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Get the default section list for a page type (e.g. "home", "about").
 */
export function getPageDefaults(pageType: string): string[] {
    return pageRules.rules.pageTypeDefaults[pageType] ?? [];
}

/**
 * Get the recommended pages for a business type (e.g. "saas", "agency").
 */
export function getBusinessPages(businessType: string): string[] {
    return pageRules.businessTypeToPages[businessType] ?? [];
}

/**
 * Build a formatted string listing every component and its slot keys,
 * ready to inject into a Claude / LLM system prompt.
 */
export function buildSystemPromptContext(): string {
    const lines: string[] = [
        '## Available Website Components',
        '',
    ];

    const categories = new Map<string, ComponentDefinition[]>();
    for (const comp of Object.values(components)) {
        const list = categories.get(comp.category) ?? [];
        list.push(comp);
        categories.set(comp.category, list);
    }

    for (const [category, comps] of categories.entries()) {
        lines.push(`### ${category}`);
        for (const comp of comps) {
            const slotKeys = comp.slots.map((s) => s.key).join(', ');
            lines.push(`- **${comp.name}**: ${comp.description}`);
            lines.push(`  Slots: ${slotKeys}`);
            lines.push(`  Variants: ${comp.variants.join(', ')}`);
        }
        lines.push('');
    }

    // Append page-type defaults
    lines.push('## Page Type Defaults');
    for (const [page, defaults] of Object.entries(
        pageRules.rules.pageTypeDefaults
    )) {
        lines.push(`- **${page}**: ${defaults.join(' → ')}`);
    }
    lines.push('');

    // Append business-type → pages mapping
    lines.push('## Business Type → Recommended Pages');
    for (const [biz, pages] of Object.entries(pageRules.businessTypeToPages)) {
        lines.push(`- **${biz}**: ${pages.join(', ')}`);
    }

    return lines.join('\n');
}
