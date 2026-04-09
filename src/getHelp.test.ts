import { getHelp } from "./getHelp";

describe("getHelp", () => {
  it("returns help text without the header by default", () => {
    const output = getHelp();

    expect(output).toContain("Usage:\nidentify-package-manager [options] [directory]");
    expect(output).not.toContain("Identify Package Manager");
  });

  it("includes the header when requested", () => {
    const output = getHelp(true);

    expect(output).toContain("Identify Package Manager");
    expect(output).toContain(
      "Detect the package manager used by a repository (npm, yarn classic, yarn berry, pnpm, bun).",
    );
  });
});
