import { z } from "zod";

const FONT_OPTIONS = [
  "Inter", "Playfair Display", "Roboto", "Poppins",
  "Lato", "Merriweather", "Montserrat", "Open Sans",
  "Raleway", "Source Sans Pro"
] as const;

export const ThemeSchema = z.object({
  primaryColor:   z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be valid hex"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be valid hex"),
  accentColor:    z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be valid hex"),
  bgColor:        z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be valid hex"),
  headingFont:    z.enum(FONT_OPTIONS),
  bodyFont:       z.enum(FONT_OPTIONS),
  suggestedTagline: z.string().max(100),
});

export type ThemeOutput = z.infer<typeof ThemeSchema>;
