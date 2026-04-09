const fs = require("node:fs");
const path = require("node:path");

const cliPath = path.join(__dirname, "..", "build", "cli.js");

if (fs.existsSync(cliPath)) {
  fs.chmodSync(cliPath, 0o755);
}
