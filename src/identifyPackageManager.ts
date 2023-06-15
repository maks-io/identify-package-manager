import path from "path";
import { whoAmINow } from "who-am-i-now";
import { identifyMonorepoRoot } from "identify-monorepo-root";
import { PackageManagerInfo, PackageManagerName } from "./PackageManagerInfo";
import { getDetailedVersionFromSimple } from "./getDetailedVersionFromSimple";

export function identifyPackageManager(returnNameOnly?: false): PackageManagerInfo;
export function identifyPackageManager(returnNameOnly: true): PackageManagerName;
export function identifyPackageManager(returnNameOnly?: boolean) {
  const who = whoAmINow();

  if (!who.isServerApp) {
    throw new Error(
      "Library 'identify-package-manager' can only be used server side."
    );
  }

  let fs;
  try {
    fs = require("fs");
  } catch (e) {
    // do nothing
  }

  const monorepoRoot = identifyMonorepoRoot();

  const files = fs.readdirSync(monorepoRoot);
  const packageJson = files.find((f) => f === "package.json");

  if (!packageJson) {
    throw new Error(`No package.json file found in path ${monorepoRoot}`);
  }

  const packageJsonFile = JSON.parse(
    fs.readFileSync(path.resolve(monorepoRoot, "package.json"), "utf-8")
  );

  // package manager info might already be inside package.json directly:
  if (packageJsonFile.packageManager) {
    const [nameRaw, version] = packageJsonFile.packageManager.split("@");
    const versionDetailed = getDetailedVersionFromSimple(version);

    let name;
    if (nameRaw === "yarn") {
      if (versionDetailed.major === 1) {
        name = "yarn-classic";
      } else {
        name = "yarn-berry";
      }
    } else {
      name = nameRaw;
    }

    if (returnNameOnly) {
      return name;
    }

    return {
      name,
      version: {
        simple: version,
        detailed: versionDetailed,
      },
    };
  }

  // it might be yarn 'berry' (meaning every yarn version 2+):
  try {
    const yarnReleaseFiles = fs.readdirSync(
      path.resolve(monorepoRoot, ".yarn", "releases")
    );
    if (yarnReleaseFiles?.length === 1) {
      const version = yarnReleaseFiles[0].split("-")[1].split(".")[0];

      if (returnNameOnly) {
        return "yarn-berry";
      }

      return {
        name: "yarn-berry",
        version: {
          simple: version,
          detailed: getDetailedVersionFromSimple(version),
        },
      };
    }
  } catch (e) {
    // do nothing
  }

  // it might be yarn 1 (legacy yarn):
  const yarnLockFile = files.find((f) => f === "yarn.lock");
  if (yarnLockFile) {
    if (returnNameOnly) {
      return "yarn-classic";
    }

    return {
      name: "yarn-classic",
      version: {
        simple: "1.x.x",
        detailed: {
          major: 1,
          minor: undefined,
          patch: undefined,
        },
      },
    };
  }

  // it might be npm:
  const npmLockFile = files.find((f) => f === "package-lock.json");
  if (npmLockFile) {
    if (returnNameOnly) {
      return "npm";
    }

    return { name: "npm", version: undefined };
  }

  // it might be pnpm:
  const pnpmLockFile = files.find((f) => f === "pnpm-lock.yaml");
  if (pnpmLockFile) {
    if (returnNameOnly) {
      return "pnpm";
    }
    return { name: "pnpm", version: undefined };
  }

  if (returnNameOnly) {
    return "unknown";
  }
  return { name: "unknown", version: undefined };
};
