import {
  checkIfAllTestReposAreReady,
  cleanAllTestRepos,
  exampleRepos,
  getCommandToCdIntoTestRepo,
  getTestDirectory,
  prepareAllTestRepos,
  runChainedCommands,
  updateAllTestRepos,
} from "./testHelpers";

const cliCommand = "identify-package-manager";

let testDirectory;

beforeAll(() => {
  testDirectory = getTestDirectory();

  const allTestReposAreReady = checkIfAllTestReposAreReady();

  if (!allTestReposAreReady) {
    console.log("Test repositories are not ready yet...");
    cleanAllTestRepos();
    prepareAllTestRepos();
    console.log("...now they are.");
  } else {
    console.log(
      "Test repositories are ready, let's make sure they are up-to-date..."
    );
    updateAllTestRepos();
    console.log("...now they are.");
  }
});

describe("Tests for the identify-package-manager CLI tool", () => {
  describe("Tests targeting the 'npm' repo", () => {
    const npmConfig = exampleRepos.npm;

    describe("Tests targeting the uninstalled repo, without a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "npm",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "npm",
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "npm",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${npmConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "npm",
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the uninstalled repo, with a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "npm",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "npm",
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "npm",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${npmConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "npm",
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the installed repo", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo("npm", "installed");
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "npm",
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo("npm", "installed");
        const output = runChainedCommands([
          cdCommand,
          `cd ./${npmConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "npm",
        };
        expect(output).toEqual(expectedOutput);
      });
    });
  });
  describe("Tests targeting the 'pnpm' repo", () => {
    const pnpmConfig = exampleRepos.pnpm;

    describe("Tests targeting the uninstalled repo, without a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "pnpm",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "pnpm",
          version: {
            detailed: {
              major: 7,
              minor: 15,
              patch: 0,
            },
            simple: "7.15.0",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "pnpm",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${pnpmConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "pnpm",
          version: {
            detailed: {
              major: 7,
              minor: 15,
              patch: 0,
            },
            simple: "7.15.0",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the uninstalled repo, with a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "pnpm",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "pnpm",
          version: {
            detailed: {
              major: 7,
              minor: 15,
              patch: 0,
            },
            simple: "7.15.0",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "pnpm",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${pnpmConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "pnpm",
          version: {
            detailed: {
              major: 7,
              minor: 15,
              patch: 0,
            },
            simple: "7.15.0",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the installed repo", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo("pnpm", "installed");
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "pnpm",
          version: {
            detailed: {
              major: 7,
              minor: 15,
              patch: 0,
            },
            simple: "7.15.0",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo("pnpm", "installed");
        const output = runChainedCommands([
          cdCommand,
          `cd ./${pnpmConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "pnpm",
          version: {
            detailed: {
              major: 7,
              minor: 15,
              patch: 0,
            },
            simple: "7.15.0",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });
  });
  describe("Tests targeting the 'yarn-berry' repo", () => {
    const yarnBerryConfig = exampleRepos["yarn-berry"];

    describe("Tests targeting the uninstalled repo, without a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-berry",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "yarn-berry",
          version: {
            detailed: {
              major: 2,
            },
            simple: "2",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-berry",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${yarnBerryConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "yarn-berry",
          version: {
            detailed: {
              major: 2,
            },
            simple: "2",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the uninstalled repo, with a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-berry",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "yarn-berry",
          version: {
            detailed: {
              major: 2,
            },
            simple: "2",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-berry",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${yarnBerryConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "yarn-berry",
          version: {
            detailed: {
              major: 2,
            },
            simple: "2",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the installed repo", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo("yarn-berry", "installed");
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "yarn-berry",
          version: {
            detailed: {
              major: 2,
            },
            simple: "2",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo("yarn-berry", "installed");
        const output = runChainedCommands([
          cdCommand,
          `cd ./${yarnBerryConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "yarn-berry",
          version: {
            detailed: {
              major: 2,
            },
            simple: "2",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });
  });
  describe("Tests targeting the 'yarn-classic' repo", () => {
    const yarnClassicConfig = exampleRepos["yarn-classic"];

    describe("Tests targeting the uninstalled repo, without a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-classic",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "yarn-classic",
          version: {
            detailed: {
              major: 1,
            },
            simple: "1.x.x",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-classic",
          "uninstalled-without-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${yarnClassicConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "yarn-classic",
          version: {
            detailed: {
              major: 1,
            },
            simple: "1.x.x",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the uninstalled repo, with a lockfile", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-classic",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "yarn-classic",
          version: {
            detailed: {
              major: 1,
            },
            simple: "1.x.x",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-classic",
          "uninstalled-with-lockfile"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${yarnClassicConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "yarn-classic",
          version: {
            detailed: {
              major: 1,
            },
            simple: "1.x.x",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });

    describe("Tests targeting the installed repo", () => {
      it("Runs CLI in root directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-classic",
          "installed"
        );
        const output = runChainedCommands([cdCommand, cliCommand]);
        const expectedOutput = {
          name: "yarn-classic",
          version: {
            detailed: {
              major: 1,
            },
            simple: "1.x.x",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
      it("Runs CLI in some random sub directory", () => {
        const cdCommand = getCommandToCdIntoTestRepo(
          "yarn-classic",
          "installed"
        );
        const output = runChainedCommands([
          cdCommand,
          `cd ./${yarnClassicConfig.randomSubDir}`,
          cliCommand,
        ]);
        const expectedOutput = {
          name: "yarn-classic",
          version: {
            detailed: {
              major: 1,
            },
            simple: "1.x.x",
          },
        };
        expect(output).toEqual(expectedOutput);
      });
    });
  });
});
