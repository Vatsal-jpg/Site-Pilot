'use client';

import { X, Sparkles, LayoutTemplate, Square } from 'lucide-react';

interface StartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: 'ai' | 'template' | 'blank') => void;
}

export default function StartModal({ isOpen, onClose, onSelect }: StartModalProps) {
    if (!isOpen) return null;

    const cards = [
        {
            type: 'ai' as const,
            icon: (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-white" />
                </div>
            ),
            title: 'AI site builder',
            subtitle: 'Quickly generate a custom website',
        },
        {
            type: 'template' as const,
            icon: (
                <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mb-4 relative">
                    <div className="flex gap-1">
                        <LayoutTemplate className="w-7 h-7 text-gray-500" />
                    </div>
                </div>
            ),
            title: 'Template',
            subtitle: 'Start with a design that fits your needs',
        },
        {
            type: 'blank' as const,
            icon: (
                <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mb-4">
                    <div className="flex gap-1">
                        <Square className="w-5 h-5 text-gray-400" />
                        <Square className="w-5 h-5 text-gray-400" />
                        <Square className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            ),
            title: 'Blank site',
            subtitle: 'Build a custom site from scratch',
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-[640px] w-full mx-4 p-8">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Select a way to get started
                </h2>

                {/* Cards */}
                <div className="grid grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <button
                            key={card.type}
                            onClick={() => onSelect(card.type)}
                            className="bg-gray-100 rounded-xl p-6 flex flex-col items-center text-center hover:bg-gray-200 transition cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {card.icon}
                            <span className="text-base font-semibold text-gray-900 mb-1">
                                {card.title}
                            </span>
                            <span className="text-sm text-gray-500">
                                {card.subtitle}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
