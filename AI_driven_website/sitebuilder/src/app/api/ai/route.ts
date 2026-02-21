import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    buildSystemPromptContext,
    getComponent,
    validateSectionList,
} from '@/lib/componentRegistry';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const JSON_SUFFIX = `

CRITICAL: Return ONLY raw JSON. No markdown. No backticks. No explanation. Start your response with { or [ and end with } or ].`;

function cleanJSON(raw: string): string {
    return raw
        .replace(/^```json\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
}

function getComponentSchema(componentName: string): string {
    const comp = getComponent(componentName);
    return JSON.stringify(comp, null, 2);
}

async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
        },
        systemInstruction: systemPrompt + JSON_SUFFIX,
    });
    return cleanJSON(result.response.text());
}

// ─── Generate Structure ───────────────────────────────────────────────────────

async function handleGenerateStructure(payload: {
    prompt: string;
    businessType: string;
    siteName: string;
    planPageLimit: number;
}) {
    const systemPrompt = `You are a website structure planner for a professional website builder.

Your job is to decide which pages a website needs and which sections go on each page.

AVAILABLE COMPONENTS (use ONLY these exact names, no others):
${buildSystemPromptContext()}

STRICT RULES:
1. Every page MUST start with NavBar or NavBarCentered
2. Every page MUST end with FooterFull, FooterMinimal, or FooterWithNewsletter
3. Hero sections (HeroSplit, HeroCentered, HeroFullBleed, HeroMinimal, HeroWithVideo, HeroWithForm) must be second — never use more than one hero per page
4. These components can appear MAXIMUM ONCE per page: all Hero types, PricingTable
5. Maximum 8 sections per page, minimum 3
6. Maximum pages allowed: ${payload.planPageLimit}
7. Return ONLY valid JSON, no explanation, no markdown, no backticks

RETURN FORMAT:
{
  "summary": "2-3 sentence description of the site you planned",
  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "pageType": "home",
      "sections": ["NavBar", "HeroSplit", "LogoBar", "FeatureGrid", "FooterFull"]
    }
  ]
}`;

    const userMessage = `Business type: ${payload.businessType}
Site name: ${payload.siteName}
Description: ${payload.prompt}
Max pages: ${payload.planPageLimit}

Plan the best website structure for this business.`;

    const text = await callGemini(systemPrompt, userMessage);
    const parsed = JSON.parse(text) as {
        summary: string;
        pages: { name: string; slug: string; pageType: string; sections: string[] }[];
    };

    const NAV_NAMES = ['NavBar', 'NavBarCentered'];
    const FOOTER_NAMES = ['FooterFull', 'FooterMinimal', 'FooterWithNewsletter'];
    const HERO_NAMES = [
        'HeroSplit', 'HeroCentered', 'HeroFullBleed',
        'HeroMinimal', 'HeroWithVideo', 'HeroWithForm',
    ];

    const fixedPages = parsed.pages.map((page) => {
        let sections = [...page.sections];

        if (sections.length === 0 || !NAV_NAMES.includes(sections[0])) {
            sections = sections.filter((s) => !NAV_NAMES.includes(s));
            sections.unshift('NavBar');
        }

        if (sections.length === 0 || !FOOTER_NAMES.includes(sections[sections.length - 1])) {
            sections = sections.filter((s) => !FOOTER_NAMES.includes(s));
            sections.push('FooterFull');
        }

        const heroIdx = sections.findIndex((s) => HERO_NAMES.includes(s));
        if (heroIdx > 1) {
            const [hero] = sections.splice(heroIdx, 1);
            sections.splice(1, 0, hero);
        }

        if (sections.length > 8) {
            const nav = sections[0];
            const footer = sections[sections.length - 1];
            const middle = sections.slice(1, -1).slice(0, 6);
            sections = [nav, ...middle, footer];
        }

        validateSectionList(sections);

        return { name: page.name, slug: page.slug, sections };
    });

    return { pages: fixedPages, summary: parsed.summary };
}

// ─── Generate Content ─────────────────────────────────────────────────────────

async function handleGenerateContent(payload: {
    pageName: string;
    pageType: string;
    sections: string[];
    siteContext: {
        siteName: string;
        prompt: string;
        businessType: string;
        brandColor: string;
        logoUrl?: string;
    };
}) {
    const schemas = payload.sections
        .map((name) => {
            try {
                return `### ${name}\n${getComponentSchema(name)}`;
            } catch {
                return '';
            }
        })
        .filter(Boolean)
        .join('\n\n');

    const systemPrompt = `You are a professional copywriter and web content generator.

You will be given a list of website sections and you must fill in the content for each one.

SITE CONTEXT:
- Site name: ${payload.siteContext.siteName}
- Business type: ${payload.siteContext.businessType}
- Description: ${payload.siteContext.prompt}
- Brand color: ${payload.siteContext.brandColor}

COMPONENT SCHEMAS:
${schemas}

RULES:
1. Write real, specific, professional copy — never use Lorem Ipsum
2. Headlines should be punchy, max words as specified per slot
3. For imageQuery slots: write 2-4 descriptive keywords for Unsplash search that match the business type and tone. Examples: "fintech office professional", "creative studio colorful workspace", "restaurant food elegant"
4. For avatarQuery slots: write "professional headshot [gender] [ethnicity]" — vary across testimonials/team
5. For icon slots: write a single relevant emoji
6. Keep tone consistent with businessType
7. Return ONLY valid JSON array, no explanation, no markdown, no backticks

RETURN FORMAT — a JSON array, one object per section:
[
  {
    "componentType": "HeroSplit",
    "variant": "dark",
    "slots": {
      "headline": "actual headline here",
      "subtext": "actual subtext here",
      "ctaLabel": "Get started",
      "ctaUrl": "#contact",
      "imageQuery": "fintech office professional"
    }
  }
]`;

    const userMessage = `Page: ${payload.pageName}
Sections to fill: ${payload.sections.join(', ')}

Generate compelling content for all sections on this page.`;

    const text = await callGemini(systemPrompt, userMessage);
    return JSON.parse(text);
}

// ─── Edit Section ─────────────────────────────────────────────────────────────

async function handleEditSection(payload: {
    instruction: string;
    currentSection: { componentType: string; variant: string; slots: Record<string, unknown> };
    siteContext: { siteName: string; brandColor: string; businessType: string };
}) {
    const schema = getComponentSchema(payload.currentSection.componentType);

    const systemPrompt = `You are editing a single website section based on a user instruction.
You must return the complete updated section with all slots filled.
Return ONLY valid JSON, no explanation, no markdown.

Current section type: ${payload.currentSection.componentType}
Schema for this component: ${schema}

Site context:
- Site name: ${payload.siteContext.siteName}
- Brand color: ${payload.siteContext.brandColor}
- Business type: ${payload.siteContext.businessType}

Current slot values:
${JSON.stringify(payload.currentSection.slots, null, 2)}

Return format:
{
  "componentType": "same as input",
  "variant": "dark|light|brand",
  "slots": { ...all slots filled }
}`;

    const text = await callGemini(systemPrompt, payload.instruction);
    return JSON.parse(text);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, payload } = body;

        let result;

        switch (action) {
            case 'generateStructure':
                result = await handleGenerateStructure(payload);
                break;
            case 'generateContent':
                result = await handleGenerateContent(payload);
                break;
            case 'editSection':
                result = await handleEditSection(payload);
                break;
            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[AI Route Error]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
