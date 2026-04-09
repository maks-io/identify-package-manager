#!/usr/bin/env node
import * as path from "node:path";
import minimist from "minimist";
import { getHelp } from "./getHelp";
import { identifyPackageManager } from "./identifyPackageManager";

type PackageJson = {
  version: string;
};

type WritableOutput = {
  write: (chunk: string) => unknown;
};

const packageJson = require("../package.json") as PackageJson;

export const runCli = (
  rawArgs: string[],
  stdout: WritableOutput = process.stdout,
  stderr: WritableOutput = process.stderr,
): number => {
  const unknownOptions: string[] = [];
  const argv = minimist(rawArgs, {
    boolean: ["help", "version", "nameonly"],
    alias: {
      h: "help",
      v: "version",
      n: "nameonly",
    },
    unknown: (argument) => {
      if (argument.startsWith("-")) {
        unknownOptions.push(argument);
        return false;
      }

      return true;
    },
  });

  if (unknownOptions.length > 0) {
    stderr.write(`Unknown option: ${unknownOptions[0]}\n\n${getHelp(true)}\n`);
    return 1;
  }

  if (argv._.length > 1) {
    stderr.write(`Too many positional arguments.\n\n${getHelp(true)}\n`);
    return 1;
  }

  if (argv.help) {
    stdout.write(`${getHelp(true)}\n`);
    return 0;
  }

  if (argv.version) {
    stdout.write(`${packageJson.version}\n`);
    return 0;
  }

  const directory = argv._[0]
    ? path.resolve(String(argv._[0]))
    : process.cwd();
  const output = argv.nameonly
    ? identifyPackageManager(true, directory)
    : identifyPackageManager(false, directory);

  stdout.write(
    typeof output === "string"
      ? `${output}\n`
      : `${JSON.stringify(output, null, 2)}\n`,
  );

  return 0;
};

if (require.main === module) {
  process.exit(runCli(process.argv.slice(2)));
}
