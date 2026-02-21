'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Circle } from 'lucide-react';
import { generateFullSite } from '@/lib/aiService';
import { renderPageToHTML, getBrandTokens } from '@/lib/htmlRenderer';
import type { PromptData } from './PromptPage';
import type { StructuredPage } from './StructurePage';
import type { Site, Page } from '@/lib/types';

interface PreviewPageProps {
    promptData: PromptData;
    pages: StructuredPage[];
    onComplete: (site: Site) => void;
    onBack: () => void;
}

export default function PreviewPage({ promptData, pages, onComplete, onBack }: PreviewPageProps) {
    const router = useRouter();
    const [generating, setGenerating] = useState(true);
    const [site, setSite] = useState<Site | null>(null);
    const [progressText, setProgressText] = useState('Analyzing your prompt...');
    const [progressPercent, setProgressPercent] = useState(5);
    const [completedPages, setCompletedPages] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState<string>('');
    const [pageHtmlMap, setPageHtmlMap] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const hasGenerated = useRef(false);

    const pageNames = useMemo(() => pages.map((p) => p.name), [pages]);

    useEffect(() => {
        if (hasGenerated.current) return;
        hasGenerated.current = true;

        generateFullSite({
            prompt: promptData.prompt,
            businessType: promptData.businessType,
            siteName: promptData.siteName,
            brandColor: promptData.brandColor,
            logoUrl: promptData.logoUrl,
            palette: promptData.selectedPalette,
            uploadedImages: promptData.uploadedImages,
            planPageLimit: pages.length,
            onProgress: (step, percent) => {
                setProgressText(step);
                setProgressPercent(percent);

                const match = step.match(/Generating (.+)\.\.\./);
                if (match) {
                    setCurrentPage(match[1]);
                    setCompletedPages((prev) => {
                        const updated = new Set(prev);
                        const curIdx = pageNames.indexOf(match[1]);
                        pageNames.forEach((name, nameIdx) => {
                            if (nameIdx < curIdx) updated.add(name);
                        });
                        return updated;
                    });
                }

                if (step === 'Done!') {
                    setCompletedPages(new Set(pageNames));
                    setCurrentPage('');
                }
            },
        })
            .then((generatedSite) => {
                setSite(generatedSite);
                const tokens = getBrandTokens(generatedSite);
                const htmlMap: Record<string, string> = {};
                generatedSite.pages.forEach((page: Page) => {
                    htmlMap[page.id] = renderPageToHTML(page, tokens);
                });
                setPageHtmlMap(htmlMap);
                setGenerating(false);
            })
            .catch((err) => {
                setError(err.message);
                setGenerating(false);
            });
    }, [promptData, pages, pageNames]);

    if (error) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>
                <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                    <p style={{ color: '#f87171', marginBottom: '16px', fontSize: '14px' }}>{error}</p>
                    <button onClick={onBack} style={{ background: '#7c5cfc', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    // ─── Generating state ─────────────────────────────────────
    if (generating) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                {/* Left panel */}
                <div style={{ width: '380px', flexShrink: 0, background: '#0f0f0f', padding: '40px 32px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                        STEP 3 OF 3
                    </div>
                    <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '32px' }}>
                        <div style={{ height: '100%', width: `${progressPercent}%`, background: '#7c5cfc', borderRadius: '2px', transition: 'width 0.7s ease' }} />
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Building your site...</h1>
                    <p style={{ fontSize: '13px', color: '#7c5cfc', marginBottom: '32px', minHeight: '20px' }}>{progressText}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pageNames.map((name) => {
                            const isDone = completedPages.has(name);
                            const isCurrent = currentPage === name;
                            return (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {isDone ? (
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Check style={{ width: '12px', height: '12px', color: '#4ade80' }} />
                                        </div>
                                    ) : isCurrent ? (
                                        <Loader2 style={{ width: '20px', height: '20px', color: '#7c5cfc', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                                    ) : (
                                        <Circle style={{ width: '20px', height: '20px', color: '#2e2e2e', flexShrink: 0 }} />
                                    )}
                                    <span style={{ fontSize: '13px', color: isDone ? 'rgba(255,255,255,0.7)' : isCurrent ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: isCurrent ? 600 : 400 }}>
                                        {name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: skeleton grid */}
                <div style={{ flex: 1, background: '#111', overflow: 'auto', padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                        {pageNames.map((name, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', borderRadius: '8px 8px 0 0', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2e2e2e' }} />
                                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{name}</span>
                                </div>
                                <div style={{ height: '400px', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 12px 12px', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ height: '20px', width: '60%', background: '#1a1a1a', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                    <div style={{ height: '80px', background: '#1a1a1a', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                        {[0, 1, 2].map(j => (
                                            <div key={j} style={{ height: '60px', background: '#1a1a1a', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1 + j * 0.05}s` }} />
                                        ))}
                                    </div>
                                    <div style={{ height: '48px', background: '#1a1a1a', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                                    <div style={{ height: '48px', background: '#1a1a1a', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
                `}</style>
            </div>
        );
    }

    // ─── Ready state ──────────────────────────────────────────
    const sitePages = site?.pages ?? [];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Left panel */}
            <div style={{ width: '380px', flexShrink: 0, background: '#0f0f0f', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '40px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                        STEP 3 OF 3
                    </div>
                    <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '32px' }}>
                        <div style={{ height: '100%', width: '100%', background: '#7c5cfc', borderRadius: '2px' }} />
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                        Preview your site
                    </h1>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '8px' }}>
                        Click on any page to open it in the editor.
                    </p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '32px' }}>
                        Edit, swap, and add sections to pages.
                    </p>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                                📄 {sitePages.length} pages generated
                            </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                            You can customize everything in the editor.
                        </p>
                    </div>

                    <div style={{ flex: 1 }} />

                    <button
                        onClick={() => site && onComplete(site)}
                        style={{
                            width: '100%',
                            background: '#7c5cfc',
                            color: '#fff',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Continue building →
                    </button>
                </div>
            </div>

            {/* Right: grid of page previews */}
            <div style={{ flex: 1, background: '#111', overflow: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px', padding: '40px' }}>
                    {sitePages.map((page) => (
                        <div key={page.id} style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Page name tab */}
                            <div style={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderBottom: 'none',
                                borderRadius: '8px 8px 0 0',
                                padding: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2e2e2e' }} />
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{page.name}</span>
                            </div>

                            {/* Preview window */}
                            <div
                                onClick={() => site && router.push('/editor/' + site.id)}
                                className="group"
                                style={{
                                    width: '100%',
                                    height: '400px',
                                    overflow: 'hidden',
                                    borderRadius: '0 0 12px 12px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    background: '#0f0f0f',
                                    transition: 'border-color 0.2s',
                                }}
                            >
                                {/* Scale wrapper */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '1440px',
                                    height: '1440px',
                                    transform: 'scale(0.278)',
                                    transformOrigin: 'top left',
                                    pointerEvents: 'none',
                                }}>
                                    <iframe
                                        srcDoc={pageHtmlMap[page.id] || ''}
                                        style={{
                                            width: '1440px',
                                            height: '1440px',
                                            border: 'none',
                                            background: '#0f0f0f',
                                        }}
                                        sandbox="allow-same-origin"
                                        title={page.name}
                                    />
                                </div>

                                {/* Hover overlay */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(124,92,252,0.1)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '0 0 12px 12px',
                                }}
                                    className="group-hover:opacity-100"
                                >
                                    <span style={{
                                        background: '#7c5cfc',
                                        color: '#fff',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                    }}>Open in Editor →</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
                .group:hover { border-color: #7c5cfc !important; }
            `}</style>
        </div>
    );
}
