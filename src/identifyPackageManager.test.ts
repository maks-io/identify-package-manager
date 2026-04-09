import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { identifyPackageManager } from "./identifyPackageManager";

const makeTempDirectory = (): string =>
  fs.mkdtempSync(path.join(os.tmpdir(), "identify-package-manager-"));

const writeJson = (filePath: string, value: unknown): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

describe("identifyPackageManager", () => {
  it("reads packageManager metadata from package.json", () => {
    const repoRoot = makeTempDirectory();
    const packageDirectory = path.join(repoRoot, "packages", "demo");

    fs.mkdirSync(packageDirectory, { recursive: true });
    writeJson(path.join(repoRoot, "package.json"), {
      name: "workspace-root",
      packageManager: "npm@11.12.1+sha512.deadbeef",
    });

    expect(identifyPackageManager(false, packageDirectory)).toEqual({
      name: "npm",
      version: {
        simple: "11.12.1",
        detailed: {
          major: 11,
          minor: 12,
          patch: 1,
        },
      },
    });
  });

  it("falls back to lockfile detection when packageManager metadata is malformed", () => {
    const repoRoot = makeTempDirectory();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
      packageManager: "npm@latest",
    });
    fs.writeFileSync(path.join(repoRoot, "package-lock.json"), "");

    expect(identifyPackageManager(false, repoRoot)).toEqual({
      name: "npm",
      version: undefined,
    });
  });

  it("maps yarn classic metadata to yarn-classic", () => {
    const repoRoot = makeTempDirectory();
    writeJson(path.join(repoRoot, "package.json"), {
      name: "workspace-root",
      packageManager: "yarn@1.22.22",
    });

    expect(identifyPackageManager(true, repoRoot)).toBe("yarn-classic");
  });

  it("detects yarn berry from release files before falling back to yarn.lock", () => {
    const repoRoot = makeTempDirectory();
    const packageDirectory = path.join(repoRoot, "apps", "web");

    fs.mkdirSync(path.join(repoRoot, ".yarn", "releases"), { recursive: true });
    fs.mkdirSync(packageDirectory, { recursive: true });
    writeJson(path.join(repoRoot, "package.json"), {
      private: true,
      workspaces: ["apps/*"],
    });
    fs.writeFileSync(path.join(repoRoot, ".yarn", "releases", "yarn-4.6.1.cjs"), "");
    fs.writeFileSync(path.join(repoRoot, "yarn.lock"), "");

    expect(identifyPackageManager(false, packageDirectory)).toEqual({
      name: "yarn-berry",
      version: {
        simple: "4.6.1",
        detailed: {
          major: 4,
          minor: 6,
          patch: 1,
        },
      },
    });
  });

  it("picks the highest yarn berry release version when multiple releases exist", () => {
    const repoRoot = makeTempDirectory();

    fs.mkdirSync(path.join(repoRoot, ".yarn", "releases"), { recursive: true });
    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });
    fs.writeFileSync(path.join(repoRoot, ".yarn", "releases", "yarn-4.5.9.cjs"), "");
    fs.writeFileSync(path.join(repoRoot, ".yarn", "releases", "yarn-4.6.0.cjs"), "");
    fs.writeFileSync(path.join(repoRoot, ".yarn", "releases", "yarn-4.6.1.cjs"), "");

    expect(identifyPackageManager(false, repoRoot)).toEqual({
      name: "yarn-berry",
      version: {
        simple: "4.6.1",
        detailed: {
          major: 4,
          minor: 6,
          patch: 1,
        },
      },
    });
  });

  it("falls back from invalid yarn release filenames to yarn.lock detection", () => {
    const repoRoot = makeTempDirectory();

    fs.mkdirSync(path.join(repoRoot, ".yarn", "releases"), { recursive: true });
    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });
    fs.writeFileSync(path.join(repoRoot, ".yarn", "releases", "not-a-release.txt"), "");
    fs.writeFileSync(path.join(repoRoot, "yarn.lock"), "");

    expect(identifyPackageManager(false, repoRoot)).toEqual({
      name: "yarn-classic",
      version: {
        simple: "1.x.x",
        detailed: {
          major: 1,
          minor: undefined,
          patch: undefined,
        },
      },
    });
  });

  it("detects npm from npm-shrinkwrap.json", () => {
    const repoRoot = makeTempDirectory();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });
    fs.writeFileSync(path.join(repoRoot, "npm-shrinkwrap.json"), "");

    expect(identifyPackageManager(true, repoRoot)).toBe("npm");
  });

  it("detects bun from bun.lock", () => {
    const repoRoot = makeTempDirectory();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });
    fs.writeFileSync(path.join(repoRoot, "bun.lock"), "");

    expect(identifyPackageManager(true, repoRoot)).toBe("bun");
  });

  it("detects pnpm from pnpm-lock.yaml", () => {
    const repoRoot = makeTempDirectory();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });
    fs.writeFileSync(path.join(repoRoot, "pnpm-lock.yaml"), "");

    expect(identifyPackageManager(true, repoRoot)).toBe("pnpm");
  });

  it("detects bun from bun.lockb", () => {
    const repoRoot = makeTempDirectory();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });
    fs.writeFileSync(path.join(repoRoot, "bun.lockb"), "");

    expect(identifyPackageManager(true, repoRoot)).toBe("bun");
  });

  it("returns unknown when no package manager markers exist", () => {
    const repoRoot = makeTempDirectory();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });

    expect(identifyPackageManager(false, repoRoot)).toEqual({
      name: "unknown",
      version: undefined,
    });
  });

  it("throws when it cannot determine a repository root", () => {
    const directory = makeTempDirectory();

    expect(() => identifyPackageManager(false, directory)).toThrow(
      `Could not determine a repository root from path ${directory}`,
    );
  });

  it("throws when a lockfile exists but package.json is missing", () => {
    const repoRoot = makeTempDirectory();

    fs.writeFileSync(path.join(repoRoot, "package-lock.json"), "");

    expect(() => identifyPackageManager(false, repoRoot)).toThrow(
      `No package.json file found in path ${repoRoot}`,
    );
  });
});
