const { env } = require("node:process");

const isCi = env.CI === "true" || env.GITHUB_ACTIONS === "true";
const isInteractiveCommit = env.FORCE_INTERACTIVE_COMMIT === "1";

if (isCi || isInteractiveCommit) {
  process.exit(0);
}

console.error("Use 'npm run commit' for conventional commits in this repository.");
process.exit(1);
