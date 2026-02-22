import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../utils/prisma.js";
import PLAN_LIMITS from "../utils/planLimits.js";
import { buildSystemPromptContext, getComponent, getComponentSafe } from "../utils/componentRegistry.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─────────────────────────────────────────────────────────────────────────────
// Credit check helper
// ─────────────────────────────────────────────────────────────────────────────
async function checkCredits(tenantId) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { aiCreditsUsed: true, plan: true },
    });
    if (!tenant) throw new Error("Tenant not found");

    const limit = PLAN_LIMITS[tenant.plan].aiCreditsMonthly;
    if (tenant.aiCreditsUsed >= limit) {
        const err = new Error("AI credit limit reached");
        err.status = 429;
        throw err;
    }
    return tenant;
}

// ─────────────────────────────────────────────────────────────────────────────
// Record AI usage helper — fire-and-forget is fine, but we await for accuracy
// ─────────────────────────────────────────────────────────────────────────────
async function recordUsage(tenantId, userId, projectId, action, tokensUsed) {
    await prisma.$transaction([
        prisma.aIUsage.create({
            data: { tenantId, userId, projectId: projectId || null, action, tokensUsed },
        }),
        prisma.tenant.update({
            where: { id: tenantId },
            data: { aiCreditsUsed: { increment: 1 } },
        }),
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — translate layout JSON into plain English for Gemini
// ─────────────────────────────────────────────────────────────────────────────
function buildLayoutInstructions(componentId, layout = {}) {
    const ins = [];

    if (componentId === "navbar") {
        if (layout.linksAlign) ins.push(`Navigation links aligned to the ${layout.linksAlign}`);
        if (layout.sticky) ins.push("Sticky navbar fixed to the top of viewport");
        if (layout.background === "transparent") ins.push("Transparent background — overlaps hero");
        if (layout.background === "blur") ins.push("Frosted glass / backdrop blur background");
        if (layout.background === "solid") ins.push("Solid background color");
    }

    if (componentId === "hero") {
        if (layout.style === "centered") ins.push("Text centered horizontally and vertically");
        if (layout.style === "left-align") ins.push("Text left-aligned");
        if (layout.style === "split") ins.push("50/50 split — text left, image right");
        if (layout.height === "fullscreen") ins.push("Full viewport height (100vh)");
        if (layout.height === "half") ins.push("Half viewport height (50vh)");
        if (layout.overlay === "dark-40") ins.push("Dark overlay at 40% opacity over background");
        if (layout.overlay === "dark-60") ins.push("Dark overlay at 60% opacity over background");
        if (layout.overlay === "gradient") ins.push("Gradient overlay from transparent to dark bottom");
        if (layout.overlay === "none") ins.push("No overlay");
    }

    if (componentId === "feature_grid") {
        if (layout.columns) ins.push(`${layout.columns} columns on desktop, 1 column on mobile`);
        if (layout.cardStyle === "bordered") ins.push("Cards with visible border");
        if (layout.cardStyle === "shadow") ins.push("Cards with drop shadow, no border");
        if (layout.cardStyle === "flat") ins.push("Flat cards, no border or shadow");
        if (layout.alignment) ins.push(`Text ${layout.alignment}-aligned inside cards`);
    }

    if (componentId === "gallery") {
        if (layout.grid) ins.push(`${layout.grid} grid layout`);
        if (layout.aspect === "square") ins.push("Square aspect ratio images");
        if (layout.aspect === "wide") ins.push("Wide (16:9) aspect ratio images");
        if (layout.aspect === "portrait") ins.push("Portrait (3:4) aspect ratio images");
    }

    if (componentId === "contact") {
        if (layout.style === "form-left") ins.push("Form on left, supporting info on right");
        if (layout.style === "form-center") ins.push("Centered narrow form");
        if (layout.style === "form-right") ins.push("Form on right, supporting info on left");
        if (layout.width === "contained") ins.push("Max width container, not full bleed");
        if (layout.width === "full") ins.push("Full width layout");
    }

    if (componentId === "footer") {
        if (layout.columns) ins.push(`${layout.columns} columns for footer links/info`);
    }

    return ins.length > 0 ? ins.join("\n") : "Standard layout";
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/suggest-layout
//
// Body: { businessType, userPrompt, templateSystemPrompt }
// ─────────────────────────────────────────────────────────────────────────────
const suggestLayout = async (req, res) => {
    try {
        await checkCredits(req.user.tenantId);

        const { businessType, userPrompt, templateSystemPrompt } = req.body;

        const prompt = `
You are a website structure expert. Your job is to suggest the best page component order for a website's homepage.

Business type: ${businessType || "General business"}
User description: ${userPrompt || "A professional website"}
Template style: ${templateSystemPrompt || "Clean modern website"}

Only use components from this exact list:
navbar, hero, feature_grid, gallery, testimonials, text_block, contact, footer, pricing, team

Rules:
- Always start with "navbar" and end with "footer"
- Keep it between 4 and 7 components total
- Return ONLY valid JSON, nothing else

Expected format:
{
  "suggestedComponents": ["navbar", "hero", "feature_grid", "contact", "footer"],
  "reasoning": "One sentence explanation"
}
`.trim();

        const result = await geminiModel.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);

        await recordUsage(
            req.user.tenantId,
            req.user.id,
            req.body.projectId || null,
            "suggest_layout",
            result.response.usageMetadata?.totalTokenCount ?? 50
        );

        return res.status(200).json({ success: true, ...parsed });
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: error.message });
        }
        console.error("Suggest layout error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/generate-component
//
// Body: { componentId, props, layout, branding, userPrompt, templateSystemPrompt, projectId, pageComponentId? }
// ─────────────────────────────────────────────────────────────────────────────
const generateComponent = async (req, res) => {
    try {
        await checkCredits(req.user.tenantId);

        const {
            componentId,
            props = {},
            layout = {},
            branding = {},
            userPrompt = "",
            templateSystemPrompt = "",
            projectId,
            pageComponentId,
        } = req.body;

        if (!componentId) {
            return res.status(400).json({ success: false, message: "componentId is required" });
        }

        const layoutInstructions = buildLayoutInstructions(componentId, layout);

        const prompt = `
You are an expert web developer. Generate a single website section as clean, self-contained HTML.

COMPONENT TYPE: ${componentId}

STYLE CONTEXT:
${templateSystemPrompt || "Clean modern professional website"}

USER VISION:
${userPrompt || "Professional quality website"}

LAYOUT REQUIREMENTS:
${layoutInstructions}

CONTENT TO USE:
${JSON.stringify(props, null, 2)}

BRANDING:
Primary Color:   ${branding.primaryColor || "#1a1a2e"}
Secondary Color: ${branding.secondaryColor || "#e94560"}
Accent Color:    ${branding.accentColor || "#f5a623"}
Heading Font:    ${branding.headingFont || "Inter"}
Body Font:       ${branding.bodyFont || "Inter"}
Business Name:   ${branding.businessName || ""}

STRICT RULES:
- Use Tailwind CSS classes only (Tailwind CDN will be included in the page)
- Make it fully responsive (mobile-first)
- Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags
- Return ONLY the raw HTML for this single section — no markdown, no code fences, no explanation
- For exact brand colors that Tailwind can't match, use inline style attributes
- Write clean, semantic HTML5
`.trim();

        const result = await geminiModel.generateContent(prompt);
        const html = result.response.text().replace(/```html|```/g, "").trim();

        // Optionally persist to DB if pageComponentId given
        if (pageComponentId) {
            await prisma.pageComponent.update({
                where: { id: pageComponentId },
                data: { generatedHtml: html },
            });
        }

        await recordUsage(
            req.user.tenantId,
            req.user.id,
            projectId || null,
            "generate_component",
            result.response.usageMetadata?.totalTokenCount ?? 200
        );

        return res.status(200).json({ success: true, html });
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: error.message });
        }
        console.error("Generate component error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat-component
//
// Body: { pageComponentId, message, currentHtml, props, branding, projectId }
// ─────────────────────────────────────────────────────────────────────────────
const chatComponent = async (req, res) => {
    try {
        await checkCredits(req.user.tenantId);

        const {
            pageComponentId,
            message,
            currentHtml = "",
            props = {},
            branding = {},
            projectId,
        } = req.body;

        if (!pageComponentId || !message) {
            return res.status(400).json({
                success: false,
                message: "pageComponentId and message are required",
            });
        }

        // Verify ownership
        const comp = await prisma.pageComponent.findFirst({
            where: {
                id: pageComponentId,
                project: { tenantId: req.user.tenantId },
            },
        });
        if (!comp) {
            return res.status(404).json({ success: false, message: "Component not found" });
        }

        const prompt = `
You are improving an existing website component.

CURRENT HTML:
${currentHtml || comp.generatedHtml || "(empty — generate from scratch)"}

COMPONENT PROPS FOR CONTEXT:
${JSON.stringify(props || comp.props)}

BRANDING:
Primary Color: ${branding.primaryColor || "#1a1a2e"}
Accent Color:  ${branding.accentColor || "#f5a623"}
Font:          ${branding.headingFont || "Inter"}

USER REQUEST:
${message}

STRICT RULES:
- Keep everything not mentioned by the user exactly the same
- Use Tailwind CSS classes only
- Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags
- Return ONLY the updated HTML — no markdown, no code fences, no explanation
`.trim();

        const result = await geminiModel.generateContent(prompt);
        const updatedHtml = result.response.text().replace(/```html|```/g, "").trim();

        // Save updated HTML + chat messages
        await prisma.$transaction([
            prisma.pageComponent.update({
                where: { id: pageComponentId },
                data: { generatedHtml: updatedHtml },
            }),
            prisma.componentChat.createMany({
                data: [
                    { pageComponentId, role: "user", message },
                    { pageComponentId, role: "assistant", message: "Updated as requested" },
                ],
            }),
        ]);

        await recordUsage(
            req.user.tenantId,
            req.user.id,
            projectId || null,
            "chat_component",
            result.response.usageMetadata?.totalTokenCount ?? 150
        );

        return res.status(200).json({ success: true, updatedHtml });
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: error.message });
        }
        console.error("Chat component error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
const getChatHistory = async (req, res) => {
    try {
        const { pageComponentId } = req.params;

        // Verify ownership via project relation
        const comp = await prisma.pageComponent.findFirst({
            where: {
                id: pageComponentId,
                project: { tenantId: req.user.tenantId },
            },
        });
        if (!comp) {
            return res.status(404).json({ success: false, message: "Component not found" });
        }

        const chats = await prisma.componentChat.findMany({
            where: { pageComponentId },
            orderBy: { createdAt: "asc" },
            select: { id: true, role: true, message: true, createdAt: true },
        });

        return res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Get chat history error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ─── Shared Gemini Methods ───────────────────────────────────────────────────

const JSON_SUFFIX = `\n\nCRITICAL: Return ONLY raw JSON. No markdown. No backticks. No explanation. Start your response with { or [ and end with } or ].`;

function cleanJSON(raw) {
    return raw
        .replace(/^```json\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
}

function getComponentSchema(componentName) {
    const comp = getComponentSafe(componentName);
    return comp ? JSON.stringify(comp, null, 2) : "No schema available for this custom component type.";
}

async function callGemini(systemPrompt, userMessage) {
    const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
        },
        systemInstruction: systemPrompt + JSON_SUFFIX,
    });
    return cleanJSON(result.response.text());
}

// ─── New Site Builder AI Endpoints ───────────────────────────────────────────

const generateStructure = async (req, res) => {
    try {
        await checkCredits(req.user.tenantId);

        const { prompt, businessType, siteName, planPageLimit = 5 } = req.body;

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
6. Maximum pages allowed: ${planPageLimit}
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

        const userMessage = `Business type: ${businessType}
Site name: ${siteName}
Description: ${prompt}
Max pages: ${planPageLimit}

Plan the best website structure for this business.`;

        const text = await callGemini(systemPrompt, userMessage);
        const parsed = JSON.parse(text);

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

            return { name: page.name, slug: page.slug, sections };
        });

        // Increment tenant usage
        await prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: { aiCreditsUsed: { increment: 1 } },
        });

        return res.status(200).json({ success: true, pages: fixedPages, summary: parsed.summary });
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: error.message });
        }
        console.error("Generate structure error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const generateContent = async (req, res) => {
    try {
        await checkCredits(req.user.tenantId);

        const { pageName, pageType, sections, siteContext } = req.body;

        const schemas = sections
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
- Site name: ${siteContext.siteName}
- Business type: ${siteContext.businessType}
- Description: ${siteContext.prompt}
- Brand color: ${siteContext.brandColor}

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

        const userMessage = `Page: ${pageName}
Sections to fill: ${sections.join(', ')}

Generate compelling content for all sections on this page.`;

        const text = await callGemini(systemPrompt, userMessage);

        await prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: { aiCreditsUsed: { increment: 1 } },
        });

        return res.status(200).json(JSON.parse(text));
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: error.message });
        }
        console.error("Generate content error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const editSection = async (req, res) => {
    try {
        await checkCredits(req.user.tenantId);

        const { instruction, currentSection, siteContext } = req.body;
        const schema = getComponentSchema(currentSection.componentType);

        const systemPrompt = `You are editing a single website section based on a user instruction.
You must return the complete updated section with all slots filled.
Return ONLY valid JSON, no explanation, no markdown.

Current section type: ${currentSection.componentType}
Schema for this component: ${schema}

Site context:
- Site name: ${siteContext.siteName}
- Brand color: ${siteContext.brandColor}
- Business type: ${siteContext.businessType}

Current slot values:
${JSON.stringify(currentSection.slots, null, 2)}

RULES:
1. Keep the exact same JSON structure for slots.
2. If the user asks for a new image, update any relevant image slots (e.g. "imageQuery", "imageUrl", "image", "src") with 2-4 descriptive keywords for an Unsplash search (e.g. "ice cream delicious", "office professional"). Do NOT provide raw URLs unless requested.

Return format:
{
  "componentType": "same as input",
  "variant": "dark|light|brand",
  "slots": { ...all slots filled }
}`;

        const text = await callGemini(systemPrompt, instruction);

        // Costs less
        await prisma.tenant.update({
            where: { id: req.user.tenantId },
            data: { aiCreditsUsed: { increment: 1 } }, // Using 1 for simplicity of integer type in Prisma schema
        });

        return res.status(200).json(JSON.parse(text));
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ success: false, message: error.message });
        }
        console.error("Edit section error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export {
    suggestLayout, generateComponent, chatComponent, getChatHistory,
    generateStructure, generateContent, editSection
};
