'use client';

import { useState, useRef, useCallback } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';

export const PALETTES = [
    {
        id: 'midnight',
        name: 'Midnight',
        primary: '#7c5cfc',
        bg: '#0f0f0f',
        surface: '#1a1a1a',
        text: '#ffffff',
        accent: '#a78bfa',
        preview: ['#7c5cfc', '#0f0f0f', '#a78bfa'],
    },
    {
        id: 'ocean',
        name: 'Ocean',
        primary: '#0ea5e9',
        bg: '#0c1222',
        surface: '#162032',
        text: '#ffffff',
        accent: '#38bdf8',
        preview: ['#0ea5e9', '#0c1222', '#38bdf8'],
    },
    {
        id: 'forest',
        name: 'Forest',
        primary: '#10b981',
        bg: '#0a0f0d',
        surface: '#111a16',
        text: '#ffffff',
        accent: '#34d399',
        preview: ['#10b981', '#0a0f0d', '#34d399'],
    },
    {
        id: 'ember',
        name: 'Ember',
        primary: '#f97316',
        bg: '#0f0a08',
        surface: '#1a1210',
        text: '#ffffff',
        accent: '#fb923c',
        preview: ['#f97316', '#0f0a08', '#fb923c'],
    },
    {
        id: 'rose',
        name: 'Rose',
        primary: '#f43f5e',
        bg: '#0f0a0c',
        surface: '#1a1015',
        text: '#ffffff',
        accent: '#fb7185',
        preview: ['#f43f5e', '#0f0a0c', '#fb7185'],
    },
    {
        id: 'slate',
        name: 'Slate',
        primary: '#6366f1',
        bg: '#0f0f14',
        surface: '#16161f',
        text: '#ffffff',
        accent: '#818cf8',
        preview: ['#6366f1', '#0f0f14', '#818cf8'],
    },
    {
        id: 'gold',
        name: 'Gold',
        primary: '#f59e0b',
        bg: '#0f0d08',
        surface: '#1a1810',
        text: '#ffffff',
        accent: '#fbbf24',
        preview: ['#f59e0b', '#0f0d08', '#fbbf24'],
    },
    {
        id: 'arctic',
        name: 'Arctic',
        primary: '#06b6d4',
        bg: '#080f14',
        surface: '#0f1a22',
        text: '#ffffff',
        accent: '#22d3ee',
        preview: ['#06b6d4', '#080f14', '#22d3ee'],
    },
    {
        id: 'crimson',
        name: 'Crimson',
        primary: '#dc2626',
        bg: '#0f0808',
        surface: '#1a1010',
        text: '#ffffff',
        accent: '#ef4444',
        preview: ['#dc2626', '#0f0808', '#ef4444'],
    },
    {
        id: 'clean',
        name: 'Clean',
        primary: '#2563eb',
        bg: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        accent: '#3b82f6',
        preview: ['#2563eb', '#ffffff', '#3b82f6'],
    },
];

export interface PromptData {
    siteName: string;
    prompt: string;
    businessType: string;
    brandColor: string;
    logoUrl?: string;
    uploadedImages: string[];
    selectedPalette: typeof PALETTES[0] | null;
}

interface PromptPageProps {
    onComplete: (data: PromptData) => void;
}

const BUSINESS_TYPES = [
    'SaaS', 'Agency', 'Portfolio', 'E-commerce', 'Restaurant',
    'Professional Services', 'Startup', 'Blog', 'Nonprofit', 'Education',
];

export default function PromptPage({ onComplete }: PromptPageProps) {
    const [siteName, setSiteName] = useState('');
    const [prompt, setPrompt] = useState('');
    const [businessType, setBusinessType] = useState('SaaS');
    const [selectedPalette, setSelectedPalette] = useState(PALETTES[0]);
    const [brandColor, setBrandColor] = useState(PALETTES[0].primary);
    const [showCustomColor, setShowCustomColor] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | undefined>();
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const imagesInputRef = useRef<HTMLInputElement>(null);

    const isValid = siteName.trim().length > 0 && prompt.trim().length > 0;

    const handleFileToBase64 = useCallback(
        (file: File): Promise<string> =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }),
        []
    );

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await handleFileToBase64(file);
        setLogoUrl(base64);
    };

    const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remaining = 5 - uploadedImages.length;
        const toUpload = files.slice(0, remaining);
        const base64s = await Promise.all(toUpload.map(handleFileToBase64));
        setUploadedImages((prev) => [...prev, ...base64s]);
    };

    const handleSubmit = () => {
        if (!isValid) return;
        onComplete({
            siteName: siteName.trim(),
            prompt: prompt.trim(),
            businessType: businessType.toLowerCase().replace(/[- ]/g, ''),
            brandColor,
            logoUrl,
            uploadedImages,
            selectedPalette,
        });
    };

    const mockBg = selectedPalette?.bg || '#0f0f0f';
    const mockSurface = selectedPalette?.surface || '#1a1a1a';
    const mockPrimary = selectedPalette?.primary || '#7c5cfc';

    return (
        <div className="flex min-h-screen">
            {/* ─── LEFT PANEL ─────────────────────────────────────────────── */}
            <div className="w-[480px] shrink-0 bg-[#0f0f0f] flex flex-col overflow-y-auto">
                <div className="p-8 flex flex-col flex-1">
                    {/* Step indicator */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Step 1 of 3
                            </span>
                        </div>
                        <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-purple-600 rounded-full transition-all duration-500" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Tell us about your website
                    </h1>
                    <p className="text-sm text-gray-400 mb-8">
                        The more detail you give, the better your site will be.
                    </p>

                    {/* Form */}
                    <div className="flex flex-col gap-6 flex-1">
                        {/* Site name */}
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                                Site name
                            </label>
                            <input
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                placeholder="e.g. FinTrust Solutions"
                                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
                            />
                        </div>

                        {/* Business type */}
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                                Business type
                            </label>
                            <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition appearance-none"
                            >
                                {BUSINESS_TYPES.map((bt) => (
                                    <option key={bt} value={bt}>
                                        {bt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Prompt textarea */}
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                                Describe your website
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={5}
                                placeholder="e.g. A bold creative agency that showcases visual portfolio, services, case studies, team bios, and client work with an eye-catching layout to demonstrate design capabilities."
                                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition resize-none"
                            />
                            <p className="text-xs text-purple-400 mt-1.5 flex items-center gap-1">
                                <span>✦</span> AI will generate your site structure based on this
                            </p>
                        </div>

                        {/* Brand color */}
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">
                                COLOR PALETTE
                            </label>
                            <div className="grid grid-cols-2 gap-[10px]">
                                {PALETTES.map((palette) => (
                                    <button
                                        key={palette.id}
                                        onClick={() => {
                                            setSelectedPalette(palette);
                                            setBrandColor(palette.primary);
                                        }}
                                        className="w-full text-left bg-[#1a1a1a] border rounded-[10px] px-[14px] py-[12px] cursor-pointer flex items-center gap-3 transition-all duration-150"
                                        style={{
                                            borderColor: selectedPalette?.id === palette.id ? palette.primary : 'rgba(255,255,255,0.06)',
                                            backgroundColor: selectedPalette?.id === palette.id ? `${palette.primary}14` : '#1a1a1a',
                                            boxShadow: selectedPalette?.id === palette.id ? `0 0 0 1px ${palette.primary}` : 'none',
                                        }}
                                    >
                                        <div className="flex items-center gap-1 shrink-0">
                                            {palette.preview.map((c, i) => (
                                                <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-medium text-white leading-tight mb-0.5">{palette.name}</div>
                                            <div className="text-[10px] text-white/40 font-mono tracking-tight">{palette.primary}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3">
                                <button
                                    onClick={() => setShowCustomColor(!showCustomColor)}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 transition"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></svg>
                                    Custom color
                                </button>
                                {showCustomColor && (
                                    <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e]">
                                        <input
                                            type="color"
                                            value={brandColor}
                                            onChange={(e) => setBrandColor(e.target.value)}
                                            className="w-8 h-8 rounded-md cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                                        />
                                        <input
                                            type="text"
                                            value={brandColor}
                                            onChange={(e) => setBrandColor(e.target.value)}
                                            className="bg-transparent border-none text-white text-sm focus:outline-none uppercase font-mono w-20"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Logo upload */}
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                                Logo (optional)
                            </label>
                            {logoUrl ? (
                                <div className="relative bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex items-center justify-center">
                                    <img src={logoUrl} alt="Logo" className="max-h-16 object-contain" />
                                    <button
                                        onClick={() => setLogoUrl(undefined)}
                                        className="absolute top-2 right-2 p-1 rounded-md bg-[#2e2e2e] text-gray-400 hover:text-white transition"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => logoInputRef.current?.click()}
                                    className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2e2e2e] rounded-xl py-5 flex flex-col items-center gap-2 hover:border-[#444] transition cursor-pointer"
                                >
                                    <ImageIcon className="w-6 h-6 text-gray-500" />
                                    <span className="text-sm text-gray-400">Upload logo</span>
                                    <span className="text-xs text-gray-500">PNG, SVG recommended</span>
                                </button>
                            )}
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Custom images */}
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-medium">
                                Custom images (optional)
                            </label>
                            {uploadedImages.length > 0 && (
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {uploadedImages.map((img, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Upload ${i + 1}`}
                                                className="w-16 h-16 rounded-lg object-cover border border-[#2e2e2e]"
                                            />
                                            <button
                                                onClick={() => setUploadedImages((prev) => prev.filter((_, j) => j !== i))}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {uploadedImages.length < 5 && (
                                <button
                                    onClick={() => imagesInputRef.current?.click()}
                                    className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2e2e2e] rounded-xl py-4 flex flex-col items-center gap-1.5 hover:border-[#444] transition cursor-pointer"
                                >
                                    <Upload className="w-5 h-5 text-gray-500" />
                                    <span className="text-xs text-gray-400">
                                        Upload up to {5 - uploadedImages.length} images
                                    </span>
                                </button>
                            )}
                            <input
                                ref={imagesInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImagesUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition ${isValid
                            ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                            : 'bg-purple-600/50 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        Continue →
                    </button>
                </div>
            </div>

            {/* ─── RIGHT PANEL ────────────────────────────────────────────── */}
            <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-12">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Your site is one prompt away
                    </h2>
                    <p className="text-gray-400 text-sm mb-10">
                        Describe your vision and our AI will build a beautiful, professional website for you.
                    </p>

                    {/* Fake browser mockup */}
                    <div className="rounded-xl border border-[#2e2e2e] shadow-2xl overflow-hidden transition-colors duration-300" style={{ backgroundColor: mockBg }}>
                        {/* Browser bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2e2e2e]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="rounded-md px-3 py-1.5 flex items-center transition-colors duration-300" style={{ backgroundColor: mockSurface }}>
                                    <span className="text-xs text-gray-500">
                                        {siteName ? `${siteName.toLowerCase().replace(/\s+/g, '')}.com` : 'yoursite.com'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Fake content */}
                        <div className="p-6 space-y-4">
                            {/* Hero placeholder */}
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 rounded w-3/4 animate-pulse transition-colors duration-300" style={{ backgroundColor: mockSurface }} />
                                    <div className="h-3 rounded w-full animate-pulse transition-colors duration-300" style={{ backgroundColor: mockSurface, animationDelay: '0.1s' }} />
                                    <div className="h-3 rounded w-2/3 animate-pulse transition-colors duration-300" style={{ backgroundColor: mockSurface, animationDelay: '0.2s' }} />
                                    <div className="flex gap-2 mt-2">
                                        <div
                                            className="h-8 rounded-md w-24 animate-pulse transition-colors duration-300"
                                            style={{ backgroundColor: brandColor, animationDelay: '0.3s' }}
                                        />
                                        <div className="h-8 rounded-md w-20 animate-pulse transition-colors duration-300" style={{ backgroundColor: mockSurface, animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                                <div className="w-32 h-24 rounded-lg animate-pulse shrink-0 transition-colors duration-300" style={{ backgroundColor: mockSurface, animationDelay: '0.15s' }} />
                            </div>

                            {/* Feature cards placeholder */}
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="rounded-lg p-3 space-y-2 animate-pulse transition-colors duration-300" style={{ backgroundColor: mockSurface, animationDelay: `${0.3 + i * 0.1}s` }}>
                                        <div className="w-6 h-6 rounded bg-[#242424]" />
                                        <div className="h-2.5 rounded bg-[#242424] w-3/4" />
                                        <div className="h-2 rounded bg-[#242424] w-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Footer placeholder */}
                            <div className="flex gap-4 pt-2 border-t border-[#1a1a1a]">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex-1 space-y-1.5 animate-pulse" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                                        <div className="h-2 rounded w-1/2 transition-colors duration-300" style={{ backgroundColor: mockSurface }} />
                                        <div className="h-1.5 rounded w-3/4 transition-colors duration-300" style={{ backgroundColor: mockSurface }} />
                                        <div className="h-1.5 rounded w-2/3 transition-colors duration-300" style={{ backgroundColor: mockSurface }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
