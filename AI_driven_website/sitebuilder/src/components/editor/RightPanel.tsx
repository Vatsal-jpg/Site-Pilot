'use client';

import { useEffect, useState, useRef } from 'react';
import type { Editor } from 'grapesjs';
import type { Site } from '@/lib/types';

interface RightPanelProps {
    editor: Editor | null;
    site: Site;
}

export default function RightPanel({ editor, site }: RightPanelProps) {
    const selectedComponentRef = useRef<any>(null);
    const [hasSelection, setHasSelection] = useState(false);
    const [styles, setStyles] = useState<Record<string, string>>({});
    const [elementInfo, setElementInfo] = useState<{ name: string; classes: string; tagName: string } | null>(null);

    useEffect(() => {
        if (!editor) return;

        const handleSelect = (component: any) => {
            try {
                if (!component || typeof component.getEl !== 'function') {
                    handleDeselect();
                    return;
                }

                // Get the actual DOM element inside the iframe
                const el = component.getEl();
                if (!el || el.nodeType !== 1) { // 1 === ELEMENT_NODE
                    handleDeselect();
                    return;
                }

                // Get GrapesJS managed styles
                const gjsStyles = component.getStyle() || {};

                // Get computed styles from the iframe's window safely
                let computed: Partial<CSSStyleDeclaration> = {};
                try {
                    const iframeWindow = editor.Canvas.getWindow();
                    if (iframeWindow) {
                        computed = iframeWindow.getComputedStyle(el);
                    }
                } catch (err) {
                    console.warn('Could not get computed style:', err);
                }

                selectedComponentRef.current = component;
                setHasSelection(true);

                setStyles({
                    // Layout
                    display: gjsStyles.display || computed.display || 'block',
                    flexDirection: gjsStyles['flex-direction'] || computed.flexDirection || 'row',
                    alignItems: gjsStyles['align-items'] || computed.alignItems || 'stretch',
                    justifyContent: gjsStyles['justify-content'] || computed.justifyContent || 'flex-start',
                    gap: gjsStyles.gap || computed.gap || '0',

                    // Spacing
                    marginTop: gjsStyles['margin-top'] || computed.marginTop || '0',
                    marginRight: gjsStyles['margin-right'] || computed.marginRight || '0',
                    marginBottom: gjsStyles['margin-bottom'] || computed.marginBottom || '0',
                    marginLeft: gjsStyles['margin-left'] || computed.marginLeft || '0',
                    paddingTop: gjsStyles['padding-top'] || computed.paddingTop || '0',
                    paddingRight: gjsStyles['padding-right'] || computed.paddingRight || '0',
                    paddingBottom: gjsStyles['padding-bottom'] || computed.paddingBottom || '0',
                    paddingLeft: gjsStyles['padding-left'] || computed.paddingLeft || '0',

                    // Size
                    width: gjsStyles.width || computed.width || 'auto',
                    height: gjsStyles.height || computed.height || 'auto',

                    // Typography
                    fontFamily: gjsStyles['font-family'] || computed.fontFamily || '',
                    fontSize: gjsStyles['font-size'] || computed.fontSize || '16px',
                    fontWeight: gjsStyles['font-weight'] || computed.fontWeight || '400',
                    lineHeight: gjsStyles['line-height'] || computed.lineHeight || 'normal',
                    color: gjsStyles.color || computed.color || '#000000',

                    // Background
                    backgroundColor: gjsStyles['background-color'] || computed.backgroundColor || 'transparent',

                    // Border
                    borderRadius: gjsStyles['border-radius'] || computed.borderRadius || '0',

                    // Effects
                    opacity: gjsStyles.opacity || computed.opacity || '1',
                });

                // Get element name for header
                const name = (typeof component.getName === 'function' ? component.getName() : null) || component.get?.('tagName') || 'Element';
                const compClasses = typeof component.getClasses === 'function' ? component.getClasses() : [];
                const classes = compClasses.slice(0, 2).join(' ');
                setElementInfo({ name, classes, tagName: component.get?.('tagName') || 'div' });
            } catch (error) {
                console.error('Error during component selection handling:', error);
                handleDeselect();
            }
        };

        const handleDeselect = () => {
            selectedComponentRef.current = null;
            setHasSelection(false);
            setStyles({});
            setElementInfo(null);
        };

        editor.on('component:selected', handleSelect);
        editor.on('component:deselected', handleDeselect);

        return () => {
            editor.off('component:selected', handleSelect);
            editor.off('component:deselected', handleDeselect);
        };
    }, [editor]);

    const updateStyle = (property: string, value: string) => {
        if (!selectedComponentRef.current) return;
        selectedComponentRef.current.addStyle({ [property]: value });
        setStyles(prev => ({ ...prev, [property]: value }));
    };

    if (!hasSelection) {
        return (
            <div className="w-[260px] bg-[#0f0f0f] border-l border-[#1a1a1a] flex flex-col shrink-0 p-4 items-center justify-center text-center h-full">
                <p className="text-xs text-gray-500">Select an element on the canvas to view and edit its styles.</p>
            </div>
        );
    }

    return (
        <div className="w-[260px] bg-[#0f0f0f] border-l border-[#1a1a1a] flex flex-col shrink-0 h-full overflow-y-auto">
            {/* Header */}
            <div className="p-3 border-b border-[#1a1a1a] sticky top-0 bg-[#0f0f0f] z-10">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">{elementInfo?.name}</h3>
                {elementInfo?.classes && (
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">.{elementInfo.classes}</p>
                )}
            </div>

            <div className="p-3 space-y-5">
                {/* Size */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Size</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-gray-600 block mb-1">W</label>
                            <input
                                value={styles.width || ''}
                                onChange={(e) => updateStyle('width', e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-2 py-1 text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-600 block mb-1">H</label>
                            <input
                                value={styles.height || ''}
                                onChange={(e) => updateStyle('height', e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-2 py-1 text-xs text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Spacing (Padding/Margin) */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Spacing</h4>
                    <div className="space-y-2">
                        <div>
                            <label className="text-[10px] text-gray-600 block mb-1">Padding (Top, Right, Bottom, Left)</label>
                            <div className="grid grid-cols-4 gap-1">
                                <input value={styles.paddingTop || ''} onChange={(e) => updateStyle('padding-top', e.target.value)} placeholder="T" className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-1.5 py-1 text-[10px] text-white text-center" />
                                <input value={styles.paddingRight || ''} onChange={(e) => updateStyle('padding-right', e.target.value)} placeholder="R" className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-1.5 py-1 text-[10px] text-white text-center" />
                                <input value={styles.paddingBottom || ''} onChange={(e) => updateStyle('padding-bottom', e.target.value)} placeholder="B" className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-1.5 py-1 text-[10px] text-white text-center" />
                                <input value={styles.paddingLeft || ''} onChange={(e) => updateStyle('padding-left', e.target.value)} placeholder="L" className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-1.5 py-1 text-[10px] text-white text-center" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Typography</h4>
                    <div className="space-y-2">
                        <div>
                            <label className="text-[10px] text-gray-600 block mb-1">Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={styles.color?.startsWith('#') ? styles.color.substring(0, 7) : '#ffffff'}
                                    onChange={(e) => updateStyle('color', e.target.value)}
                                    className="w-6 h-6 rounded bg-transparent cursor-pointer border-0 p-0"
                                />
                                <input
                                    value={styles.color || ''}
                                    onChange={(e) => updateStyle('color', e.target.value)}
                                    className="flex-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded px-2 py-1 text-xs text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-gray-600 block mb-1">Size</label>
                                <input
                                    value={styles.fontSize || ''}
                                    onChange={(e) => updateStyle('font-size', e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-2 py-1 text-xs text-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-600 block mb-1">Weight</label>
                                <input
                                    value={styles.fontWeight || ''}
                                    onChange={(e) => updateStyle('font-weight', e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded px-2 py-1 text-xs text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Background</h4>
                    <div>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={styles.backgroundColor?.startsWith('#') ? styles.backgroundColor.substring(0, 7) : '#000000'}
                                onChange={(e) => updateStyle('background-color', e.target.value)}
                                className="w-6 h-6 rounded bg-transparent cursor-pointer border-0 p-0"
                            />
                            <input
                                value={styles.backgroundColor || ''}
                                onChange={(e) => updateStyle('background-color', e.target.value)}
                                className="flex-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded px-2 py-1 text-xs text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
