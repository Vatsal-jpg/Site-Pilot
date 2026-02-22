'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Sparkles, HardDrive, Users, ArrowRight, Plus, FileCode, Github } from 'lucide-react';
import { api } from '@/lib/api';

interface Site {
    id: string;
    name: string;
    businessType: string;
    status: string;
    createdAt: string;
}

interface StatsData {
    plan: string;
    aiCreditsUsed: number;
    aiCreditsLimit: number;
    storageUsedBytes: string;
    storageLimit: string;
    siteCount: number;
    siteLimit: number;
    memberCount: number;
    memberLimit: number;
}

export default function DashboardOverview() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [sites, setSites] = useState<Site[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const [meRes, sitesRes, billingRes] = await Promise.all([
                    api.get('/api/auth/me'),
                    api.get('/api/sites'),
                    api.get('/api/billing'),
                ]);

                setUserName(meRes.user.name);
                setSites(sitesRes.sites || sitesRes || []);
                setStats(billingRes as unknown as StatsData);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const formatBytes = (bytesStr: string) => {
        const bytes = parseInt(bytesStr, 10) || 0;
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading || !stats) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            </div>
        );
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        return 'Hello ';
    };

    const createBlankSite = async () => {
        try {
            const res = await api.post('/api/sites/create', { name: 'Untitled Site' });
            router.push(`/editor/${res.id || res.site?.id}`);
        } catch (error) {
            console.error('Failed to create site:', error);
        }
    };

    return (
        <div className="p-8 pb-20">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-extrabold tracking-tight text-white mb-2">
                    {getGreeting()}, {userName.split(' ')[0]}
                </h1>
                <p className="max-w-xl text-lg sm:text-xl text-gray-400 mt-5 leading-relaxed">
                    Here's an overview of your workspace:
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

                {/* Sites */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] transition">
                    <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-medium text-gray-400">Total Sites</h3>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.siteCount}</p>
                    <p className="text-xs text-gray-500">
                        {stats.siteLimit - stats.siteCount} slots remaining
                    </p>
                </div>

                {/* AI Credits */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] transition">
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-medium text-gray-400">AI Credits Used</h3>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.aiCreditsUsed}</p>
                    <p className="text-xs text-gray-500">
                        of {stats.aiCreditsLimit} this month
                    </p>
                </div>

                {/* Storage */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] transition">
                    <div className="flex items-center gap-3 mb-3">
                        <HardDrive className="w-5 h-5 text-green-400" />
                        <h3 className="text-sm font-medium text-gray-400">Storage Used</h3>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{formatBytes(stats.storageUsedBytes)}</p>
                    <p className="text-xs text-gray-500">
                        of {formatBytes(stats.storageLimit)} total
                    </p>
                </div>

                {/* Team */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] transition">
                    <div className="flex items-center gap-3 mb-3">
                        <Users className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-sm font-medium text-gray-400">Team Members</h3>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.memberCount}</p>
                    <p className="text-xs text-gray-500">
                        {stats.memberLimit - stats.memberCount} seats available
                    </p>
                </div>

            </div>

            {/* Recent Sites */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Sites</h2>
                    <Link href="/dashboard/sites" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {sites.length === 0 ? (
                    <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-8 text-center">
                        <p className="text-gray-400 mb-4">You haven't created any sites yet.</p>
                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                        >
                            <Sparkles className="w-4 h-4" /> Generate your first AI site
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sites.slice(0, 6).map((site) => (
                            <div
                                key={site.id}
                                onClick={() => router.push(`/editor/${site.id}`)}
                                className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#2e2e2e] cursor-pointer transition group flex flex-col h-full"
                            >
                                {/* Top preview visual */}
                                <div className="h-36 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] relative flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition" />
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm z-10 shadow-xl">
                                        <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                            {site.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom details */}
                                <div className="p-4 flex flex-col flex-1 h-28">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-semibold text-white truncate pr-2">{site.name}</h3>
                                        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${site.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                            {site.status === 'published' ? 'LIVE' : 'DRAFT'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mb-auto">{site.businessType || 'Website'}</p>
                                    <p className="text-[10px] text-gray-600 mt-2">
                                        Created {new Date(site.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/onboarding"
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        <Sparkles className="w-4 h-4" /> New AI Site
                    </Link>
                    <button
                        onClick={createBlankSite}
                        className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#242424] border border-[#2e2e2e] hover:border-[#3a3a3a] text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        <FileCode className="w-4 h-4 text-gray-400" /> Blank Site
                    </button>
                    <button
                        className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] text-white px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                        title="Coming soon"
                    >
                        <Github className="w-4 h-4 text-gray-400" /> Import GitHub
                    </button>
                </div>
            </div>

        </div>
    );
}
