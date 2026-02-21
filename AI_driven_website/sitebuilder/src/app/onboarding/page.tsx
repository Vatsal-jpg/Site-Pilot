'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptPage from '@/components/onboarding/PromptPage';
import StructurePage from '@/components/onboarding/StructurePage';
import PreviewPage from '@/components/onboarding/PreviewPage';
import type { PromptData } from '@/components/onboarding/PromptPage';
import type { StructuredPage } from '@/components/onboarding/StructurePage';
import type { Site } from '@/lib/types';

type Step = 'prompt' | 'structure' | 'preview';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('prompt');
    const [promptData, setPromptData] = useState<PromptData | null>(null);
    const [structuredPages, setStructuredPages] = useState<StructuredPage[] | null>(null);

    const handlePromptComplete = (data: PromptData) => {
        setPromptData(data);
        setStep('structure');
    };

    const handleStructureComplete = (pages: StructuredPage[]) => {
        setStructuredPages(pages);
        setStep('preview');
    };

    const handlePreviewComplete = (site: Site) => {
        router.push(`/editor/${site.id}`);
    };

    switch (step) {
        case 'prompt':
            return <PromptPage onComplete={handlePromptComplete} />;
        case 'structure':
            return (
                <StructurePage
                    promptData={promptData!}
                    onComplete={handleStructureComplete}
                    onBack={() => setStep('prompt')}
                />
            );
        case 'preview':
            return (
                <PreviewPage
                    promptData={promptData!}
                    pages={structuredPages!}
                    onComplete={handlePreviewComplete}
                    onBack={() => setStep('structure')}
                />
            );
    }
}
