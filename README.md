# identify-package-manager <span style="font-size: 16px">📦</span><span style="font-size: 20px">📦</span><span style="font-size: 24px">📦</span><span style="font-size: 28px">📦</span>

[![Version](https://img.shields.io/npm/v/identify-package-manager)](https://www.npmjs.com/package/identify-package-manager)

Detect the package manager used by a repository from any nested directory.

The package works as a CLI and as a library. It inspects `packageManager` metadata when present and falls back to common lockfiles such as `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`, and `bun.lockb`.

## Installation

```bash
npm install identify-package-manager
```

You can also run it without a global install:

```bash
npx identify-package-manager
```

## CLI usage

Run the command anywhere inside the repository you want to inspect:

```bash
identify-package-manager [options] [directory]
```

Without any flag, the CLI prints the package manager name plus version info when it can determine one:

```json
{
  "name": "yarn-berry",
  "version": {
    "simple": "4.6.1",
    "detailed": {
      "major": 4,
      "minor": 6,
      "patch": 1
    }
  }
}
```

Use `--nameonly` if you only need the normalized package manager name.

### CLI options

| option              | explanation                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `-h` / `--help`     | Display this package's help + usage info.                                                                                               |
| `-v` / `--version`  | Display this package's version number.                                                                                                  |
| `-n` / `--nameonly` | If set, the CLI only returns the package manager name (`npm`, `yarn-classic`, `yarn-berry`, `pnpm`, `bun`, or `unknown`).             |

## Library usage

```ts
import { identifyPackageManager } from "identify-package-manager";

const packageManagerInfo = identifyPackageManager();
console.log(packageManagerInfo);

const packageManagerName = identifyPackageManager(true);
console.log(packageManagerName);
```

You may also pass an explicit starting directory instead of relying on `process.cwd()`:

```ts
const packageManagerInfo = identifyPackageManager(false, "/path/inside/repository");
```

## Development

This repository uses `npm`, not Yarn or pnpm.

Useful commands:

```bash
npm test
npm run build
npm run verify
```

Commits are expected to use conventional commit messages. Local raw `git commit` is blocked by Husky on purpose; use the interactive helper instead:

```bash
npm run commit
```

That helper is intentionally a small local script instead of `commitizen` to avoid extra transitive maintenance and vulnerability surface.

## Release workflow

Releases are automated with `semantic-release` in GitHub Actions.

- CI runs `npm ci` and `npm run verify`.
- Releases run on pushes to `main` or `master`, plus manual workflow dispatch.
- The workflow is designed for protected branches and does not rely on pushing version or changelog commits back to git.
- Git tags, npm releases, and GitHub Releases are the release source of truth.
- Because of that, the `package.json` version committed on `main` can lag behind the latest published version.
- The release workflow is set up for npm Trusted Publishing via GitHub Actions OIDC. No long-lived `NPM_TOKEN` should be required once the npm package is configured for trusted publishing.
- When migrating an already-published package to semantic-release, add a `vX.Y.Z` tag to the latest already-published commit before the first automated release so semantic-release has the correct baseline.
- `npm run release:dry-run` intentionally skips npm and GitHub publishing plugins and uses the local checkout as the release repository so you can preview release calculation without GitHub push credentials or npm auth.

You can preview the release process locally with:

```bash
npm run release:dry-run
```
