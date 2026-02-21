const { cloneRepo } = require("./git");
const { buildAndPushImage } = require("./docker");
const { applyManifest } = require("./kubernetes");
const { createDeploymentLogger } = require("./logger");

/**
 * Deployment status store.
 * In-memory for now — each key is a slug, value is the deployment state.
 * This will be replaced with a database later.
 *
 * @type {Map<string, DeploymentRecord>}
 */
const deployments = new Map();

/**
 * @typedef {Object} DeploymentRecord
 * @property {string} slug
 * @property {string} repo
 * @property {string} status        - "queued" | "cloning" | "building" | "deploying" | "live" | "failed"
 * @property {string|null} imageTag
 * @property {string|null} url
 * @property {string|null} error
 * @property {string} logFile
 * @property {string} queuedAt
 * @property {string|null} liveAt
 */

/**
 * Runs the full deployment pipeline for a given repo + slug.
 * This is intentionally async and not awaited by the route handler —
 * it runs in the background while the API has already returned 202.
 *
 * Stages:
 *   1. git clone
 *   2. detect output dir + generate Dockerfile
 *   3. docker build + push to local registry
 *   4. kubectl apply (Deployment + Service + Ingress)
 *
 * @param {string} repo  - Normalized GitHub repo URL
 * @param {string} slug  - Deployment slug
 */
async function runDeploymentPipeline(repo, slug) {
  const logger = createDeploymentLogger(slug);

  // Initialise the record
  deployments.set(slug, {
    slug,
    repo,
    status: "queued",
    imageTag: null,
    url: null,
    error: null,
    logFile: logger.logFile,
    queuedAt: new Date().toISOString(),
    liveAt: null,
  });

  const update = (patch) => {
    deployments.set(slug, { ...deployments.get(slug), ...patch });
  };

  try {
    // ── Stage 1: Clone ────────────────────────────────────────────────────────
    update({ status: "cloning" });
    logger.step("Stage 1/3 — Cloning repository");
    const repoPath = cloneRepo(repo, slug, logger);

    // ── Stage 2 & 3: Docker build + push ─────────────────────────────────────
    update({ status: "building" });
    logger.step("Stage 2/3 — Building and pushing Docker image");
    const imageTag = buildAndPushImage(repoPath, slug, logger);
    update({ imageTag });

    // ── Stage 4: Kubernetes apply ─────────────────────────────────────────────
    update({ status: "deploying" });
    logger.step("Stage 3/3 — Applying Kubernetes manifests");
    applyManifest(slug, imageTag, logger);

    // ── Done ──────────────────────────────────────────────────────────────────
    const url = `http://${slug}.localhost`;
    update({ status: "live", url, liveAt: new Date().toISOString() });
    logger.done(`Deployment live at ${url}`);

  } catch (err) {
    update({ status: "failed", error: err.message });
    logger.error(`Pipeline failed: ${err.message}`);
  } finally {
    logger.close();
  }
}

/**
 * Returns the current state of a deployment by slug.
 *
 * @param {string} slug
 * @returns {DeploymentRecord|null}
 */
function getDeployment(slug) {
  return deployments.get(slug) ?? null;
}

/**
 * Returns all deployment records.
 *
 * @returns {DeploymentRecord[]}
 */
function getAllDeployments() {
  return Array.from(deployments.values());
}

module.exports = { runDeploymentPipeline, getDeployment, getAllDeployments };
