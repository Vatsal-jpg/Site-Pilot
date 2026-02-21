import { callAI } from "./callAI";
import { ThemeSchema, ThemeOutput } from "./schema";

const FALLBACK_THEME: ThemeOutput = {
  primaryColor: "#1a1a2e",
  secondaryColor: "#e94560",
  accentColor: "#f5a623",
  bgColor: "#ffffff",
  headingFont: "Inter",
  bodyFont: "Inter",
  suggestedTagline: "Building something great",
};

export async function suggestTheme(
  description: string,
  businessType: string
): Promise<{ data: ThemeOutput; tokensUsed: number }> {

  const prompt = `
You are a professional brand designer. Suggest a color palette and font pairing 
for a business website.

Business Description: ${description}
Business Type: ${businessType}

Return a JSON object with EXACTLY these keys and types:
{
  "primaryColor": "#rrggbb",
  "secondaryColor": "#rrggbb",
  "accentColor": "#rrggbb",
  "bgColor": "#rrggbb",
  "headingFont": "must be one of: Inter, Playfair Display, Roboto, Poppins, Lato, Merriweather, Montserrat, Open Sans, Raleway, Source Sans Pro",
  "bodyFont": "must be one of the same list above",
  "suggestedTagline": "short tagline under 60 characters"
}

Rules:
- All hex values must be valid 6-digit hex codes starting with #
- Font values must match exactly one of the listed options — spelling and 
  capitalization must be exact
- suggestedTagline must be under 60 characters
- Return ONLY the JSON object — no explanation, no markdown
`;

  return callAI(prompt, ThemeSchema, FALLBACK_THEME);
}
