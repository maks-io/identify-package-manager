import type { SemanticVersion, SemanticVersionDetails } from "./PackageManagerInfo";

export const getDetailedVersionFromSimple = (
  versionSimple: SemanticVersion,
): SemanticVersionDetails => {
  const [major, minor, patch] = versionSimple.split(".");
  const parseVersionPart = (part: string): number | undefined => {
    const parsedPart = Number.parseInt(part, 10);
    return Number.isNaN(parsedPart) ? undefined : parsedPart;
  };

  return {
    major: Number.parseInt(major, 10),
    minor: parseVersionPart(minor),
    patch: parseVersionPart(patch),
  };
};
