import { model } from "./gemini";
import { ZodSchema } from "zod";

const MAX_RETRIES = 3;

export async function callAI<T>(
  prompt: string,
  schema: ZodSchema<T>,
  fallback: T
): Promise<{ data: T; tokensUsed: number }> {

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();
      const tokensUsed = result.response.usageMetadata?.totalTokenCount ?? 0;

      // Strip markdown fences as defense-in-depth (should not appear due to 
      // responseMimeType but protect anyway)
      const cleaned = rawText.replace(/```json|```/gi, "").trim();

      const parsed = JSON.parse(cleaned);
      const validated = schema.parse(parsed); // throws ZodError if shape is wrong

      return { data: validated, tokensUsed };

    } catch (err) {
      console.warn(`[AI] Attempt ${attempt}/${MAX_RETRIES} failed:`, 
        err instanceof Error ? err.message : err);
      
      if (attempt === MAX_RETRIES) {
        console.error("[AI] All retries exhausted. Returning fallback.");
        return { data: fallback, tokensUsed: 0 };
      }

      // Exponential backoff: 500ms, 1000ms, 1500ms
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }

  // TypeScript requires this even though it's unreachable
  return { data: fallback, tokensUsed: 0 };
}
