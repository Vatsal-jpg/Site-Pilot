'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, MoreHorizontal, Pencil, PenTool, Copy, Trash2, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';

interface Site {
    id: string;
    name: string;
    businessType: string;
    status: string;
    createdAt: string;
}

export default function SitesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState<Site[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        async function loadSites() {
            try {
                const res = await api.get('/api/sites');
                setSites(res.sites || res || []);
            } catch (error) {
                console.error('Failed to load sites:', error);
            } finally {
                setLoading(false);
            }
        }
        loadSites();
    }, []);

    const handleDelete = async (siteId: string) => {
        if (!window.confirm('Are you sure you want to delete this site?')) return;
        try {
            await api.delete(`/api/sites/${siteId}`);
            setSites((prev) => prev.filter((s) => s.id !== siteId));
        } catch (error) {
            console.error('Failed to delete site:', error);
            alert('Failed to delete site.');
        }
    };

    const handleDuplicate = async (siteId: string) => {
        try {
            const res = await api.post(`/api/sites/${siteId}/duplicate`, {});
            if (res.site) {
                setSites((prev) => [res.site, ...prev]);
            }
        } catch (error) {
            console.error('Failed to duplicate site:', error);
            alert('Duplication not implemented on backend yet.');
        }
    };

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredSites = sites
        .filter((site) => {
            if (statusFilter !== 'All' && site.status !== statusFilter.toLowerCase()) return false;
            if (searchTerm && !site.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'Newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'Oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === 'A-Z') return a.name.localeCompare(b.name);
            return 0;
        });

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-white">My Sites</h1>
                <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    <Plus className="w-4 h-4" /> New Site
                </Link>
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search sites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition"
                    >
                        <option>All</option>
                        <option>Draft</option>
                        <option>Published</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 transition"
                    >
                        <option>Newest</option>
                        <option>Oldest</option>
                        <option>A-Z</option>
                    </select>
                </div>
            </div>

            {/* Sites Grid */}
            {filteredSites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#111] border border-[#1a1a1a] border-dashed rounded-xl">
                    <PenTool className="w-12 h-12 text-gray-600 mb-4" />
                    <h2 className="text-lg text-white font-medium mb-1">No sites found</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {sites.length === 0 ? "You haven't created any sites yet." : "No sites match your search filters."}
                    </p>
                    {sites.length === 0 && (
                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            <Plus className="w-4 h-4" /> Create Site
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSites.map((site) => (
                        <div
                            key={site.id}
                            className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-visible hover:border-[#2e2e2e] transition group flex flex-col h-full relative"
                        >
                            <div
                                onClick={() => router.push(`/editor/${site.id}`)}
                                className="cursor-pointer"
                            >
                                <div className="h-36 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] relative flex items-center justify-center p-4 rounded-t-xl overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition" />
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm z-10 shadow-xl">
                                        <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                            {site.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="cursor-pointer flex-1 min-w-0 pr-2" onClick={() => router.push(`/editor/${site.id}`)}>
                                        <h3 className="text-sm font-semibold text-white truncate">{site.name}</h3>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{site.businessType || 'Website'}</p>
                                    </div>

                                    {/* Menu Button */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === site.id ? null : site.id);
                                            }}
                                            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {/* Popover Menu */}
                                        {openMenuId === site.id && (
                                            <div className="absolute right-0 mt-1 w-48 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg shadow-xl py-1 z-50">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/editor/${site.id}`); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#242424] hover:text-white flex items-center gap-2"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" /> Open Editor
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/styleguide/${site.id}`); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#242424] hover:text-white flex items-center gap-2"
                                                >
                                                    <PenTool className="w-3.5 h-3.5" /> View Style Guide
                                                </button>
                                                <div className="h-px bg-[#2e2e2e] my-1 mx-2" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDuplicate(site.id); setOpenMenuId(null); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#242424] hover:text-white flex items-center gap-2"
                                                >
                                                    <Copy className="w-3.5 h-3.5" /> Duplicate
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(site.id); setOpenMenuId(null); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-[#311] hover:text-red-300 flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${site.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                        {site.status === 'published' ? 'LIVE' : 'DRAFT'}
                                    </span>
                                    <p className="text-[10px] text-gray-600">
                                        Created {new Date(site.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
