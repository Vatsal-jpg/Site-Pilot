'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, Copy, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { NEXT_PUBLIC_API_URL } from '@/lib/api';

interface Asset {
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [usage, setUsage] = useState({ usedBytes: 0, limitBytes: 104857600, percent: 0 });
    const [filter, setFilter] = useState<'all' | 'image'>('all');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/assets${filter === 'image' ? '?type=image' : ''}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.assets) setAssets(data.assets);

            const usageRes = await fetch(`${NEXT_PUBLIC_API_URL}/api/assets/usage`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const usageData = await usageRes.json();
            if (usageData) setUsage(usageData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [filter]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${NEXT_PUBLIC_API_URL}/api/assets/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            await fetchAssets();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this asset?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await fetch(`${NEXT_PUBLIC_API_URL}/api/assets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchAssets();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const copyUrl = (id: string, url: string) => {
        let finalUrl = url;
        if (url.startsWith('/uploads')) {
            finalUrl = window.location.origin + url;
        }
        navigator.clipboard.writeText(finalUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="p-8 max-w-6xl mx-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Assets</h1>
                    <p className="text-gray-400">Manage your uploaded files and media.</p>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#2e2e2e] w-64">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Storage Usage</span>
                        <span className="text-white font-medium">{formatBytes(usage.usedBytes)} / {formatBytes(usage.limitBytes)}</span>
                    </div>
                    <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, usage.percent)}%` }}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Upload Zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="mb-8 border-2 border-dashed border-[#2e2e2e] rounded-2xl p-12 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition cursor-pointer"
            >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Click or drag files to upload</h3>
                <p className="text-sm text-gray-500">Supports images up to 10MB</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
                {uploading && <p className="text-purple-400 mt-4 text-sm animate-pulse">Uploading...</p>}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 border-b border-[#2e2e2e]">
                <button
                    onClick={() => setFilter('all')}
                    className={`pb-3 px-2 text-sm font-medium transition ${filter === 'all' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    All Files
                </button>
                <button
                    onClick={() => setFilter('image')}
                    className={`pb-3 px-2 text-sm font-medium transition ${filter === 'image' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Images
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading assets...</div>
            ) : assets.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-[#1a1a1a] rounded-xl border border-[#2e2e2e]">
                    No assets found. Upload some files to get started.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {assets.map(asset => (
                        <div key={asset.id} className="group relative bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
                            <div className="aspect-square bg-[#0f0f0f] flex items-center justify-center p-4">
                                {asset.mimeType?.startsWith('image/') ? (
                                    <img src={asset.url} alt={asset.fileName} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-gray-600" />
                                )}
                            </div>

                            <div className="p-3">
                                <p className="text-sm text-white truncate" title={asset.fileName}>{asset.fileName}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatBytes(asset.sizeBytes)}</p>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                <button
                                    onClick={() => copyUrl(asset.id, asset.url)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
                                >
                                    {copiedId === asset.id ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    {copiedId === asset.id ? 'Copied URL' : 'Copy URL'}
                                </button>
                                <button
                                    onClick={() => handleDelete(asset.id)}
                                    className="bg-red-500/20 hover:bg-red-500/40 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
                                >
                                    <X className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
