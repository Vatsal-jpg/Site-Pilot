'use client';

import React, { useEffect, useState } from 'react';
import { BuildingIcon, User as UserIcon, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [savingOrg, setSavingOrg] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [orgName, setOrgName] = useState('');
    const [slug, setSlug] = useState('');
    const [role, setRole] = useState('viewer');

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await api.get('/api/auth/me');
                const { user, tenant } = res;
                setOrgName(tenant.orgName);
                setSlug(tenant.slug);
                setRole(user.role);
                setUserName(user.name);
                setUserEmail(user.email);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleSaveOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (role !== 'owner' && role !== 'admin') {
            alert('Not authorized to edit organization settings.');
            return;
        }
        setSavingOrg(true);
        try {
            await api.patch('/api/tenant/settings', { orgName });
            alert('Organization settings saved! 🎉');
        } catch (error) {
            alert('Failed to save organization settings.');
        } finally {
            setSavingOrg(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        // Note: profile update endpoint is mocked for this phase
        setTimeout(() => {
            alert('Profile saved! 🎉 (Mocked)');
            setSavingProfile(false);
        }, 800);
    };

    const handleDeleteOrg = async () => {
        if (deleteConfirm !== orgName) {
            alert("Organization name doesn't match.");
            return;
        }
        setDeleting(true);
        try {
            await api.delete('/api/tenant');
            document.cookie = 'auth_token=; path=/; max-age=0;';
            localStorage.removeItem('auth_token');
            router.push('/login');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete organization');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const isOwner = role === 'owner';

    return (
        <div className="p-8 pb-20 max-w-4xl mx-auto w-full">

            <h1 className="text-2xl font-bold text-white mb-2">Workspace Settings</h1>
            <p className="text-sm text-gray-500 mb-8">Manage your organization and personal preferences</p>

            {/* Organization Settings */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center gap-3">
                    <BuildingIcon className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Organization Settings</h2>
                </div>
                <form onSubmit={handleSaveOrg} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Organization Name</label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                disabled={!isOwner && role !== 'admin'}
                                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Subdomain URL (Read-only)</label>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={slug}
                                    disabled
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-l-lg px-4 py-2.5 text-sm text-gray-500 focus:outline-none opacity-70"
                                />
                                <span className="bg-[#1a1a1a] border border-l-0 border-[#2a2a2a] rounded-r-lg px-4 py-2.5 text-sm text-gray-500">
                                    .sitepilot.app
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingOrg || (!isOwner && role !== 'admin')}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                        >
                            {savingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Personal Settings */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">Personal Profile</h2>
                </div>
                <form onSubmit={handleSaveProfile} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={userEmail}
                                disabled
                                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-gray-500 opacity-70 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Contact support to change your email.</p>
                        </div>
                    </div>

                    <hr className="border-[#1a1a1a] my-6" />

                    <h3 className="text-sm font-medium text-white mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                        >
                            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            {isOwner && (
                <div className="bg-[#111] border border-red-900/30 rounded-xl overflow-hidden p-6 relative">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900 left-0" />
                    <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h2>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-white font-medium mb-1">Delete Organization</p>
                            <p className="text-sm text-gray-500 max-w-lg">
                                Permanently delete this organization, all sites, assets, and billing data.
                                This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="shrink-0 px-4 py-2 border border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition"
                        >
                            Delete Organization
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Delete Organization</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            This action is irreversible. Please type <strong>{orgName}</strong> to confirm you want to permanently delete this organization.
                        </p>

                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder={orgName}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition mb-6"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-[#2a2a2a] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteOrg}
                                disabled={deleteConfirm !== orgName || deleting}
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                            >
                                {deleting ? 'Deleting...' : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
