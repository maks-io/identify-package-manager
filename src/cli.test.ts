import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { getHelp } from "./getHelp";
import { runCli } from "./cli";

const makeTempDirectory = (): string =>
  fs.mkdtempSync(path.join(os.tmpdir(), "identify-package-manager-cli-"));

const writeJson = (filePath: string, value: unknown): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const createOutput = () => {
  let buffer = "";

  return {
    stream: {
      write: (chunk: string) => {
        buffer += chunk;
      },
    },
    read: () => buffer,
  };
};

describe("runCli", () => {
  it("prints JSON output for a provided directory", () => {
    const repoRoot = makeTempDirectory();
    const stdout = createOutput();
    const stderr = createOutput();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
      packageManager: "pnpm@10.0.0",
    });

    const exitCode = runCli([repoRoot], stdout.stream, stderr.stream);

    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout.read())).toEqual({
      name: "pnpm",
      version: {
        simple: "10.0.0",
        detailed: {
          major: 10,
          minor: 0,
          patch: 0,
        },
      },
    });
    expect(stderr.read()).toBe("");
  });

  it("prints the package manager name only when requested", () => {
    const repoRoot = makeTempDirectory();
    const stdout = createOutput();
    const stderr = createOutput();

    writeJson(path.join(repoRoot, "package.json"), {
      name: "demo",
    });
    fs.writeFileSync(path.join(repoRoot, "bun.lock"), "");

    const exitCode = runCli(["--nameonly", repoRoot], stdout.stream, stderr.stream);

    expect(exitCode).toBe(0);
    expect(stdout.read().trim()).toBe("bun");
    expect(stderr.read()).toBe("");
  });

  it("fails on unknown options", () => {
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = runCli(["--wat"], stdout.stream, stderr.stream);

    expect(exitCode).toBe(1);
    expect(stdout.read()).toBe("");
    expect(stderr.read()).toContain("Unknown option: --wat");
  });

  it("fails on too many positional arguments", () => {
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = runCli(["one", "two"], stdout.stream, stderr.stream);

    expect(exitCode).toBe(1);
    expect(stdout.read()).toBe("");
    expect(stderr.read()).toContain("Too many positional arguments.");
  });

  it("prints help output", () => {
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = runCli(["--help"], stdout.stream, stderr.stream);

    expect(exitCode).toBe(0);
    expect(stdout.read()).toBe(`${getHelp(true)}\n`);
    expect(stderr.read()).toBe("");
  });

  it("prints the package version", () => {
    const stdout = createOutput();
    const stderr = createOutput();

    const exitCode = runCli(["--version"], stdout.stream, stderr.stream);

    expect(exitCode).toBe(0);
    expect(stdout.read().trim()).toBe("1.1.0");
    expect(stderr.read()).toBe("");
  });
});
