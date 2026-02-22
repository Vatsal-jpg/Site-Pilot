'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, HardDrive, Globe, Users, Check, X } from 'lucide-react';
import { api } from '@/lib/api';

interface BillingData {
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

export default function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<BillingData | null>(null);

    useEffect(() => {
        async function loadBilling() {
            try {
                const res = await api.get('/api/billing');
                setData(res as unknown as BillingData);
            } catch (error) {
                console.error('Failed to load billing:', error);
            } finally {
                setLoading(false);
            }
        }
        loadBilling();
    }, []);

    const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
        if (!window.confirm(`Upgrade to exactly $${plan === 'pro' ? '29' : '99'}/month?`)) return;

        try {
            setLoading(true);
            await api.post('/api/billing/upgrade', { plan });
            alert('Plan upgraded successfully! 🎉');
            window.location.reload();
        } catch (error: any) {
            console.error('Upgrade failed:', error);
            alert(error.response?.data?.error || 'Failed to upgrade plan');
            setLoading(false);
        }
    };

    const formatBytes = (bytesStr: string) => {
        const bytes = parseInt(bytesStr, 10) || 0;
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading || !data) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    // Calculate percentages
    const aiPct = Math.min((data.aiCreditsUsed / data.aiCreditsLimit) * 100, 100);
    const storagePct = Math.min((parseInt(data.storageUsedBytes) / parseInt(data.storageLimit)) * 100, 100);
    const sitePct = Math.min((data.siteCount / data.siteLimit) * 100, 100);
    const memberPct = Math.min((data.memberCount / data.memberLimit) * 100, 100);

    return (
        <div className="p-8 pb-20 max-w-6xl mx-auto w-full">

            <h1 className="text-2xl font-bold text-white mb-8">Billing & Usage</h1>

            {/* Current Plan Card */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-white capitalize">Current Plan: {data.plan}</h2>
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${data.plan === 'enterprise' ? 'bg-yellow-500/20 text-yellow-400' :
                            data.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                            Active
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 md:mb-0">
                        {data.plan === 'starter' ? '$0/month' : data.plan === 'pro' ? '$29/month' : '$99/month'}
                    </p>
                </div>
                <div className="flex flex-col md:items-end">
                    <p className="text-sm text-gray-400 mb-4 text-left md:text-right">
                        {data.siteLimit === 99999 ? 'Unlimited' : data.siteLimit} websites · {formatBytes(data.storageLimit)} storage · {data.aiCreditsLimit === 99999 ? 'Unlimited' : data.aiCreditsLimit} AI/mo
                    </p>
                    <button className="px-4 py-2 border border-[#2e2e2e] hover:bg-[#1a1a1a] text-white text-sm font-medium rounded-lg transition">
                        Manage Subscription
                    </button>
                </div>
            </div>

            {/* Usage breakdown */}
            <h2 className="text-lg font-semibold text-white mb-4">Current Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">

                {/* AI Credits Info */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-300">AI Credits</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {data.aiCreditsUsed} / {data.aiCreditsLimit === 99999 ? '∞' : data.aiCreditsLimit} used
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] rounded overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${aiPct}%` }} />
                    </div>
                </div>

                {/* Storage Info */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-gray-300">Storage</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {formatBytes(data.storageUsedBytes)} / {formatBytes(data.storageLimit)}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] rounded overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${storagePct}%` }} />
                    </div>
                </div>

                {/* Sites Info */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-300">Sites</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {data.siteCount} / {data.siteLimit === 99999 ? '∞' : data.siteLimit}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] rounded overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${sitePct}%` }} />
                    </div>
                </div>

                {/* Team Info */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-300">Team Members</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {data.memberCount} / {data.memberLimit === 99999 ? '∞' : data.memberLimit}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] rounded overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${memberPct}%` }} />
                    </div>
                </div>
            </div>

            {/* Plan comparison */}
            <h2 className="text-lg font-semibold text-white mb-6">Available Plans</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* STARTER */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                    <p className="text-2xl font-bold text-white mb-6">$0<span className="text-sm font-normal text-gray-500">/month</span></p>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 1 Site</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 3 Pages per site</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 50 AI credits/month</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 500MB Storage</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 1 Team member</li>
                        <li className="flex items-center gap-3 text-sm text-gray-600"><X className="w-4 h-4" /> Custom domains</li>
                        <li className="flex items-center gap-3 text-sm text-gray-600"><X className="w-4 h-4" /> Priority support</li>
                    </ul>

                    <button
                        disabled={true}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#2e2e2e] text-gray-500"
                    >
                        {data.plan === 'starter' ? 'Current Plan' : 'Downgrade to Starter'}
                    </button>
                </div>

                {/* PRO */}
                <div className="bg-[#111] border-2 border-purple-500 rounded-xl p-6 flex flex-col relative">
                    <div className="absolute -top-3 right-6 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                    <p className="text-2xl font-bold text-white mb-6">$29<span className="text-sm font-normal text-gray-500">/month</span></p>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 5 Sites</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Unlimited Pages</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 500 AI credits/month</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 5GB Storage</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 5 Team members</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Custom domains</li>
                        <li className="flex items-center gap-3 text-sm text-gray-600"><X className="w-4 h-4" /> Priority support</li>
                    </ul>

                    <button
                        disabled={data.plan === 'pro'}
                        onClick={() => handleUpgrade('pro')}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${data.plan === 'pro'
                            ? 'bg-[#1a1a1a] text-gray-500'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20'
                            }`}
                    >
                        {data.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                    </button>
                </div>

                {/* ENTERPRISE */}
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                    <p className="text-2xl font-bold text-white mb-6">$99<span className="text-sm font-normal text-gray-500">/month</span></p>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Unlimited Sites</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Unlimited Pages</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Unlimited AI credits</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> 50GB Storage</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Unlimited Team members</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Custom domains</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-green-500" /> Priority support</li>
                    </ul>

                    <button
                        disabled={data.plan === 'enterprise'}
                        onClick={() => handleUpgrade('enterprise')}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${data.plan === 'enterprise'
                            ? 'bg-[#1a1a1a] text-gray-500'
                            : 'bg-white hover:bg-gray-100 text-black shadow-xl shadow-white/5'
                            }`}
                    >
                        {data.plan === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
                    </button>
                </div>

            </div>

        </div>
    );
}
