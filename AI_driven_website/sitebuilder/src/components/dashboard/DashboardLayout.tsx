'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Globe,
    Image as ImageIcon,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

interface Tenant {
    id: string;
    orgName: string;
    plan: string;
    aiCreditsUsed: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthData {
    user: User;
    tenant: Tenant;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [data, setData] = useState<AuthData | null>(null);
    const [loading, setLoading] = useState(true);

    // ALL useEffect hooks MUST be before any conditional returns (Rules of Hooks)
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
            document.cookie = 'auth_token=; path=/; max-age=0;';
            setLoading(false);
            router.push('/login');
            return;
        }

        async function fetchMe() {
            try {
                const res = await api.get('/api/auth/me');
                setData(res as unknown as AuthData);
            } catch (error) {
                console.error('Failed to authenticate:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                document.cookie = 'auth_token=; path=/; max-age=0;';
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }
        fetchMe();
    }, [router]);

    // Redirect effect — runs AFTER render, not during (avoids React setState-during-render warning)
    useEffect(() => {
        if (!loading && !data) {
            router.push('/login');
        }
    }, [loading, data, router]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            </div>
        );
    }

    // No data — show spinner while redirect effect fires
    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            </div>
        );
    }

    const { tenant, user } = data;

    // Plan limits
    const aiLimit = tenant.plan === 'starter' ? 50 : tenant.plan === 'pro' ? 500 : 99999;
    const creditsPercentage = Math.min((tenant.aiCreditsUsed / aiLimit) * 100, 100);
    const creditsColor = creditsPercentage > 90 ? 'bg-red-500' : creditsPercentage > 70 ? 'bg-yellow-500' : 'bg-purple-500';

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Sites', href: '/dashboard/sites', icon: Globe },
        { name: 'Assets', href: '/dashboard/assets', icon: ImageIcon },
        { name: 'Team', href: '/dashboard/team', icon: Users },
        { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        document.cookie = 'auth_token=; path=/; max-age=0;';
        router.push('/login');
    };

    return (
        <div className="flex flex-row h-screen overflow-hidden bg-[#0f0f0f]">
            {/* LEFT SIDEBAR */}
            <div className="w-[240px] bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col shrink-0">

                {/* Top Section */}
                <div className="px-5 py-6">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white">SitePilot</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{tenant.orgName}</div>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition ${isActive
                                    ? 'bg-[#1a1a1a] text-white'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Section */}
                <div className="border-t border-[#1a1a1a] p-4 shrink-0">

                    {/* AI Credits bar */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                            <span>AI Credits</span>
                            <span>{tenant.aiCreditsUsed} / {aiLimit}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded overflow-hidden">
                            <div
                                className={`h-full ${creditsColor} transition-all duration-500`}
                                style={{ width: `${creditsPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Plan badge */}
                    <div className="bg-[#1a1a1a] rounded-lg px-3 py-2.5 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tenant.plan === 'enterprise' ? 'bg-yellow-500' : tenant.plan === 'pro' ? 'bg-purple-500' : 'bg-gray-400'}`} />
                            <span className="text-xs font-medium text-white capitalize">{tenant.plan} Plan</span>
                        </div>
                        {tenant.plan !== 'enterprise' && (
                            <Link href="/dashboard/billing" className="text-xs text-purple-400 hover:text-purple-300">
                                Upgrade
                            </Link>
                        )}
                    </div>

                    {/* User Row */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-white font-medium truncate">{user.name}</div>
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-gray-500 hover:text-white rounded-md hover:bg-[#1a1a1a] transition"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </div>

            {/* MAIN CONTENT ZONE */}
            <div className="flex-1 flex flex-col overflow-y-auto relative">
                {children}
            </div>
        </div>
    );
}
