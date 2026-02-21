import express from "express";
import { suggestTheme, improveComponent } from "../ai";

const router = express.Router();

// ──────────────────────────────────────────────────────
// NOTE: This is an internal service called only by the
// backend server. It is NOT exposed to end users.
// No JWT auth is needed — the backend handles all auth.
// ──────────────────────────────────────────────────────

router.post("/ai/suggest-theme", async (req, res) => {
  try {
    const { description, businessType } = req.body;

    if (!description || !businessType) {
      return res.status(400).json({ error: "description and businessType are required" });
    }

    // Call wrapper — handles retries, parsing, validation, fallback
    const { data, tokensUsed } = await suggestTheme(description, businessType);

    return res.json({ data, tokensUsed });
  } catch (err) {
    console.error("[Route] suggest-theme error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/ai/improve-component", async (req, res) => {
  try {
    const { componentId, currentProps, instruction, businessContext } = req.body;

    if (!componentId || !currentProps || !instruction || !businessContext) {
      return res.status(400).json({ error: "componentId, currentProps, instruction, and businessContext are required" });
    }

    // Call wrapper — handles retries, parsing, validation, fallback
    const { data, tokensUsed } = await improveComponent(
      componentId,
      currentProps,
      instruction,
      businessContext
    );

    return res.json({ updatedProps: data, tokensUsed });
  } catch (err) {
    console.error("[Route] improve-component error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
