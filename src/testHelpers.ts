import dotenv from "dotenv";
import * as fs from "fs";
import * as constants from "constants";
import { execSync } from "child_process";
dotenv.config();

const uninstalledWithLockfileSuffix = "--uninstalled-with-lockfile";
const uninstalledWithoutLockfileSuffix = "--uninstalled-without-lockfile";
const installedSuffix = "--installed";

type PkgManager = "pnpm" | "npm" | "yarn-berry" | "yarn-classic";

let testDirectory;

export const exampleRepos: {
  [pkgManager in PkgManager]?: {
    sshUrl: string;
    name: string;
    installCommand: string;
    lockfileName: string;
    randomSubDir: string;
  };
} = {
  npm: {
    name: "monorepo-example-npm",
    sshUrl: "git@github.com:maks-io/monorepo-example-npm.git",
    installCommand: "npm install",
    lockfileName: "package-lock.json",
    randomSubDir: "packages/x-core/src",
  },
  "yarn-classic": {
    name: "monorepo-example-yarn-classic",
    sshUrl: "git@github.com:maks-io/monorepo-example-yarn-classic.git",
    installCommand: "yarn install",
    lockfileName: "yarn.lock",
    randomSubDir: "examples/example-2",
  },
  "yarn-berry": {
    name: "monorepo-example-yarn-berry",
    sshUrl: "git@github.com:maks-io/monorepo-example-yarn-berry.git",
    installCommand: "yarn install",
    lockfileName: "yarn.lock",
    randomSubDir: "app/src",
  },
  pnpm: {
    name: "monorepo-example-pnpm",
    sshUrl: "git@github.com:maks-io/monorepo-example-pnpm.git",
    installCommand: "pnpm install",
    lockfileName: "pnpm-lock.yaml",
    randomSubDir: "apps/web/app",
  },
};

export const getCommandToCdIntoTestRepo = (
  testRepo: PkgManager,
  repoVariant:
    | "uninstalled-with-lockfile"
    | "uninstalled-without-lockfile"
    | "installed"
): string => {
  const repoBaseName = exampleRepos[testRepo].name;
  return `cd ${testDirectory}/${repoBaseName}--${repoVariant}`;
};

const repoNamesUninstalledWithoutLockfile = Object.keys(exampleRepos).map(
  (key) => `${exampleRepos[key].name}${uninstalledWithoutLockfileSuffix}`
);
const repoNamesUninstalledWithLockfile = Object.keys(exampleRepos).map(
  (key) => `${exampleRepos[key].name}${uninstalledWithLockfileSuffix}`
);
const repoNamesWithInstall = Object.keys(exampleRepos).map(
  (key) => `${exampleRepos[key].name}${installedSuffix}`
);
const allRepoNames = [
  ...repoNamesUninstalledWithoutLockfile,
  ...repoNamesUninstalledWithLockfile,
  ...repoNamesWithInstall,
];

export const getTestDirectory = (): string => {
  const testDir = process.env.TEST_DIRECTORY;

  if (!testDir || testDir === "undefined") {
    throw new Error(`Please provide a proper TEST_DIRECTORY via a .env file`);
  }

  if (!fs.existsSync(testDir)) {
    throw new Error(
      `The provided TEST_DIRECTORY ${testDir} seems to not exist`
    );
  }

  try {
    fs.accessSync(testDir, constants.R_OK);
  } catch (e) {
    throw new Error(
      `The provided TEST_DIRECTORY ${testDir} exists, but there is no read access`
    );
  }

  try {
    fs.accessSync(testDir, constants.W_OK);
  } catch (e) {
    throw new Error(
      `The provided TEST_DIRECTORY ${testDir} exists, but there is no write access`
    );
  }

  testDirectory = testDir;
  return testDir;
};

export const checkIfAllTestReposAreReady = (): boolean => {
  if (
    allRepoNames.some((repoName) => {
      return !fs.existsSync(`${testDirectory}/${repoName}`);
    })
  ) {
    return false;
  }

  if (
    allRepoNames.some((repoName) => {
      return !fs.existsSync(`${testDirectory}/${repoName}/.git`);
    })
  ) {
    return false;
  }

  return true;
};

export const cleanAllTestRepos = (): void => {
  allRepoNames.forEach((repoName) => {
    try {
      execSync(`rm -rf ${testDirectory}/${repoName}`);
    } catch (e) {
      // do nothing
    }
  });
};

export const runChainedCommands = (commands: string[]): string => {
  return JSON.parse(execSync(commands.join(" && ")).toString().trim());
};

export const prepareAllTestRepos = (): void => {
  Object.keys(exampleRepos).forEach((pkgManager) => {
    const repoData = exampleRepos[pkgManager];
    const { sshUrl, name, installCommand } = repoData;

    // clone repo for 1st time and rename it to REPO_NAME--uninstalled-without-lockfile:
    execSync(
      `cd ${testDirectory} && git clone ${sshUrl} && mv ./${name} ./${name}${uninstalledWithoutLockfileSuffix}`
    );

    // clone repo for 2nd time and rename it to REPO_NAME--uninstalled-with-lockfile:
    execSync(
      `cd ${testDirectory} && git clone ${sshUrl} && mv ./${name} ./${name}${uninstalledWithLockfileSuffix}`
    );

    // clone repo for 3rd time and rename it to REPO_NAME--installed:
    execSync(
      `cd ${testDirectory} && git clone ${sshUrl} && mv ./${name} ./${name}${installedSuffix}`
    );

    // finally, install 3rd repo: (1st repo stays uninstalled on purpose!)
    execSync(
      `cd ${testDirectory}/${name}${installedSuffix} && ${installCommand}`
    );
  });
};

const checkIfRepoIsOutdated = (directoryName: string): boolean => {
  const gitFetchCommand = "git fetch";
  const fetchCommandOutput = execSync(
    `cd ${testDirectory}/${directoryName} && ${gitFetchCommand}`
  )
    .toString()
    .trim();

  return fetchCommandOutput.length > 0;
};

const checkIfRepoHasLocalChanges = (directoryName: string): boolean => {
  const gitStatusCommand = "git status --porcelain";

  const commandOutput = execSync(
    `cd ${testDirectory}/${directoryName} && ${gitStatusCommand}`
  )
    .toString()
    .trim();

  if (commandOutput.length === 0) {
    return false;
  }

  // if the only local change is a deleted or modified lockfile, let's also consider this repo "unchanged":
  const lockfileNames = Object.values(exampleRepos).map(
    (er) => er.lockfileName
  );
  if (lockfileNames.map((lfn) => `D ${lfn}`).some((l) => l === commandOutput)) {
    return false;
  }
  if (lockfileNames.map((lfn) => `M ${lfn}`).some((l) => l === commandOutput)) {
    return false;
  }

  return true;
};

export const updateAllTestRepos = (): void => {
  const gitUpdateCommand = "git reset --hard HEAD && git pull";

  Object.keys(exampleRepos).forEach((pkgManager) => {
    const repoData = exampleRepos[pkgManager];
    const { name, installCommand, lockfileName } = repoData;

    // pull latest changes for uninstalled repo without lockfile + remove lockfile:
    const repoUninstalledWithoutLockfileHasChanges: boolean =
      checkIfRepoHasLocalChanges(`${name}${uninstalledWithoutLockfileSuffix}`);
    const repoUninstalledWithoutLockfileIsOutdated: boolean =
      checkIfRepoIsOutdated(`${name}${uninstalledWithoutLockfileSuffix}`);

    {
      const repoPretty = `${pkgManager} repo (variant uninstalled without lockfile)`;
      if (
        repoUninstalledWithoutLockfileHasChanges ||
        repoUninstalledWithoutLockfileIsOutdated
      ) {
        console.log(
          `${repoPretty} has changes or is outdated, will be updated...`
        );
        execSync(
          `cd ${testDirectory}/${name}${uninstalledWithoutLockfileSuffix} && ${gitUpdateCommand} && rm -f ./${lockfileName}`
        );
        console.log("...done");
      } else {
        console.log(`${repoPretty} has no changes, no updating needed`);
      }
    }

    // pull latest changes for uninstalled repo with lockfile:
    const repoUninstalledWithLockfileHasChanges: boolean =
      checkIfRepoHasLocalChanges(`${name}${uninstalledWithLockfileSuffix}`);
    const repoUninstalledWithLockfileIsOutdated: boolean =
      checkIfRepoIsOutdated(`${name}${uninstalledWithLockfileSuffix}`);

    {
      const repoPretty = `${pkgManager} repo (variant uninstalled with lockfile)`;
      if (
        repoUninstalledWithLockfileHasChanges ||
        repoUninstalledWithLockfileIsOutdated
      ) {
        console.log(
          `${repoPretty} has changes or is outdated, will be updated...`
        );
        execSync(
          `cd ${testDirectory}/${name}${uninstalledWithLockfileSuffix} && ${gitUpdateCommand}`
        );
        console.log("...done");
      } else {
        console.log(`${repoPretty} has no changes, no updating needed`);
      }
    }

    // pull latest changes for installed repo + then install again:
    const repoInstalledHasChanges: boolean = checkIfRepoHasLocalChanges(
      `${name}${installedSuffix}`
    );
    const repoInstalledIsOutdated: boolean = checkIfRepoIsOutdated(
      `${name}${installedSuffix}`
    );

    {
      const repoPretty = `${pkgManager} repo (variant installed)`;
      if (repoInstalledHasChanges || repoInstalledIsOutdated) {
        console.log(
          `${repoPretty} has changes or is outdated, will be updated...`
        );
        execSync(
          `cd ${testDirectory}/${name}${installedSuffix} && ${gitUpdateCommand} && ${installCommand}`
        );
        console.log("...done");
      } else {
        console.log(`${repoPretty} has no changes, no updating needed`);
      }
    }
  });
};
