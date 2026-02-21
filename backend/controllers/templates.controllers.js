import prisma from "../utils/prisma.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/templates
// ─────────────────────────────────────────────────────────────────────────────
const getTemplates = async (req, res) => {
    try {
        const { category } = req.query;

        const templates = await prisma.template.findMany({
            where: {
                isActive: true,
                ...(category && category !== "all" ? { category } : {}),
            },
            select: {
                id: true,
                name: true,
                category: true,
                thumbnailUrl: true,
                previewUrl: true,
                requiredPlan: true,
                systemPrompt: true,
                suggestedComponents: true,
            },
            orderBy: { sortOrder: "asc" },
        });

        return res.status(200).json({ success: true, templates });
    } catch (error) {
        console.error("Templates error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getTemplates };
