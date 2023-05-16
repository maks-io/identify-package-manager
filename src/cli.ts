#!/usr/bin/env node
import minimist from "minimist";
import { getHelp } from "./getHelp";
import { identifyPackageManager } from "./identifyPackageManager";

const packageJson = require("../package.json");
const argv = minimist(process.argv.slice(2));

const { h, help, v, version, n, nameonly, ...rest } = argv;

const remainingOptions = Object.keys(rest);
if (remainingOptions.length > 1) {
  console.log(`Option '${remainingOptions[1]}' unknown.\n`);
  console.log(getHelp(true));
  process.exit(0);
}

if (h || help) {
  console.log(getHelp(true));
  process.exit(0);
}

if (v || version) {
  console.log(packageJson.version);
  process.exit(0);
}

const output = identifyPackageManager(n || nameonly);
if (typeof output === "string") {
  console.log(output);
} else {
  console.log(JSON.stringify(output, null, 2));
}
