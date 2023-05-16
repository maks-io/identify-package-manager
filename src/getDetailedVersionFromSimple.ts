import { SemanticVersion, SemanticVersionDetails } from "./PackageManagerInfo";

export const getDetailedVersionFromSimple = (
  versionSimple: SemanticVersion
): SemanticVersionDetails => {
  const [major, minor, patch] = versionSimple.split(".");
  return {
    major: parseInt(major, 10),
    minor: isNaN(parseInt(minor, 10)) ? undefined : parseInt(minor, 10),
    patch: isNaN(parseInt(patch, 10)) ? undefined : parseInt(patch, 10),
  };
};
