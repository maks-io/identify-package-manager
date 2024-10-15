# identify-package-manager <span style="font-size: 16px">📦</span><span style="font-size: 20px">📦</span><span style="font-size: 24px">📦</span><span style="font-size: 28px">📦</span>

[![Version](https://img.shields.io/npm/v/identify-package-manager)](https://www.npmjs.com/package/identify-package-manager)

Check the used package manager in a given repository ([npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [yarn classic](https://classic.yarnpkg.com), [yarn berry](https://yarnpkg.com)).

## Highlights

- can be used as **classical dependency** or as **cli/command line tool**
- cli tool can be run in the root of a repository as well as any subfolder (also inside monorepo sub "workspaces" for example) - [it will detect the monorepo's root automatically](https://www.npmjs.com/package/identify-monorepo-root).
- written in Typescript

## CLI

### Global install

Via npm:

```bash
npm i -g identify-package-manager
```

Via yarn:

```bash
yarn global add identify-package-manager
```

### npx

Instead of a global install you can also use it via `npx`:

```bash
npx identify-package-manager [options]
```

### Usage

After installation you can use it by running the following command inside any given repository.

```bash
identify-package-manager [options]
```

If used without any option the tool will return info about both, the package manager's name and its version, if detectable.

An example output would be the following:

```
{
    "name": "yarn-berry",
    "version": {
        "simple": "2.0.1",
        "detailed": {
             "major": 2,
             "minor": 0,
             "patch": 1,
        }
    }
}
```

If you're only interested in the package manager's name, look at the `--nameonly` option below:

#### CLI options

| option              | explanation                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `-h` / `--help`     | Display this package's help + usage info.                                                                                        |
| `-v` / `--version`  | Display this package's version number.                                                                                           |
| `-n` / `--nameonly` | If set, the cli tool will only return the used package manager's name (`npm`, `yarn-classic`, `yarn-berry`, `pnpm` or `unknown`) |

## Classical dependency

### Install

```
npm install --save identify-package-manager
```

Or if you use Yarn:

```
yarn add identify-package-manager
```

### Usage

```typescript
import { identifyPackageManager } from "identify-package-manager";

// get name of package manager:
const packageManager = identifyPackageManager(true);
console.log(packageManager);
// ^ might output 'yarn-berry' for instance

// get entire info about package manager:
const packageManagerInfo = identifyPackageManager();
console.log(packageManagerInfo);
// ^ might output the following for instance:
// {
//     "name": "yarn-berry",
//     "version": {
//         "simple": "2.0.1",
//         "detailed": {
//              "major": 2,
//              "minor": 0,
//              "patch": 1,
//         }
//     }
// }

```
