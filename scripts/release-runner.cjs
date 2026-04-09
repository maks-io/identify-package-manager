const { spawnSync } = require("node:child_process");

const isDryRun = process.argv.includes("--dry-run");

const steps = [
  {
    title: "Build package",
    command: "npm",
    args: ["run", "build"],
  },
  {
    title: "Run automated tests",
    command: "npm",
    args: ["test"],
  },
  {
    title: isDryRun
      ? "Preview semantic release result"
      : "Create release with semantic-release",
    command: "npm",
    args: ["run", isDryRun ? "release:dry-run:core" : "release:core"],
  },
];

const totalSteps = steps.length;

const runStep = (step, index) => {
  const stepLabel = `Step ${index + 1}/${totalSteps}`;
  console.log(`\n=== ${stepLabel}: ${step.title} ===`);
  console.log(`Starting: ${step.command} ${step.args.join(" ")}`);

  const result = spawnSync(step.command, step.args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.error(`Failed: ${stepLabel} (${step.title})`);
    process.exit(result.status ?? 1);
  }

  console.log(`Completed: ${stepLabel} (${step.title})`);
};

console.log(
  isDryRun
    ? "Release mode: dry run. No npm publish, git tag push, or GitHub release will be finalized."
    : "Release mode: live release. semantic-release will publish when CI credentials allow it.",
);

steps.forEach(runStep);

console.log(`\nRelease workflow finished successfully (${totalSteps}/${totalSteps} steps).`);
