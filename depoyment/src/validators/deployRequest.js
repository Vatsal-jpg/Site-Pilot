const { z } = require("zod");

// Slug rules:
//  - lowercase letters, numbers, hyphens only
//  - cannot start or end with a hyphen
//  - 3 to 48 characters
//  - this becomes the subdomain: <slug>.localhost
const slugSchema = z
  .string({ required_error: "slug is required" })
  .min(3, "slug must be at least 3 characters")
  .max(48, "slug must be at most 48 characters")
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    "slug must be lowercase alphanumeric with hyphens, and cannot start or end with a hyphen"
  );

// Repo URL rules:
//  - must be a valid URL
//  - must be a github.com URL
//  - must match the pattern github.com/<owner>/<repo>
//  - optional .git suffix is allowed
const repoUrlSchema = z
  .string({ required_error: "repo is required" })
  .url("repo must be a valid URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname === "github.com";
      } catch {
        return false;
      }
    },
    { message: "repo must be a GitHub URL (github.com)" }
  )
  .refine(
    (url) => {
      const parsed = new URL(url);
      // Path should be /owner/repo or /owner/repo.git
      const pathParts = parsed.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
      return pathParts.length === 2;
    },
    { message: "repo URL must point to a repository e.g. https://github.com/owner/repo" }
  );

const deployRequestSchema = z.object({
  repo: repoUrlSchema,
  slug: slugSchema,
});

module.exports = { deployRequestSchema };
