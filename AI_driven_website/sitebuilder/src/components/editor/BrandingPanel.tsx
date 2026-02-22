import { useState, useEffect, useRef } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { getSite } from '@/lib/store';

const PALETTES = [
    { id: 'midnight', name: 'Midnight', primary: '#7c5cfc', bg: '#0f0f0f', surface: '#1a1a1a', text: '#ffffff', accent: '#a78bfa', preview: ['#7c5cfc', '#0f0f0f', '#a78bfa'] },
    { id: 'ocean', name: 'Ocean', primary: '#0ea5e9', bg: '#0c1222', surface: '#162032', text: '#ffffff', accent: '#38bdf8', preview: ['#0ea5e9', '#0c1222', '#38bdf8'] },
    { id: 'forest', name: 'Forest', primary: '#10b981', bg: '#0a0f0d', surface: '#111a16', text: '#ffffff', accent: '#34d399', preview: ['#10b981', '#0a0f0d', '#34d399'] },
    { id: 'ember', name: 'Ember', primary: '#f97316', bg: '#0f0a08', surface: '#1a1210', text: '#ffffff', accent: '#fb923c', preview: ['#f97316', '#0f0a08', '#fb923c'] },
    { id: 'clean', name: 'Clean', primary: '#2563eb', bg: '#ffffff', surface: '#f8fafc', text: '#0f172a', accent: '#3b82f6', preview: ['#2563eb', '#ffffff', '#3b82f6'] }
];

const FONTS_HEADING = ['Syne', 'Fraunces', 'Playfair Display', 'Space Grotesk', 'Cabinet Grotesk', 'DM Serif Display', 'Cormorant'];
const FONTS_BODY = ['Inter', 'Plus Jakarta Sans', 'Manrope', 'DM Sans', 'Outfit', 'Nunito', 'Source Sans 3'];

export default function BrandingPanel({ siteId }: { siteId: string }) {
    const [loading, setLoading] = useState(false);
    const [primary, setPrimary] = useState('#7c5cfc');
    const [fontHeading, setFontHeading] = useState('Syne');
    const [fontBody, setFontBody] = useState('Inter');
    const [borderRadius, setBorderRadius] = useState('8px');
    const [logoUrl, setLogoUrl] = useState('');

    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!siteId) return;
        const fetchBranding = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch site logic
                const site = await getSite(siteId);

                const res = await fetch(`/api/sites/${siteId}/branding`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.branding) {
                    setPrimary(data.branding.primaryColor || site?.brandColor || '#7c5cfc');
                    setFontHeading(data.branding.fontHeading || 'Syne');
                    setFontBody(data.branding.fontBody || 'Inter');
                    setBorderRadius(data.branding.borderRadius || '8px');
                    setLogoUrl(data.branding.logoUrl || site?.logoUrl || '');
                } else if (site) {
                    setPrimary(site.brandColor || '#7c5cfc');
                    setLogoUrl(site.logoUrl || '');
                }
            } catch (err) {
                console.error('Failed to load branding', err);
            }
        };
        fetchBranding();
    }, [siteId]);

    const handleSave = async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/sites/${siteId}/branding`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    primaryColor: primary,
                    fontHeading,
                    fontBody,
                    borderRadius,
                    logoUrl,
                })
            });
            const data = await res.json();
            if (data.branding) {
                alert('Branding saved successfully! Editor will reflect changes on reload or re-render.');
                window.location.reload(); // Quickest way to force grapesjs wrapper to re-render for now
            }
        } catch (err) {
            console.error('Failed to save branding', err);
            alert('Failed to save branding.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('isLogo', 'true');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assets/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.asset) {
                let url = data.asset.url;
                if (url.startsWith('/uploads')) url = window.location.origin + url;
                setLogoUrl(url);
            }
        } catch (err) {
            console.error(err);
            alert('Logo upload failed.');
        }
    };

    if (!siteId) return <div className="p-4 text-gray-500 text-sm">Loading...</div>;

    return (
        <div className="flex flex-col h-full bg-transparent overflow-y-auto">
            <div className="p-4 border-b border-[#2e2e2e]">
                <h2 className="text-white font-semibold text-sm">Site Branding</h2>
            </div>

            <div className="p-4 space-y-6">
                {/* Color Section */}
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Primary Color</label>
                    <div className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded-lg border border-[#2e2e2e]">
                        <input
                            type="color"
                            value={primary}
                            onChange={(e) => setPrimary(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                        <input
                            type="text"
                            value={primary}
                            onChange={(e) => setPrimary(e.target.value)}
                            className="bg-transparent border-none text-white text-sm focus:outline-none uppercase font-mono w-20"
                        />
                    </div>
                </div>

                {/* Typography Section */}
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Heading Font</label>
                    <select
                        value={fontHeading}
                        onChange={(e) => setFontHeading(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-white text-sm outline-none mb-3"
                    >
                        {FONTS_HEADING.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Body Font</label>
                    <select
                        value={fontBody}
                        onChange={(e) => setFontBody(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-white text-sm outline-none"
                    >
                        {FONTS_BODY.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                {/* Border Radius */}
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Border Radius</label>
                    <input
                        type="range"
                        min="0" max="24" step="2"
                        value={parseInt(borderRadius)}
                        onChange={(e) => setBorderRadius(e.target.value + 'px')}
                        className="w-full"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">{borderRadius}</div>
                </div>

                {/* Logo Section */}
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Logo</label>
                    {logoUrl ? (
                        <div className="relative bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-2 max-w-full flex justify-center items-center">
                            <img src={logoUrl} alt="Logo" className="max-h-12 object-contain" />
                            <button
                                onClick={() => setLogoUrl('')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => logoInputRef.current?.click()}
                            className="w-full bg-[#1a1a1a] border border-dashed border-[#444] rounded-lg py-4 flex flex-col items-center justify-center gap-1 hover:border-gray-300 transition"
                        >
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-xs text-gray-400">Upload Logo</span>
                        </button>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg text-sm transition"
                >
                    {loading ? 'Saving...' : 'Save Branding'}
                </button>
            </div>
        </div>
    );
}
