'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { getAllSites, saveSite } from '@/lib/store';
import { renderPageToHTML, getBrandTokens } from '@/lib/htmlRenderer';
import StartModal from '@/components/onboarding/StartModal';
import type { Site } from '@/lib/types';

export default function DashboardPage() {
    const router = useRouter();
    const [sites, setSites] = useState<Site[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setSites(getAllSites());
    }, []);

    const createBlankSite = () => {
        const id = crypto.randomUUID();
        const blankSite: Site = {
            id,
            name: 'Untitled Site',
            prompt: '',
            businessType: '',
            brandColor: '#7c5cfc',
            logoUrl: '',
            pages: [
                {
                    id: crypto.randomUUID(),
                    name: 'Home',
                    slug: '/',
                    sections: [],
                },
            ],
            createdAt: new Date().toISOString(),
            status: 'draft',
        };
        saveSite(blankSite);
        router.push(`/editor/${id}`);
    };

    const handleSelect = (type: 'ai' | 'template' | 'blank') => {
        setModalOpen(false);
        if (type === 'ai') {
            router.push('/onboarding');
        } else {
            // both template and blank → create blank site for now
            createBlankSite();
        }
    };

    const getFirstPagePreview = (site: Site): string | null => {
        if (!site.pages || site.pages.length === 0) return null;
        if (site.pages[0].sections.length === 0) return null;
        try {
            const tokens = getBrandTokens(site);
            return renderPageToHTML(site.pages[0], tokens);
        } catch {
            return null;
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return iso;
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* ─── Top Navbar ──────────────────────────────────────── */}
            <nav className="bg-[#0f0f0f] border-b border-[#1a1a1a] sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold text-sm">SiteBuilder</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        U
                    </div>
                </div>
            </nav>

            {/* ─── Main Content ────────────────────────────────────── */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header row */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white">My sites</h1>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                    >
                        <Plus className="w-4 h-4" />
                        New site
                    </button>
                </div>

                {/* Sites grid or empty state */}
                {sites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-lg text-gray-400 mb-6">No sites yet</p>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
                        >
                            Create your first site
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sites.map((site) => {
                            const previewHtml = getFirstPagePreview(site);
                            return (
                                <div
                                    key={site.id}
                                    onClick={() => router.push(`/editor/${site.id}`)}
                                    className="bg-[#111111] rounded-xl border border-[#1a1a1a] overflow-hidden hover:border-[#2e2e2e] transition cursor-pointer group"
                                >
                                    {/* Preview area */}
                                    <div className="h-48 overflow-hidden bg-[#0f0f0f] relative">
                                        {previewHtml ? (
                                            <iframe
                                                srcDoc={previewHtml}
                                                title={site.name}
                                                sandbox="allow-same-origin"
                                                className="pointer-events-none border-none"
                                                style={{
                                                    width: 1280,
                                                    height: 900,
                                                    transform: 'scale(0.25)',
                                                    transformOrigin: 'top left',
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center"
                                                style={{
                                                    background: `linear-gradient(135deg, ${site.brandColor}22, ${site.brandColor}08)`,
                                                }}
                                            >
                                                <span
                                                    className="text-5xl font-bold opacity-20"
                                                    style={{ color: site.brandColor }}
                                                >
                                                    {site.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition">
                                            {site.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">{formatDate(site.createdAt)}</p>
                                        <span
                                            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${site.status === 'published'
                                                    ? 'bg-green-500/15 text-green-400'
                                                    : 'bg-gray-500/15 text-gray-400'
                                                }`}
                                        >
                                            {site.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Start Modal */}
            <StartModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelect}
            />
        </div>
    );
}
