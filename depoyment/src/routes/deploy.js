const { Router } = require("express");
const { deployRequestSchema } = require("../validators/deployRequest");
const { runDeploymentPipeline, getDeployment, getAllDeployments } = require("../services/pipeline");

const router = Router();

// POST /deploy
// Validates the request, kicks off the pipeline in the background, returns 202 immediately.
router.post("/", (req, res, next) => {
  try {
    const result = deployRequestSchema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ error: "Validation failed", issues: fieldErrors });
    }

    const { repo, slug } = result.data;
    const normalizedRepo = repo.replace(/\.git$/, "");

    // Check if a deployment for this slug is already in progress
    const existing = getDeployment(slug);
    if (existing && ["queued", "cloning", "building", "deploying"].includes(existing.status)) {
      return res.status(409).json({
        error: "A deployment for this slug is already in progress",
        deployment: existing,
      });
    }

    // Fire the pipeline — not awaited, runs in background
    runDeploymentPipeline(normalizedRepo, slug);

    console.log(`[deploy] Pipeline started — slug: ${slug}, repo: ${normalizedRepo}`);

    return res.status(202).json({
      message: "Deployment started",
      deployment: {
        slug,
        repo: normalizedRepo,
        status: "queued",
        url: `http://${slug}.siteportal.web`,
        statusUrl: `/deploy/${slug}`,
        queuedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /deploy
// Returns all deployments.
router.get("/", (req, res) => {
  res.json({ deployments: getAllDeployments() });
});

// GET /deploy/:slug
// Returns the current status of a specific deployment.
// Poll this after POSTing to track progress.
router.get("/:slug", (req, res) => {
  const deployment = getDeployment(req.params.slug);

  if (!deployment) {
    return res.status(404).json({ error: `No deployment found for slug: ${req.params.slug}` });
  }

  return res.json({ deployment });
});

module.exports = { deployRoutes: router };
