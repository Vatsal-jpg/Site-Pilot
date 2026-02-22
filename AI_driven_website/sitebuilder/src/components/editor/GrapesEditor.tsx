'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { updatePageContent } from '@/lib/store';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { getSite, updateSite } from '@/lib/store';
import { editSectionWithAI } from '@/lib/aiService';
import { renderPageToHTML, renderSection, getBrandTokens } from '@/lib/htmlRenderer';
import { useToast } from '@/components/ui/Toast';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import LeftPanel from './LeftPanel';
import type { Site, Page, Section } from '@/lib/types';
import { api } from '@/lib/api';

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
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [aiLoading, setAiLoading] = useState(false);
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // Load site
    useEffect(() => {
        async function fetchSite() {
            const s = await getSite(siteId);
            if (!s) {
                router.push('/dashboard');
                return;
            }
            setSite(s);
            if (s.pages.length > 0) {
                setCurrentPageId(s.pages[0].id);
            }
        }
        fetchSite();
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
            saveTimerRef.current = setTimeout(async () => {
                const editorHtml = editor.getHtml();
                const editorCss = editor.getCss();

                if (site && currentPage) {
                    const updatedPage = {
                        ...currentPage,
                        customHtml: editorHtml,
                        customCss: editorCss
                    };

                    const updatedPages = site.pages.map((p) =>
                        p.id === currentPage.id ? updatedPage : p
                    );

                    try {
                        // ONLY send the single page to the backend
                        await updatePageContent(siteId, updatedPage);

                        setSite((prev) => prev ? { ...prev, pages: updatedPages as Page[] } : prev);
                        setSaveStatus('saved');
                        setTimeout(() => setSaveStatus('idle'), 2000);
                    } catch (e) {
                        showToast('Failed to save', 'error');
                        setSaveStatus('idle');
                    }
                }
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
    const handleAiEdit = useCallback(async (aiInput: string) => {
        if (!aiInput.trim() || !editorRef.current || !site) return;
        const selected = editorRef.current.getSelected();
        if (!selected) {
            showToast('Select an element first', 'error');
            return;
        }

        setAiLoading(true);
        try {
            const result = await editSectionWithAI({
                instruction: aiInput,
                currentSection: {
                    id: crypto.randomUUID(),
                    componentType: selected.getName?.() || 'Unknown',
                    variant: 'dark',
                    slots: {},
                },
                siteContext: {
                    siteName: site.name,
                    brandColor: site.brandColor,
                    businessType: site.businessType,
                },
            });
            const tokens = getBrandTokens(site);
            const newHtml = renderSection(result as Section, tokens);
            selected.replaceWith(newHtml);
            showToast('AI edit applied!', 'success');
        } catch (err) {
            showToast((err as Error).message, 'error');
        } finally {
            setAiLoading(false);
        }
    }, [site, showToast]);

    // Publish
    const handlePublish = useCallback(async () => {
        if (!site || !siteId) return;
        try {
            const res = await api.post(`/api/sites/${siteId}/publish`, {});
            if (res.success) {
                setSite((prev) => prev ? { ...prev, status: 'published', liveUrl: res.liveUrl } : prev);
                showToast(`Published! Live at ${res.liveUrl}`, 'success');
            } else {
                showToast(res.error || 'Failed to publish', 'error');
            }
        } catch (e) {
            showToast('Failed to publish', 'error');
        }
    }, [site, siteId, showToast]);

    // Restore version
    const handleRestoreVersion = useCallback(() => {
        // Simple reload to fetch latest restored DB state
        window.location.reload();
    }, []);

    if (!site || !currentPageId) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0f0f0f] overflow-hidden">
            <TopBar
                site={site}
                currentPageId={currentPageId}
                switchPage={switchPage}
                saveStatus={saveStatus}
                device={device}
                switchDevice={switchDevice}
                handlePublish={handlePublish}
            />

            <div className="flex flex-1 overflow-hidden">
                <LeftPanel
                    siteId={siteId}
                    addSection={addSection}
                    handleAiEdit={handleAiEdit}
                    aiLoading={aiLoading}
                    onRestoreVersion={handleRestoreVersion}
                />

                <div className="flex-1 bg-[#1a1a1a] overflow-hidden relative">
                    <div ref={containerRef} className="h-full w-full" />
                </div>

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
