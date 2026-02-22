import { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, History, Layers, Palette } from 'lucide-react';
import { getAllComponents } from '@/lib/componentRegistry';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import BrandingPanel from './BrandingPanel';

interface LeftPanelProps {
    siteId: string;
    addSection: (componentName: string) => void;
    handleAiEdit: (input: string) => void;
    aiLoading: boolean;
    onRestoreVersion: () => void; // Trigger full reload after restoring a version
}

export default function LeftPanel({
    siteId,
    addSection,
    handleAiEdit,
    aiLoading,
    onRestoreVersion
}: LeftPanelProps) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'blocks' | 'ai' | 'history' | 'branding'>('blocks');
    const [aiInput, setAiInput] = useState('');
    const [versions, setVersions] = useState<any[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);

    const allComponents = getAllComponents();
    const componentsByCategory = new Map<string, typeof allComponents>();
    for (const c of allComponents) {
        const list = componentsByCategory.get(c.category) ?? [];
        list.push(c);
        componentsByCategory.set(c.category, list);
    }

    const fetchVersions = async () => {
        setLoadingVersions(true);
        try {
            const res = await api.get(`/api/sites/${siteId}/versions`);
            if (res.success) {
                setVersions(res.versions);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingVersions(false);
        }
    };

    const handleRestore = async (versionId: string) => {
        try {
            const res = await api.post(`/api/sites/${siteId}/versions/restore/${versionId}`, {});
            if (res.success) {
                showToast('Version restored', 'success');
                onRestoreVersion();
            } else {
                showToast('Failed to restore version', 'error');
            }
        } catch (e) {
            showToast('Error restoring version', 'error');
        }
    };

    // Load versions when tab switches
    useEffect(() => {
        if (activeTab === 'history') {
            fetchVersions();
        }
    }, [activeTab]);

    return (
        <div className="w-[260px] bg-[#0f0f0f] border-r border-[#1a1a1a] flex flex-col shrink-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b border-[#1a1a1a] p-2 gap-1 bg-[#141414]">
                <button
                    onClick={() => setActiveTab('blocks')}
                    className={`flex-1 flex justify-center py-2 rounded-lg transition ${activeTab === 'blocks' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'}`}
                    title="Blocks"
                >
                    <Layers className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 flex justify-center py-2 rounded-lg transition ${activeTab === 'ai' ? 'bg-[#2a2a2a] text-purple-400' : 'text-gray-500 hover:text-purple-300 hover:bg-[#1a1a1a]'}`}
                    title="AI Edit"
                >
                    <Sparkles className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 flex justify-center py-2 rounded-lg transition ${activeTab === 'history' ? 'bg-[#2a2a2a] text-blue-400' : 'text-gray-500 hover:text-blue-300 hover:bg-[#1a1a1a]'}`}
                    title="History"
                >
                    <History className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setActiveTab('branding')}
                    className={`flex-1 flex justify-center py-2 rounded-lg transition ${activeTab === 'branding' ? 'bg-[#2a2a2a] text-pink-400' : 'text-gray-500 hover:text-pink-300 hover:bg-[#1a1a1a]'}`}
                    title="Branding"
                >
                    <Palette className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'branding' && <BrandingPanel siteId={siteId} />}
                {activeTab === 'blocks' && (
                    <div className="p-3">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Components</h3>
                        <div className="space-y-4">
                            {Array.from(componentsByCategory.entries()).map(([cat, comps]) => (
                                <div key={cat}>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">{cat}</p>
                                    <div className="space-y-0.5">
                                        {comps.map((c) => (
                                            <button
                                                key={c.name}
                                                onClick={() => addSection(c.name)}
                                                className="w-full text-left px-2 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition truncate"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="p-3 flex-1 flex flex-col">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" /> AI Edit
                        </h3>
                        <p className="text-[10px] text-gray-600 mb-2">
                            Select an element on canvas, then describe your edit.
                        </p>
                        <textarea
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="e.g. Make the headline more energetic and add a secondary CTA"
                            rows={4}
                            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500 transition"
                        />
                        <button
                            onClick={() => handleAiEdit(aiInput)}
                            disabled={aiLoading || !aiInput.trim()}
                            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                        >
                            {aiLoading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying...</>
                            ) : (
                                <><Send className="w-3.5 h-3.5" /> Apply AI Edit</>
                            )}
                        </button>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="p-3">
                        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3">Version History</h3>
                        {loadingVersions ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                            </div>
                        ) : versions.length === 0 ? (
                            <p className="text-xs text-gray-600">No versions saved yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {versions.map((ver) => (
                                    <div key={ver.id} className="bg-[#1a1a1a] rounded-lg px-3 py-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-white font-medium">{ver.label}</span>
                                            <span className="text-[10px] text-gray-500">
                                                {new Date(ver.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleRestore(ver.id)}
                                            className="text-[10px] text-purple-400 hover:text-purple-300 transition"
                                        >
                                            Restore
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
