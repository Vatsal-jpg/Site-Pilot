'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, X } from 'lucide-react';
import { getSite, updateSite } from '@/lib/store';
import { getBrandTokens } from '@/lib/htmlRenderer';
import { getAllComponents } from '@/lib/componentRegistry';
import type { Site } from '@/lib/types';

export default function StyleGuidePage() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.siteId as string;
    const [site, setSite] = useState<Site | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getSite(siteId).then(s => setSite(s));
    }, [siteId]);

    if (!site) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    const tokens = getBrandTokens(site);

    // Gather unique components used across all pages
    const usedComponents = new Map<string, Set<string>>();
    for (const page of site.pages) {
        for (const section of page.sections) {
            const set = usedComponents.get(section.componentType) ?? new Set();
            set.add(page.name);
            usedComponents.set(section.componentType, set);
        }
    }

    const allComponents = getAllComponents();
    const usedDefs = Array.from(usedComponents.entries()).map(([name, pages]) => ({
        name,
        pages: Array.from(pages),
        category: allComponents.find((c) => c.name === name)?.category ?? 'Unknown',
    }));

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            updateSite(siteId, { logoUrl: base64 });
            setSite((prev) => (prev ? { ...prev, logoUrl: base64 } : prev));
        };
        reader.readAsDataURL(file);
    };

    const colors = [
        { name: 'Primary', hex: tokens.colorPrimary },
        { name: 'Background', hex: tokens.colorBg },
        { name: 'Surface', hex: '#1a1a1a' },
        { name: 'Text', hex: tokens.colorText },
        { name: 'Muted', hex: '#6b7280' },
    ];

    const typeScale = [
        { label: 'Display 1', size: '72px', weight: 800, font: tokens.fontHeading, color: 'text-white', sample: site.name || 'Display Heading' },
        { label: 'H1', size: '48px', weight: 700, font: tokens.fontHeading, color: 'text-white', sample: 'Heading One' },
        { label: 'H2', size: '36px', weight: 700, font: tokens.fontHeading, color: 'text-white', sample: 'Heading Two' },
        { label: 'H3', size: '24px', weight: 600, font: tokens.fontHeading, color: 'text-white', sample: 'Heading Three' },
        { label: 'Body Lg', size: '18px', weight: 400, font: tokens.fontBody, color: 'text-gray-300', sample: 'Body large text for important paragraphs and descriptions.' },
        { label: 'Body', size: '16px', weight: 400, font: tokens.fontBody, color: 'text-gray-400', sample: 'Regular body text used throughout the site for content.' },
        { label: 'Small', size: '13px', weight: 400, font: tokens.fontBody, color: 'text-gray-500', sample: 'Small text for captions and metadata' },
        { label: 'Label', size: '11px', weight: 500, font: tokens.fontBody, color: 'text-gray-400', sample: 'LABEL TEXT', transform: 'uppercase' as const, tracking: '0.1em' },
    ];

    const fontHeadingUrl = encodeURIComponent(tokens.fontHeading);
    const fontBodyUrl = encodeURIComponent(tokens.fontBody);

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Google Fonts */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href={`https://fonts.googleapis.com/css2?family=${fontHeadingUrl}:wght@400;600;700;800&family=${fontBodyUrl}:wght@400;500;600&display=swap`}
                rel="stylesheet"
            />

            {/* Top Nav */}
            <nav className="bg-[#0f0f0f] border-b border-[#1a1a1a] h-12 flex items-center px-4 sticky top-0 z-30">
                <button
                    onClick={() => router.push(`/editor/${siteId}`)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition mr-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-white font-medium">Style Guide</span>
                <span className="ml-auto text-xs text-gray-400">{site.name}</span>
            </nav>

            {/* Content */}
            <div className="max-w-[900px] mx-auto px-10 py-16 space-y-20">

                {/* ─── SECTION 1: Colors ──────────────────────────────── */}
                <section>
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">Colors</h2>
                    <div className="flex gap-6 flex-wrap">
                        {colors.map((c) => (
                            <div key={c.name} className="flex flex-col items-center">
                                <div
                                    className="w-20 h-20 rounded-xl border border-[#2e2e2e]"
                                    style={{ backgroundColor: c.hex }}
                                />
                                <span className="text-xs text-gray-400 mt-2">{c.name}</span>
                                <span className="text-xs text-gray-500 font-mono">{c.hex}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── SECTION 2: Typography ─────────────────────────── */}
                <section>
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">Typography</h2>
                    <div className="space-y-6">
                        {typeScale.map((t) => (
                            <div key={t.label} className="flex items-baseline gap-6">
                                <span className="text-xs text-gray-500 w-24 shrink-0 text-right">{t.label}</span>
                                <span
                                    className={t.color}
                                    style={{
                                        fontSize: t.size,
                                        fontWeight: t.weight,
                                        fontFamily: `'${t.font}', sans-serif`,
                                        lineHeight: 1.2,
                                        textTransform: t.transform,
                                        letterSpacing: t.tracking,
                                    }}
                                >
                                    {t.sample}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── SECTION 3: Buttons ────────────────────────────── */}
                <section>
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">Buttons</h2>
                    <div className="flex gap-4 flex-wrap items-center">
                        <button
                            className="px-6 py-3 rounded-lg font-semibold text-white text-sm transition hover:opacity-90"
                            style={{ backgroundColor: tokens.colorPrimary }}
                        >
                            Primary
                        </button>
                        <button
                            className="px-6 py-3 rounded-lg font-semibold text-sm border transition hover:bg-white/5"
                            style={{ borderColor: tokens.colorText, color: tokens.colorText }}
                        >
                            Secondary
                        </button>
                        <button
                            className="px-6 py-3 rounded-lg font-semibold text-sm transition hover:opacity-80"
                            style={{ color: tokens.colorPrimary }}
                        >
                            Ghost
                        </button>
                        <button className="px-6 py-3 rounded-lg font-semibold text-white text-sm bg-red-600 transition hover:bg-red-700">
                            Destructive
                        </button>
                    </div>
                </section>

                {/* ─── SECTION 4: Components Used ────────────────────── */}
                <section>
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">Components</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {usedDefs.map((comp) => (
                            <div
                                key={comp.name}
                                className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2e2e2e]"
                            >
                                <p className="text-sm font-semibold text-white">{comp.name}</p>
                                <span className="text-xs text-gray-500">{comp.category}</span>
                                <p className="text-xs text-gray-600 mt-2">
                                    Used on: {comp.pages.join(', ')}
                                </p>
                                <button className="text-xs text-purple-400 mt-3 cursor-pointer hover:text-purple-300 transition">
                                    Edit with AI
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── SECTION 5: Logo ───────────────────────────────── */}
                <section>
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">Logo</h2>
                    {site.logoUrl ? (
                        <div className="flex gap-6">
                            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-8 flex items-center justify-center">
                                <img src={site.logoUrl} alt="Logo on dark" className="max-h-16 object-contain" />
                            </div>
                            <div className="bg-white rounded-xl p-8 flex items-center justify-center">
                                <img src={site.logoUrl} alt="Logo on light" className="max-h-16 object-contain" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => logoInputRef.current?.click()}
                                className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2e2e2e] rounded-xl py-8 flex flex-col items-center gap-2 hover:border-[#444] transition cursor-pointer"
                            >
                                <ImageIcon className="w-6 h-6 text-gray-500" />
                                <span className="text-sm text-gray-400">Upload logo</span>
                                <span className="text-xs text-gray-500">PNG, SVG recommended</span>
                            </button>
                            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
