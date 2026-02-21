import prisma from "../utils/prisma.js";
import PLAN_LIMITS from "../utils/planLimits.js";

// ─────────────────────────────────────────
// POST /api/ai/suggest-theme
// ─────────────────────────────────────────
const suggestTheme = async (req, res) => {
    try {
        const { description, businessType } = req.body;

        if (!description || !businessType) {
            return res.status(400).json({
                success: false,
                message: "description and businessType are required",
            });
        }

        // 1. Check AI credits
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.user.tenantId },
            select: { aiCreditsUsed: true, plan: true },
        });

        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const limit = PLAN_LIMITS[tenant.plan].aiCreditsMonthly;
        if (tenant.aiCreditsUsed >= limit) {
            return res.status(429).json({ success: false, message: "AI credit limit reached" });
        }

        // 2. Call Gemini API
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                success: false,
                message: "AI service not configured (missing GEMINI_API_KEY)",
            });
        }

        // Dynamic import to avoid crash if package not installed
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are a brand designer. Based on this business description,
suggest a professional color palette and font pairing.
Business: ${description}
Type: ${businessType}

Return ONLY valid JSON in this exact shape:
{
  "primaryColor":     "#hexcode",
  "secondaryColor":   "#hexcode",
  "accentColor":      "#hexcode",
  "bgColor":          "#hexcode",
  "headingFont":      "Google Font Name",
  "bodyFont":         "Google Font Name",
  "suggestedTagline": "short tagline string"
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Strip markdown fences if present
        const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(jsonStr);

        // 3. Get token usage
        const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;

        // 4. Record usage
        await prisma.$transaction([
            prisma.aIUsage.create({
                data: {
                    tenantId: req.user.tenantId,
                    userId: req.user.id,
                    action: "suggest_theme",
                    tokensUsed,
                },
            }),
            prisma.tenant.update({
                where: { id: req.user.tenantId },
                data: { aiCreditsUsed: { increment: 1 } },
            }),
        ]);

        return res.status(200).json({
            success: true,
            ...parsed,
        });
    } catch (error) {
        console.error("AI suggest-theme error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { suggestTheme };
