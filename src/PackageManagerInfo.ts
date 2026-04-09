export type PackageManagerName =
  | "npm"
  | "yarn-classic"
  | "yarn-berry"
  | "pnpm"
  | "bun"
  | "unknown";

type NumberOrPlaceholder = number | "x";

export type SemanticVersion =
  `${number}.${NumberOrPlaceholder}.${NumberOrPlaceholder}`;

export type SemanticVersionDetails = {
  major: number;
  minor: number | undefined;
  patch: number | undefined;
};

export type PackageManagerVersion =
  | { simple: SemanticVersion; detailed: SemanticVersionDetails }
  | undefined;

export type PackageManagerInfo = {
  name: PackageManagerName;
  version: PackageManagerVersion;
};
