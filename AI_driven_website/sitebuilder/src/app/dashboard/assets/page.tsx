'use client';

import React, { useEffect, useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Asset {
    id: string;
    fileName: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}

export default function AssetsPage() {
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageLimit, setStorageLimit] = useState(0);

    const [activeTab, setActiveTab] = useState<'All' | 'Images' | 'Other'>('All');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadAssets();
    }, []);

    async function loadAssets() {
        try {
            const res = await api.get('/api/assets');
            setAssets(res.assets || []);
            setStorageUsed(parseInt(res.storageUsed || '0'));
            setStorageLimit(parseInt(res.storageLimit || '0'));
        } catch (error) {
            console.error('Failed to load assets:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate size (approx 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit');
            return;
        }

        setUploading(true);
        setUploadProgress(10); // Fake quick progress

        try {
            // Need standard fetch here because api wrapper expects JSON body, but we need FormData
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('auth_token');

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 15, 90));
            }, 200);

            const res = await fetch('http://localhost:4000/api/assets/upload', {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            await loadAssets(); // refresh list

        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.message);
        } finally {
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }, 500);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this asset permanently?')) return;
        try {
            await api.delete(`/api/assets/${id}`);
            await loadAssets();
        } catch (error) {
            alert('Failed to delete asset');
        }
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        // Could add toast here
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredAssets = assets.filter((asset) => {
        if (activeTab === 'All') return true;
        const isImage = asset.mimeType?.startsWith('image/');
        if (activeTab === 'Images') return isImage;
        if (activeTab === 'Other') return !isImage;
        return true;
    });

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const storagePct = Math.min((storageUsed / storageLimit) * 100, 100);

    return (
        <div className="p-8 pb-20 max-w-6xl mx-auto w-full">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white">Assets</h1>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>

            {/* Storage Bar Below Header */}
            <div className="mb-10">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{formatBytes(storageUsed)} used</span>
                    <span>{formatBytes(storageLimit)} total</span>
                </div>
                <div className="h-1.5 w-full bg-[#111] border border-[#1a1a1a] rounded overflow-hidden">
                    <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${storagePct}%` }}
                    />
                </div>
            </div>

            {/* Upload Zone */}
            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`bg-[#0a0a0a] border-2 border-dashed rounded-xl p-10 text-center mb-10 transition cursor-pointer ${uploading ? 'border-purple-500/50 cursor-wait' : 'border-[#2e2e2e] hover:border-purple-500/50 hover:bg-[#111]'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/svg+xml, application/pdf"
                />

                {uploading ? (
                    <div className="max-w-xs mx-auto">
                        <div className="flex items-center justify-between text-sm text-purple-400 mb-2">
                            <span>Uploading file...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded overflow-hidden">
                            <div
                                className="h-full bg-purple-500 transition-all duration-200"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <UploadCloud className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-300 mb-1">Click to upload or drag and drop</h3>
                        <p className="text-xs text-gray-600">SVG, PNG, JPG or GIF (max. 10MB)</p>
                    </>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-[#1a1a1a] mb-6">
                {['All', 'Images', 'Other'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                            ? 'text-white border-purple-500'
                            : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Asset Grid */}
            {filteredAssets.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-gray-500 text-sm">No assets found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {filteredAssets.map((asset) => {
                        const isImage = asset.mimeType?.startsWith('image/');

                        return (
                            <div key={asset.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden group">

                                {/* Preview Area */}
                                <div className="h-36 bg-[#0a0a0a] relative flex items-center justify-center border-b border-[#1a1a1a]">
                                    {isImage && asset.url ? (
                                        <img
                                            src={asset.url}
                                            alt={asset.fileName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FileIcon className="w-10 h-10 text-gray-600" />
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => handleCopy(asset.url)}
                                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                                            title="Copy URL"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                                            title="Delete Asset"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info Bar */}
                                <div className="px-3 py-2">
                                    <p className="text-xs text-white truncate font-medium mb-1" title={asset.fileName}>
                                        {asset.fileName}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {formatBytes(asset.sizeBytes)} • {new Date(asset.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
