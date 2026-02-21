'use client';

import { useState, useEffect, useRef } from 'react';
import {
    FileText, MoreHorizontal, ChevronUp, ChevronDown,
    Trash2, Plus, Pencil, Loader2,
} from 'lucide-react';
import { generateSiteStructure } from '@/lib/aiService';
import { getAllComponents } from '@/lib/componentRegistry';
import type { PromptData } from './PromptPage';

export interface StructuredPage {
    name: string;
    slug: string;
    sections: string[];
}

interface StructurePageProps {
    promptData: PromptData;
    onComplete: (pages: StructuredPage[]) => void;
    onBack: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    Navigation: '#10b981',
    Footer: '#10b981',
    Hero: '#7c5cfc',
    Features: '#3b82f6',
    Content: '#3b82f6',
    'Social Proof': '#f59e0b',
    'Team & About': '#3b82f6',
    Conversion: '#ef4444',
};

function getCategoryColor(componentName: string): string {
    const all = getAllComponents();
    const comp = all.find((c) => c.name === componentName);
    if (!comp) return '#666';
    return CATEGORY_COLORS[comp.category] || '#666';
}

function getCategoryGroups() {
    const all = getAllComponents();
    const groups = new Map<string, string[]>();
    for (const c of all) {
        const list = groups.get(c.category) ?? [];
        list.push(c.name);
        groups.set(c.category, list);
    }
    return groups;
}

export default function StructurePage({ promptData, onComplete, onBack }: StructurePageProps) {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState('');
    const [pages, setPages] = useState<StructuredPage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [sectionMenu, setSectionMenu] = useState<string | null>(null);
    const [addMenuPage, setAddMenuPage] = useState<string | null>(null);
    const [renamingPage, setRenamingPage] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const hasGenerated = useRef(false);

    useEffect(() => {
        if (hasGenerated.current) return;
        hasGenerated.current = true;

        generateSiteStructure({
            prompt: promptData.prompt,
            businessType: promptData.businessType,
            siteName: promptData.siteName,
            planPageLimit: 5,
        })
            .then((result) => {
                setPages(result.pages);
                setSummary(result.summary);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [promptData]);

    const moveSectionUp = (pageIdx: number, sectionIdx: number) => {
        if (sectionIdx <= 0) return;
        setPages((prev) => {
            const updated = [...prev];
            const secs = [...updated[pageIdx].sections];
            [secs[sectionIdx - 1], secs[sectionIdx]] = [secs[sectionIdx], secs[sectionIdx - 1]];
            updated[pageIdx] = { ...updated[pageIdx], sections: secs };
            return updated;
        });
        setSectionMenu(null);
    };

    const moveSectionDown = (pageIdx: number, sectionIdx: number) => {
        setPages((prev) => {
            const updated = [...prev];
            const secs = [...updated[pageIdx].sections];
            if (sectionIdx >= secs.length - 1) return prev;
            [secs[sectionIdx], secs[sectionIdx + 1]] = [secs[sectionIdx + 1], secs[sectionIdx]];
            updated[pageIdx] = { ...updated[pageIdx], sections: secs };
            return updated;
        });
        setSectionMenu(null);
    };

    const deleteSection = (pageIdx: number, sectionIdx: number) => {
        setPages((prev) => {
            const updated = [...prev];
            const secs = updated[pageIdx].sections.filter((_, i) => i !== sectionIdx);
            updated[pageIdx] = { ...updated[pageIdx], sections: secs };
            return updated;
        });
        setSectionMenu(null);
    };

    const addSection = (pageIdx: number, componentName: string) => {
        setPages((prev) => {
            const updated = [...prev];
            const secs = [...updated[pageIdx].sections];
            // Insert before footer (last item)
            secs.splice(secs.length - 1, 0, componentName);
            updated[pageIdx] = { ...updated[pageIdx], sections: secs };
            return updated;
        });
        setAddMenuPage(null);
    };

    const deletePage = (pageIdx: number) => {
        setPages((prev) => prev.filter((_, i) => i !== pageIdx));
        setMenuOpen(null);
    };

    const renamePage = (pageIdx: number, newName: string) => {
        setPages((prev) => {
            const updated = [...prev];
            updated[pageIdx] = {
                ...updated[pageIdx],
                name: newName,
                slug: pageIdx === 0 ? '/' : `/${newName.toLowerCase().replace(/\s+/g, '-')}`,
            };
            return updated;
        });
        setRenamingPage(null);
        setMenuOpen(null);
    };

    // ─── Loading state ────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex min-h-screen">
                <div className="w-[480px] shrink-0 bg-[#0f0f0f] p-8 flex flex-col">
                    <div className="mb-8">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Step 2 of 3</span>
                        <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden mt-3">
                            <div className="h-full w-2/3 bg-purple-600 rounded-full" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Generating your structure...</h1>
                    <div className="flex items-center gap-3 mb-8">
                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                        <span className="text-sm text-purple-400">Building the best layout for your site</span>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300 leading-relaxed">{promptData.prompt}</p>
                    </div>
                </div>
                <div className="flex-1 bg-[#1a1a1a] p-8 flex items-center justify-center">
                    <div className="flex gap-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="w-[220px] bg-[#0f0f0f] rounded-xl border border-[#2e2e2e] p-3 space-y-2">
                                <div className="h-4 bg-[#1a1a1a] rounded w-2/3 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                {[0, 1, 2, 3, 4].map((j) => (
                                    <div key={j} className="h-8 bg-[#1a1a1a] rounded animate-pulse" style={{ animationDelay: `${(i * 5 + j) * 0.05}s` }} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error state ──────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
                <div className="text-center max-w-md">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={onBack} className="bg-purple-600 text-white px-6 py-2 rounded-lg">
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    const categoryGroups = getCategoryGroups();

    // ─── Ready state ──────────────────────────────────────────────
    return (
        <div className="flex min-h-screen">
            {/* ─── LEFT PANEL ──────────────────────────────────────── */}
            <div className="w-[480px] shrink-0 bg-[#0f0f0f] p-8 flex flex-col">
                <div className="mb-8">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Step 2 of 3</span>
                    <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden mt-3">
                        <div className="h-full w-2/3 bg-purple-600 rounded-full" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Structure your site</h1>
                <p className="text-sm text-gray-400 mb-6">Add or remove sections or pages as needed.</p>

                {/* AI Summary */}
                {summary && (
                    <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-start gap-3 mb-6">
                        <FileText className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
                    </div>
                )}

                {/* Page count */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-300">📄 {pages.length} pages</span>
                    {pages.length >= 5 && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">
                            Reached page limit
                        </span>
                    )}
                </div>

                {/* Edit prompt */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-8"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit prompt
                </button>

                {/* Generate button */}
                <button
                    onClick={() => onComplete(pages)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition mt-auto flex items-center justify-center gap-2"
                >
                    <span>✦</span> Generate site
                </button>
            </div>

            {/* ─── RIGHT PANEL ─────────────────────────────────────── */}
            <div className="flex-1 bg-[#1a1a1a] overflow-x-auto">
                <div className="flex gap-4 p-8 min-h-full">
                    {pages.map((page, pageIdx) => (
                        <div
                            key={pageIdx}
                            className="min-w-[220px] w-[220px] bg-[#0f0f0f] rounded-xl border border-[#2e2e2e] flex flex-col shrink-0"
                        >
                            {/* Column header */}
                            <div className="flex items-center gap-2 px-3 py-3 border-b border-[#2e2e2e]">
                                <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                                {renamingPage === `${pageIdx}` ? (
                                    <input
                                        autoFocus
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={() => renamePage(pageIdx, renameValue)}
                                        onKeyDown={(e) => e.key === 'Enter' && renamePage(pageIdx, renameValue)}
                                        className="bg-[#1a1a1a] text-white text-sm rounded px-2 py-0.5 flex-1 outline-none border border-purple-500"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-white truncate flex-1">{page.name}</span>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuOpen(menuOpen === `p-${pageIdx}` ? null : `p-${pageIdx}`)}
                                        className="p-1 rounded hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    {menuOpen === `p-${pageIdx}` && (
                                        <div className="absolute right-0 top-8 z-20 bg-[#242424] border border-[#333] rounded-lg shadow-xl py-1 w-32">
                                            <button
                                                onClick={() => {
                                                    setRenameValue(page.name);
                                                    setRenamingPage(`${pageIdx}`);
                                                    setMenuOpen(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] transition"
                                            >
                                                Rename
                                            </button>
                                            <button
                                                onClick={() => deletePage(pageIdx)}
                                                className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[#333] transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section pills */}
                            <div className="flex-1 py-1 overflow-y-auto">
                                {page.sections.map((section, secIdx) => (
                                    <div
                                        key={secIdx}
                                        className="flex items-center gap-2 mx-2 my-1 bg-[#242424] rounded-lg px-3 py-2 group"
                                    >
                                        <div
                                            className="w-1 h-5 rounded-full shrink-0"
                                            style={{ backgroundColor: getCategoryColor(section) }}
                                        />
                                        <span className="text-xs text-gray-300 flex-1 truncate">{section}</span>
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setSectionMenu(sectionMenu === `${pageIdx}-${secIdx}` ? null : `${pageIdx}-${secIdx}`)
                                                }
                                                className="p-0.5 rounded text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                            </button>
                                            {sectionMenu === `${pageIdx}-${secIdx}` && (
                                                <div className="absolute right-0 top-6 z-20 bg-[#242424] border border-[#333] rounded-lg shadow-xl py-1 w-28">
                                                    <button
                                                        onClick={() => moveSectionUp(pageIdx, secIdx)}
                                                        disabled={secIdx === 0}
                                                        className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] transition flex items-center gap-2 disabled:opacity-30"
                                                    >
                                                        <ChevronUp className="w-3 h-3" /> Move up
                                                    </button>
                                                    <button
                                                        onClick={() => moveSectionDown(pageIdx, secIdx)}
                                                        disabled={secIdx === page.sections.length - 1}
                                                        className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] transition flex items-center gap-2 disabled:opacity-30"
                                                    >
                                                        <ChevronDown className="w-3 h-3" /> Move down
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSection(pageIdx, secIdx)}
                                                        className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[#333] transition flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add section */}
                            <div className="relative px-2 pb-3">
                                <button
                                    onClick={() => setAddMenuPage(addMenuPage === `${pageIdx}` ? null : `${pageIdx}`)}
                                    className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-white py-2 transition"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add section
                                </button>
                                {addMenuPage === `${pageIdx}` && (
                                    <div className="absolute bottom-full left-0 right-0 mb-1 z-20 bg-[#242424] border border-[#333] rounded-lg shadow-xl py-1 max-h-64 overflow-y-auto">
                                        {Array.from(categoryGroups.entries()).map(([category, names]) => (
                                            <div key={category}>
                                                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                                                    {category}
                                                </div>
                                                {names.map((name) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => addSection(pageIdx, name)}
                                                        className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#333] transition flex items-center gap-2"
                                                    >
                                                        <div
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: CATEGORY_COLORS[category] || '#666' }}
                                                        />
                                                        {name}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
