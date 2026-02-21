const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BUILD_DIR = process.env.BUILD_DIR || "/opt/deploy-platform/builds";

// Ensure build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

/**
 * Clones a GitHub repo into /opt/deploy-platform/builds/<slug>.
 * If a previous clone exists for this slug, it is removed first.
 *
 * @param {string} repoUrl  - Normalized GitHub URL (no .git suffix)
 * @param {string} slug     - Deployment slug, used as directory name
 * @param {object} logger   - Deployment logger instance
 * @returns {string}        - Absolute path to the cloned repo
 */
function cloneRepo(repoUrl, slug, logger) {
  const dest = path.join(BUILD_DIR, slug);

  // Clean up any previous build for this slug
  if (fs.existsSync(dest)) {
    logger.info(`Removing previous build directory: ${dest}`);
    fs.rmSync(dest, { recursive: true, force: true });
  }

  logger.step(`Cloning ${repoUrl} → ${dest}`);

  execSync(`git clone --depth=1 ${repoUrl}.git ${dest}`, {
    stdio: "pipe", // capture output — we log it ourselves
    timeout: 60_000, // 60s max
  });

  logger.info(`Clone complete`);
  return dest;
}

module.exports = { cloneRepo };
