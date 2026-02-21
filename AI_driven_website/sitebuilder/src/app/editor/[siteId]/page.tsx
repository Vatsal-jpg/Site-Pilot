'use client';

import dynamic from 'next/dynamic';

const GrapesEditor = dynamic(
    () => import('@/components/editor/GrapesEditor'),
    { ssr: false }
);

export default function EditorPage() {
    return <GrapesEditor />;
}
