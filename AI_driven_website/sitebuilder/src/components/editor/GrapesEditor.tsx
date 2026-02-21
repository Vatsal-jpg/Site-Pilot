'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronDown, Palette, Monitor, Tablet, Smartphone,
    Loader2, Sparkles, Save, Check, Send,
} from 'lucide-react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { getSite, updateSite } from '@/lib/store';
import { renderPageToHTML, renderSection, getBrandTokens } from '@/lib/htmlRenderer';
import { getAllComponents } from '@/lib/componentRegistry';
import { useToast } from '@/components/ui/Toast';
import RightPanel from './RightPanel';
import type { Site, Page, Section } from '@/lib/types';

export default function GrapesEditor() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const siteId = params.siteId as string;
    const editorRef = useRef<Editor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [editorReady, setEditorReady] = useState(false);
    const [site, setSite] = useState<Site | null>(null);
    const [currentPageId, setCurrentPageId] = useState<string>('');
    const [pageDropdown, setPageDropdown] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // Load site
    useEffect(() => {
        const s = getSite(siteId);
        if (!s) {
            router.push('/dashboard');
            return;
        }
        setSite(s);
        if (s.pages.length > 0) {
            setCurrentPageId(s.pages[0].id);
        }
    }, [siteId, router]);

    const currentPage = site?.pages.find((p) => p.id === currentPageId) ?? null;

    // Initialize GrapesJS
    useEffect(() => {
        if (!containerRef.current || !site || !currentPage || editorRef.current) return;

        const tokens = getBrandTokens(site);
        const html = renderPageToHTML(currentPage, tokens);

        const editor = grapesjs.init({
            container: containerRef.current,
            fromElement: false,
            height: '100%',
            width: 'auto',
            storageManager: false,
            panels: { defaults: [] },
            deviceManager: {
                devices: [
                    { name: 'Desktop', width: '' },
                    { name: 'Tablet', width: '768px', widthMedia: '992px' },
                    { name: 'Mobile', width: '375px', widthMedia: '480px' },
                ],
            },
            canvas: {
                styles: [],
            },
        });

        // Load HTML into canvas
        editor.setComponents(html);

        // Auto-save on changes (debounced)
        editor.on('change:changesCount', () => {
            setSaveStatus('saving');
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                const editorHtml = editor.getHtml();
                const editorCss = editor.getCss();

                if (site && currentPage) {
                    const updatedPages = site.pages.map((p) =>
                        p.id === currentPage.id
                            ? { ...p, customHtml: editorHtml, customCss: editorCss }
                            : p
                    );
                    updateSite(siteId, { pages: updatedPages as Page[] });
                    setSite((prev) => prev ? { ...prev, pages: updatedPages as Page[] } : prev);
                }
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }, 2000);
        });

        editorRef.current = editor;
        setEditorReady(true);

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
            setEditorReady(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [site?.id, currentPageId]);

    // Switch pages
    const switchPage = useCallback((pageId: string) => {
        if (!site) return;
        const page = site.pages.find((p) => p.id === pageId);
        if (!page || !editorRef.current) return;

        const tokens = getBrandTokens(site);
        const html = renderPageToHTML(page, tokens);
        editorRef.current.setComponents(html);
        setCurrentPageId(pageId);
        setPageDropdown(false);
    }, [site]);

    // Device switching
    const switchDevice = useCallback((d: 'desktop' | 'tablet' | 'mobile') => {
        setDevice(d);
        if (!editorRef.current) return;
        const map = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
        editorRef.current.setDevice(map[d]);
    }, []);

    // Add component section
    const addSection = useCallback((componentName: string) => {
        if (!editorRef.current || !site) return;
        const tokens = getBrandTokens(site);
        const section: Section = {
            id: crypto.randomUUID(),
            componentType: componentName,
            variant: 'dark',
            slots: {},
        };
        const html = renderSection(section, tokens);
        editorRef.current.addComponents(html);
        showToast(`Added ${componentName}`, 'success');
    }, [site, showToast]);

    // AI edit
    const handleAiEdit = useCallback(async () => {
        if (!aiInput.trim() || !editorRef.current || !site) return;
        const selected = editorRef.current.getSelected();
        if (!selected) {
            showToast('Select an element first', 'error');
            return;
        }

        setAiLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'editSection',
                    payload: {
                        instruction: aiInput,
                        currentSection: {
                            componentType: selected.getName?.() || 'Unknown',
                            variant: 'dark',
                            slots: {},
                        },
                        siteContext: {
                            siteName: site.name,
                            brandColor: site.brandColor,
                            businessType: site.businessType,
                        },
                    },
                }),
            });

            if (!res.ok) throw new Error('AI edit failed');

            const result = await res.json();
            const tokens = getBrandTokens(site);
            const newHtml = renderSection(result as Section, tokens);
            selected.replaceWith(newHtml);
            setAiInput('');
            showToast('AI edit applied!', 'success');
        } catch (err) {
            showToast((err as Error).message, 'error');
        } finally {
            setAiLoading(false);
        }
    }, [aiInput, site, showToast]);

    // Publish
    const handlePublish = useCallback(() => {
        if (!site) return;
        updateSite(siteId, { status: 'published' });
        setSite((prev) => prev ? { ...prev, status: 'published' } : prev);
        showToast('🎉 Site published!', 'success');
    }, [site, siteId, showToast]);

    if (!site) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        );
    }

    const allComponents = getAllComponents();
    const componentsByCategory = new Map<string, typeof allComponents>();
    for (const c of allComponents) {
        const list = componentsByCategory.get(c.category) ?? [];
        list.push(c);
        componentsByCategory.set(c.category, list);
    }

    return (
        <div className="h-screen flex flex-col bg-[#0f0f0f] overflow-hidden">
            {/* ─── TOP BAR ─────────────────────────────────────────── */}
            <div className="h-12 bg-[#0f0f0f] border-b border-[#1a1a1a] flex items-center px-3 gap-2 shrink-0 z-20">
                {/* Logo / Back */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition mr-2"
                >
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                </button>

                {/* Site name + save status */}
                <span className="text-sm text-white font-medium truncate max-w-[140px]">{site.name}</span>
                <div className="flex items-center gap-1 mr-2">
                    {saveStatus === 'saving' && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Saving...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Saved
                        </span>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-[#2e2e2e] mx-1" />

                {/* Page Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setPageDropdown(!pageDropdown)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition"
                    >
                        {currentPage?.name ?? 'Page'}
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {pageDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg shadow-xl py-1 w-40 z-30">
                            {site.pages.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => switchPage(p.id)}
                                    className={`w-full text-left px-3 py-1.5 text-xs transition ${p.id === currentPageId
                                        ? 'text-purple-400 bg-purple-500/10'
                                        : 'text-gray-300 hover:bg-[#242424]'
                                        }`}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-[#2e2e2e] mx-1" />

                {/* Style Guide */}
                <button
                    onClick={() => router.push(`/styleguide/${siteId}`)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition"
                    title="Style Guide"
                >
                    <Palette className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Style Guide</span>
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-[#2e2e2e] mx-1" />

                {/* Device switcher */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => switchDevice('desktop')}
                        className={`p-1.5 rounded transition ${device === 'desktop' ? 'text-white bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => switchDevice('tablet')}
                        className={`p-1.5 rounded transition ${device === 'tablet' ? 'text-white bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Tablet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => switchDevice('mobile')}
                        className={`p-1.5 rounded transition ${device === 'mobile' ? 'text-white bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Publish */}
                <button
                    onClick={handlePublish}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5"
                >
                    {site.status === 'published' ? (
                        <><Check className="w-3.5 h-3.5" /> Published</>
                    ) : (
                        'Publish'
                    )}
                </button>
            </div>

            {/* ─── MAIN BODY ───────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT PANEL — Blocks + AI */}
                <div className="w-[260px] bg-[#0f0f0f] border-r border-[#1a1a1a] flex flex-col shrink-0 overflow-y-auto">
                    {/* Blocks / Components */}
                    <div className="p-3 border-b border-[#1a1a1a]">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Components</h3>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                            {Array.from(componentsByCategory.entries()).map(([cat, comps]) => (
                                <div key={cat}>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">{cat}</p>
                                    <div className="space-y-0.5">
                                        {comps.map((c) => (
                                            <button
                                                key={c.name}
                                                onClick={() => addSection(c.name)}
                                                className="w-full text-left px-2 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition truncate"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Edit Panel */}
                    <div className="p-3 flex-1">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" /> AI Edit
                        </h3>
                        <p className="text-[10px] text-gray-600 mb-2">
                            Select an element on canvas, then describe your edit.
                        </p>
                        <textarea
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="e.g. Make the headline more energetic and add a secondary CTA"
                            rows={4}
                            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500 transition"
                        />
                        <button
                            onClick={handleAiEdit}
                            disabled={aiLoading || !aiInput.trim()}
                            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                        >
                            {aiLoading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying...</>
                            ) : (
                                <><Send className="w-3.5 h-3.5" /> Apply AI Edit</>
                            )}
                        </button>
                    </div>
                </div>

                {/* CANVAS */}
                <div className="flex-1 bg-[#1a1a1a] overflow-hidden">
                    <div ref={containerRef} className="h-full w-full" />
                </div>

                {/* RIGHT PANEL — Styles */}
                {editorReady && (
                    <RightPanel editor={editorRef.current} site={site} />
                )}
            </div>

            {/* Hide GrapesJS panels we don't need */}
            <style>{`
        .gjs-cv-canvas { top: 0 !important; }
        .gjs-pn-panels { display: none !important; }
        .gjs-one-bg { background-color: #1a1a1a !important; }
        .gjs-two-color { color: #ffffff !important; }
        .gjs-three-bg { background-color: #242424 !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #7c5cfc !important; }
        .gjs-frame { background: #0f0f0f !important; }
      `}</style>
        </div>
    );
}
