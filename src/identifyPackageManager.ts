import * as fs from "node:fs";
import * as path from "node:path";
import { identifyMonorepoRoot } from "identify-monorepo-root";
import type {
  PackageManagerInfo,
  PackageManagerName,
  SemanticVersion,
} from "./PackageManagerInfo";
import { getDetailedVersionFromSimple } from "./getDetailedVersionFromSimple";

type SupportedPackageManagerName = Exclude<PackageManagerName, "unknown">;
type PackageJsonLike = {
  packageManager?: string;
};

const PACKAGE_MANAGER_REGEX = /^(npm|yarn|pnpm|bun)@(\d+\.\d+\.\d+)/;
const YARN_BERRY_RELEASE_REGEX = /^yarn-(\d+\.\d+\.\d+)(?:\.[^.]+)?$/;

const getPackageManagerName = (
  packageManager: SupportedPackageManagerName | "yarn",
  version: SemanticVersion,
): SupportedPackageManagerName => {
  if (packageManager !== "yarn") {
    return packageManager;
  }

  return getDetailedVersionFromSimple(version).major === 1
    ? "yarn-classic"
    : "yarn-berry";
};

const compareSemanticVersions = (
  left: SemanticVersion,
  right: SemanticVersion,
): number => {
  const leftDetailed = getDetailedVersionFromSimple(left);
  const rightDetailed = getDetailedVersionFromSimple(right);

  if (leftDetailed.major !== rightDetailed.major) {
    return leftDetailed.major - rightDetailed.major;
  }

  if (leftDetailed.minor !== rightDetailed.minor) {
    return (leftDetailed.minor ?? 0) - (rightDetailed.minor ?? 0);
  }

  return (leftDetailed.patch ?? 0) - (rightDetailed.patch ?? 0);
};

const createVersionedResult = (
  packageManager: SupportedPackageManagerName | "yarn",
  version: SemanticVersion,
): PackageManagerInfo => ({
  name: getPackageManagerName(packageManager, version),
  version: {
    simple: version,
    detailed: getDetailedVersionFromSimple(version),
  },
});

const parsePackageManagerField = (
  packageManagerField?: string,
): PackageManagerInfo | null => {
  if (!packageManagerField) {
    return null;
  }

  const match = packageManagerField.match(PACKAGE_MANAGER_REGEX);
  if (!match) {
    return null;
  }

  const [, packageManager, version] = match as [
    string,
    SupportedPackageManagerName | "yarn",
    SemanticVersion,
  ];

  return createVersionedResult(packageManager, version);
};

const detectYarnBerryVersion = (
  monorepoRoot: string,
): SemanticVersion | null => {
  try {
    const releaseFiles = fs.readdirSync(
      path.join(monorepoRoot, ".yarn", "releases"),
    );
    const versions = releaseFiles
      .map((fileName) => fileName.match(YARN_BERRY_RELEASE_REGEX)?.[1])
      .filter((version): version is SemanticVersion => version !== undefined)
      .sort(compareSemanticVersions);

    return versions.length > 0 ? versions[versions.length - 1] : null;
  } catch {
    return null;
  }
};

const detectFromLockfiles = (files: Set<string>): PackageManagerInfo => {
  if (files.has("yarn.lock")) {
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

  if (files.has("package-lock.json") || files.has("npm-shrinkwrap.json")) {
    return { name: "npm", version: undefined };
  }

  if (files.has("pnpm-lock.yaml")) {
    return { name: "pnpm", version: undefined };
  }

  if (files.has("bun.lock") || files.has("bun.lockb")) {
    return { name: "bun", version: undefined };
  }

  return { name: "unknown", version: undefined };
};

export function identifyPackageManager(
  returnNameOnly?: false,
  startingDirectory?: string,
): PackageManagerInfo;
export function identifyPackageManager(
  returnNameOnly: true,
  startingDirectory?: string,
): PackageManagerName;
export function identifyPackageManager(
  returnNameOnly = false,
  startingDirectory = process.cwd(),
): PackageManagerInfo | PackageManagerName {
  const monorepoRoot = identifyMonorepoRoot(startingDirectory);
  if (!monorepoRoot) {
    throw new Error(
      `Could not determine a repository root from path ${startingDirectory}`,
    );
  }

  const files = new Set(fs.readdirSync(monorepoRoot));
  if (!files.has("package.json")) {
    throw new Error(`No package.json file found in path ${monorepoRoot}`);
  }

  const packageJsonFile = JSON.parse(
    fs.readFileSync(path.join(monorepoRoot, "package.json"), "utf-8"),
  ) as PackageJsonLike;

  const packageManagerFromPackageJson = parsePackageManagerField(
    packageJsonFile.packageManager,
  );
  if (packageManagerFromPackageJson) {
    return returnNameOnly
      ? packageManagerFromPackageJson.name
      : packageManagerFromPackageJson;
  }

  const yarnBerryVersion = detectYarnBerryVersion(monorepoRoot);
  if (yarnBerryVersion) {
    const result = createVersionedResult("yarn", yarnBerryVersion);
    return returnNameOnly ? result.name : result;
  }

  const detectedFromLockfiles = detectFromLockfiles(files);
  return returnNameOnly ? detectedFromLockfiles.name : detectedFromLockfiles;
}
