const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { env, execPath } = require("node:process");

const npmCommand = env.npm_command;
const isCi = env.CI === "true" || env.GITHUB_ACTIONS === "true";
const shouldInstallHusky = npmCommand === "install" || npmCommand === "ci";
const gitDirectory = path.join(__dirname, "..", ".git");

if (isCi) {
  console.log("Skipping Husky install in CI.");
  process.exit(0);
}

if (!shouldInstallHusky) {
  console.log(
    `Skipping Husky install for npm command '${npmCommand ?? "unknown"}'.`,
  );
  process.exit(0);
}

if (!fs.existsSync(gitDirectory)) {
  console.log("Skipping Husky install because .git is not available.");
  process.exit(0);
}

const huskyBinPath = path.join(__dirname, "..", "node_modules", "husky", "bin.js");
const result = spawnSync(execPath, [huskyBinPath], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
