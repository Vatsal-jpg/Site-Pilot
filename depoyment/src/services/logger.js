const fs = require("fs");
const path = require("path");

const LOG_DIR = process.env.LOG_DIR || "/opt/deploy-platform/logs";

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function createDeploymentLogger(slug) {
  const logFile = path.join(LOG_DIR, `${slug}.log`);
  const stream = fs.createWriteStream(logFile, { flags: "a" });

  const write = (level, message) => {
    const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    process.stdout.write(line);
    stream.write(line);
  };

  return {
    info:  (msg) => write("INFO",  msg),
    error: (msg) => write("ERROR", msg),
    step:  (msg) => write("STEP",  `── ${msg}`),
    done:  (msg) => write("DONE",  msg),
    close: ()    => stream.end(),
    logFile,
  };
}

module.exports = { createDeploymentLogger };
