import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
    COMPONENT_TYPES,
    DEFAULT_LAYOUTS,
    DEFAULT_PROPS,
} from "@/data/componentTypes";
import type { TemplateDefinition } from "@/data/templates";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Branding {
    businessName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    font: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    updatedHtml?: string;
}

export interface PageComponent {
    id: string;
    componentId: string;       // e.g. "hero", "navbar"
    orderIndex: number;
    layout: Record<string, string | number | boolean>;
    props: Record<string, unknown>;
    spacing: string;            // "none" | "small" | "medium" | "large"
    generatedHtml: string | null;
    isGenerating: boolean;
    chatHistory: ChatMessage[];
}

export interface Page {
    id: string;
    title: string;
    slug: string;
    components: PageComponent[];
}

export interface BuilderLocationState {
    branding?: Branding;
    userPrompt?: string;
    template?: TemplateDefinition;
    suggestedLayout?: string[];
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBuilder() {
    const location = useLocation();
    const locState = (location.state as BuilderLocationState) || {};

    // Branding (from branding page, or defaults)
    const [branding] = useState<Branding>(
        locState.branding ?? {
            businessName: "Acme Corp",
            tagline: "Building the future",
            primaryColor: "#090979",
            secondaryColor: "#F8FAFC",
            font: "Inter",
        }
    );

    const [userPrompt] = useState<string>(locState.userPrompt ?? "");
    const [template] = useState<TemplateDefinition | null>(locState.template ?? null);
    const [suggestedLayout, setSuggestedLayout] = useState<string[]>(
        locState.suggestedLayout ?? locState.template?.suggestedComponents ?? []
    );

    // Pages
    const [pages, setPages] = useState<Page[]>([
        { id: "page-home", title: "Home", slug: "home", components: [] },
    ]);

    const [activePage, setActivePage] = useState("page-home");
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [saved, setSaved] = useState(true);

    const currentPage = pages.find((p) => p.id === activePage)!;
    const canvas = currentPage.components;
    const selectedComponent = canvas.find((c) => c.id === selectedComponentId) ?? null;

    // ── Helpers ──────────────────────────────────────────────────────────────

    function makeComponent(componentId: string, orderIndex: number): PageComponent {
        const defaultProps = { ...(DEFAULT_PROPS[componentId] ?? {}) };

        // Auto-fill branding values
        if (componentId === "navbar") {
            defaultProps.logo = branding.businessName;
            defaultProps.ctaText = "Get Started";
        }
        if (componentId === "hero") {
            defaultProps.heading = branding.businessName;
            defaultProps.subheading = branding.tagline;
        }
        if (componentId === "footer") {
            defaultProps.copyright = `© 2026 ${branding.businessName}`;
        }

        return {
            id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            componentId,
            orderIndex,
            layout: { ...(DEFAULT_LAYOUTS[componentId] ?? {}) },
            props: defaultProps,
            spacing: "medium",
            generatedHtml: null,
            isGenerating: false,
            chatHistory: [],
        };
    }

    // ── Canvas actions ───────────────────────────────────────────────────────

    const addComponent = useCallback(
        (componentId: string) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    const comp = makeComponent(componentId, p.components.length);
                    return { ...p, components: [...p.components, comp] };
                })
            );
            setSaved(false);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activePage, branding]
    );

    const removeComponent = useCallback(
        (id: string) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    return {
                        ...p,
                        components: p.components
                            .filter((c) => c.id !== id)
                            .map((c, i) => ({ ...c, orderIndex: i })),
                    };
                })
            );
            if (selectedComponentId === id) setSelectedComponentId(null);
            setSaved(false);
        },
        [activePage, selectedComponentId]
    );

    const moveComponent = useCallback(
        (idx: number, dir: -1 | 1) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    const arr = [...p.components];
                    const newIdx = idx + dir;
                    if (newIdx < 0 || newIdx >= arr.length) return p;
                    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
                    return { ...p, components: arr.map((c, i) => ({ ...c, orderIndex: i })) };
                })
            );
            setSaved(false);
        },
        [activePage]
    );

    const updateComponentProps = useCallback(
        (compId: string, key: string, value: unknown) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    return {
                        ...p,
                        components: p.components.map((c) =>
                            c.id === compId ? { ...c, props: { ...c.props, [key]: value } } : c
                        ),
                    };
                })
            );
            setSaved(false);
        },
        [activePage]
    );

    const updateComponentLayout = useCallback(
        (compId: string, key: string, value: string | number | boolean) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    return {
                        ...p,
                        components: p.components.map((c) =>
                            c.id === compId ? { ...c, layout: { ...c.layout, [key]: value } } : c
                        ),
                    };
                })
            );
            setSaved(false);
        },
        [activePage]
    );

    const updateComponentSpacing = useCallback(
        (compId: string, spacing: string) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    return {
                        ...p,
                        components: p.components.map((c) =>
                            c.id === compId ? { ...c, spacing } : c
                        ),
                    };
                })
            );
            setSaved(false);
        },
        [activePage]
    );

    const updateComponentHtml = useCallback(
        (compId: string, html: string) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    return {
                        ...p,
                        components: p.components.map((c) =>
                            c.id === compId ? { ...c, generatedHtml: html, isGenerating: false } : c
                        ),
                    };
                })
            );
        },
        [activePage]
    );

    // ── Use suggested layout ─────────────────────────────────────────────────

    const useSuggestedLayout = useCallback(() => {
        setPages((prev) =>
            prev.map((p) => {
                if (p.id !== activePage) return p;
                const comps = suggestedLayout.map((compId, i) => makeComponent(compId, i));
                return { ...p, components: comps };
            })
        );
        setSaved(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePage, suggestedLayout, branding]);

    // ── Add Page ──────────────────────────────────────────────────────────────

    const addPage = useCallback((title: string) => {
        const slug = title.toLowerCase().replace(/\s+/g, "-");
        const id = `page-${slug}-${Date.now()}`;
        setPages((prev) => [...prev, { id, title, slug, components: [] }]);
        setActivePage(id);
    }, []);

    // ── Chat (simulated) ──────────────────────────────────────────────────────

    const sendChatMessage = useCallback(
        (compId: string, message: string) => {
            setPages((prev) =>
                prev.map((p) => {
                    if (p.id !== activePage) return p;
                    return {
                        ...p,
                        components: p.components.map((c) => {
                            if (c.id !== compId) return c;
                            const userMsg: ChatMessage = {
                                id: `msg-${Date.now()}`,
                                role: "user",
                                text: message,
                            };
                            const aiMsg: ChatMessage = {
                                id: `msg-${Date.now() + 1}`,
                                role: "assistant",
                                text: "Updating... (API coming soon)",
                                updatedHtml: c.generatedHtml ?? undefined,
                            };
                            return {
                                ...c,
                                chatHistory: [...c.chatHistory, userMsg, aiMsg],
                            };
                        }),
                    };
                })
            );
        },
        [activePage]
    );

    return {
        // Data
        branding,
        userPrompt,
        template,
        suggestedLayout,
        setSuggestedLayout,
        pages,
        activePage,
        setActivePage,
        currentPage,
        canvas,
        selectedComponentId,
        setSelectedComponentId,
        selectedComponent,
        chatOpen,
        setChatOpen,
        saved,
        setSaved,

        // Actions
        addComponent,
        removeComponent,
        moveComponent,
        updateComponentProps,
        updateComponentLayout,
        updateComponentSpacing,
        updateComponentHtml,
        useSuggestedLayout,
        addPage,
        sendChatMessage,
        componentTypes: COMPONENT_TYPES,
    };
}
