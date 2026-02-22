'use client';

import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Plus, Shield, User as UserIcon, ShieldAlert, Mail, Send, X, Trash2, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface PendingInvite {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    expiresAt: string;
}

export default function TeamPage() {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');

    const [currentUserRole, setCurrentUserRole] = useState('viewer'); // Will be updated on load

    useEffect(() => {
        async function loadTeam() {
            try {
                const [teamRes, meRes] = await Promise.all([
                    api.get('/api/team'),
                    api.get('/api/auth/me')
                ]);
                setMembers(teamRes.members || []);
                setInvites(teamRes.pendingInvites || []);
                setCurrentUserRole(meRes.user.role || 'viewer');
            } catch (error) {
                console.error('Failed to load team:', error);
            } finally {
                setLoading(false);
            }
        }
        loadTeam();
    }, []);

    // Click outside to close standard menus
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        try {
            const res = await api.post('/api/team/invite', { email: inviteEmail, role: inviteRole });
            if (res.invite) {
                setInvites([...invites, res.invite]);
                setIsInviteModalOpen(false);
                setInviteEmail('');
                setInviteRole('editor');
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to send invite');
        }
    };

    const handleCancelInvite = async (inviteId: string) => {
        try {
            await api.delete(`/api/team/invites/${inviteId}`);
            setInvites(invites.filter(i => i.id !== inviteId));
        } catch (error) {
            alert('Failed to cancel invite');
        }
    };

    const handleChangeRole = async (userId: string, targetRole: string) => {
        try {
            const res = await api.patch(`/api/team/${userId}/role`, { role: targetRole });
            if (res.user) {
                setMembers(members.map(m => m.id === userId ? { ...m, role: targetRole } : m));
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to change role');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await api.delete(`/api/team/${userId}`);
            setMembers(members.filter(m => m.id !== userId));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to remove member');
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner': return <span className="bg-purple-500/20 text-purple-400 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">{role}</span>;
            case 'admin': return <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">{role}</span>;
            case 'editor': return <span className="bg-gray-500/20 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">{role}</span>;
            default: return <span className="bg-slate-500/20 text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">{role}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

    return (
        <div className="p-8 pb-20 max-w-6xl mx-auto w-full relative">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Team Members</h1>
                    <p className="text-sm text-gray-500">Manage who has access to this workspace</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    disabled={!canManage}
                    title={!canManage ? "Only admins can invite members" : ""}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    <Plus className="w-4 h-4" /> Invite Member
                </button>
            </div>

            {/* Members Table */}
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-visible mb-10">
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0a0a0a] border-b border-[#1a1a1a]">
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Member</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#141414]">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${member.role === 'owner' ? 'bg-purple-600' : 'bg-gray-700'
                                                }`}>
                                                <span className="text-xs font-bold text-white">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{member.name}</div>
                                                <div className="text-xs text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(member.role)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === member.id ? null : member.id);
                                                }}
                                                disabled={!canManage || member.role === 'owner'}
                                                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:hover:bg-transparent transition"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>

                                            {openMenuId === member.id && canManage && member.role !== 'owner' && (
                                                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg shadow-xl py-1 z-10 origin-top-right">
                                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Change Role</div>
                                                    <button onClick={(e) => { e.stopPropagation(); handleChangeRole(member.id, 'admin'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#242424] hover:text-white flex items-center justify-between">
                                                        Admin {member.role === 'admin' && <Check className="w-4 h-4 text-purple-500" />}
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleChangeRole(member.id, 'editor'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#242424] hover:text-white flex items-center justify-between">
                                                        Editor {member.role === 'editor' && <Check className="w-4 h-4 text-purple-500" />}
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleChangeRole(member.id, 'viewer'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#242424] hover:text-white flex items-center justify-between">
                                                        Viewer {member.role === 'viewer' && <Check className="w-4 h-4 text-purple-500" />}
                                                    </button>
                                                    <div className="h-px bg-[#2e2e2e] my-1 mx-2" />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.id); setOpenMenuId(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#311] hover:text-red-300 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Remove Member
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Invites */}
            {invites.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Pending Invites</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invites.map((invite) => (
                            <div key={invite.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-300">{invite.email}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getRoleBadge(invite.role)}
                                        <span className="text-[10px] text-gray-600">Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {canManage && (
                                    <button
                                        onClick={() => handleCancelInvite(invite.id)}
                                        className="text-gray-500 hover:text-red-400 p-2"
                                        title="Cancel Invite"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite Modal Overlay */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
                                <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-500 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleInvite}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="colleague@company.com"
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                                        />
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition appearance-none"
                                    >
                                        <option value="admin">Admin - Can manage team and settings</option>
                                        <option value="editor">Editor - Can create and edit sites</option>
                                        <option value="viewer">Viewer - Can only view sites</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsInviteModalOpen(false)}
                                        className="px-4 py-2 border border-[#2a2a2a] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                                    >
                                        <Send className="w-4 h-4" /> Send Invite
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
