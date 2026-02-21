import { model } from "./gemini";

interface BusinessContext {
  businessName: string;
  description: string;
  businessType: string;
}

export async function improveComponent(
  componentId: string,
  currentProps: Record<string, any>,
  instruction: string,
  businessContext: BusinessContext
): Promise<{ data: Record<string, any>; tokensUsed: number }> {

  const allowedKeys = Object.keys(currentProps);
  const MAX_RETRIES = 3;

  const prompt = `
You are a professional copywriter improving website component content.

Business: ${businessContext.businessName} (${businessContext.businessType})
Description: ${businessContext.description}

Component being improved: ${componentId}
Current props:
${JSON.stringify(currentProps, null, 2)}

Improvement instruction: "${instruction}"

Return a JSON object with EXACTLY these keys: ${allowedKeys.join(", ")}

Rules:
- Every key from the input must appear in your output — no more, no less
- Keep the same data types as the original (string stays string, etc.)
- Only improve text/string values based on the instruction
- Do not change URLs, hex color codes, boolean values, or numbers
- Return ONLY the JSON object — no explanation, no markdown
`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();
      const tokensUsed = result.response.usageMetadata?.totalTokenCount ?? 0;

      const cleaned = rawText.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleaned);

      // Validate keys manually since schema is dynamic
      const returnedKeys = Object.keys(parsed);
      const missingKeys = allowedKeys.filter(k => !returnedKeys.includes(k));
      const extraKeys = returnedKeys.filter(k => !allowedKeys.includes(k));

      if (missingKeys.length > 0) {
        throw new Error(`Missing keys in AI response: ${missingKeys.join(", ")}`);
      }
      if (extraKeys.length > 0) {
        throw new Error(`Extra keys in AI response: ${extraKeys.join(", ")}`);
      }

      return { data: parsed, tokensUsed };

    } catch (err) {
      console.warn(`[AI] improveComponent attempt ${attempt}/${MAX_RETRIES} failed:`,
        err instanceof Error ? err.message : err);

      if (attempt === MAX_RETRIES) {
        console.error("[AI] All retries exhausted. Returning original props unchanged.");
        return { data: currentProps, tokensUsed: 0 };
      }

      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }

  return { data: currentProps, tokensUsed: 0 };
}
