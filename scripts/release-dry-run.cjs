const path = require("node:path");
const semanticRelease = require("semantic-release").default;
const releaseConfig = require("../release.config.cjs");

const plugins = releaseConfig.plugins.filter((plugin) => {
  const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
  return (
    pluginName !== "@semantic-release/github" &&
    pluginName !== "@semantic-release/npm"
  );
});

console.log(
  "Local dry-run mode uses the local git checkout as repositoryUrl and skips npm/GitHub publishing plugins.",
);
console.log(
  "This previews version analysis and release notes without requiring remote push credentials or npm auth.",
);

semanticRelease({
  ...releaseConfig,
  repositoryUrl: path.resolve(__dirname, ".."),
  dryRun: true,
  ci: false,
  plugins,
})
  .then((result) => {
    if (!result) {
      console.log("semantic-release determined that no new release is needed.");
      return;
    }

    console.log(`semantic-release previewed version ${result.nextRelease.version}.`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
