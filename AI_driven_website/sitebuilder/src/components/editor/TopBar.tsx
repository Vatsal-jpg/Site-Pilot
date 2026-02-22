import { ChevronDown, Palette, Monitor, Tablet, Smartphone, Sparkles, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Site, Page } from '@/lib/types';

interface TopBarProps {
    site: Site;
    currentPageId: string;
    switchPage: (pageId: string) => void;
    saveStatus: 'idle' | 'saving' | 'saved';
    device: 'desktop' | 'tablet' | 'mobile';
    switchDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
    handlePublish: () => void;
}

export default function TopBar({
    site,
    currentPageId,
    switchPage,
    saveStatus,
    device,
    switchDevice,
    handlePublish,
}: TopBarProps) {
    const router = useRouter();
    const [pageDropdown, setPageDropdown] = useState(false);

    const currentPage = site.pages.find(p => p.id === currentPageId);

    return (
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
                                onClick={() => { switchPage(p.id); setPageDropdown(false); }}
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

            <div className="w-px h-5 bg-[#2e2e2e] mx-1" />

            {/* Style Guide */}
            <button
                onClick={() => router.push(`/styleguide/${site.id}`)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition"
                title="Style Guide"
            >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Style Guide</span>
            </button>

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
    );
}
