const { spawnSync } = require("node:child_process");
const { createInterface } = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const commitTypes = [
  { value: "feat", description: "new user-facing capability" },
  { value: "fix", description: "bug fix" },
  { value: "refactor", description: "internal code change without behavior change" },
  { value: "test", description: "test-only change" },
  { value: "docs", description: "documentation-only change" },
  { value: "build", description: "build or dependency change" },
  { value: "ci", description: "CI or automation change" },
  { value: "chore", description: "misc maintenance" },
];

const rl = createInterface({ input: stdin, output: stdout });

const ask = async (question) => (await rl.question(question)).trim();

const askRequired = async (question, validate) => {
  while (true) {
    const answer = await ask(question);
    if (validate(answer)) {
      return answer;
    }
    console.log("Input was not valid. Try again.");
  }
};

const formatCommitMessage = ({
  type,
  scope,
  summary,
  body,
  isBreaking,
  breakingDescription,
}) => {
  const scopePart = scope ? `(${scope})` : "";
  const bangPart = isBreaking ? "!" : "";
  const subject = `${type}${scopePart}${bangPart}: ${summary}`;
  const sections = [subject];

  if (body) {
    sections.push(body);
  }

  if (isBreaking) {
    sections.push(`BREAKING CHANGE: ${breakingDescription}`);
  }

  return sections.join("\n\n");
};

const main = async () => {
  console.log("Opening interactive conventional commit flow.");
  console.log("Raw 'git commit' is blocked in this repository.");
  console.log("");
  commitTypes.forEach((type, index) => {
    console.log(`${index + 1}. ${type.value} - ${type.description}`);
  });
  console.log("");

  const typeAnswer = await askRequired(
    "Select commit type by number: ",
    (value) => {
      const numeric = Number(value);
      return Number.isInteger(numeric) && numeric >= 1 && numeric <= commitTypes.length;
    },
  );
  const type = commitTypes[Number(typeAnswer) - 1].value;
  const scope = await ask("Optional scope (leave empty for none): ");
  const summary = await askRequired(
    "Short summary (lowercase, no trailing period): ",
    (value) => value.length > 0 && !value.endsWith("."),
  );
  const body = await ask("Optional body/details (leave empty for none): ");
  const breakingAnswer = await askRequired(
    "Breaking change? [y/N]: ",
    (value) => ["", "y", "Y", "n", "N"].includes(value),
  );
  const isBreaking = /^y$/i.test(breakingAnswer);
  const breakingDescription = isBreaking
    ? await askRequired("Describe the breaking change: ", (value) => value.length > 0)
    : "";

  const message = formatCommitMessage({
    type,
    scope,
    summary,
    body,
    isBreaking,
    breakingDescription,
  });

  console.log("");
  console.log("Commit message preview:");
  console.log("----------------------------------------");
  console.log(message);
  console.log("----------------------------------------");

  const confirm = await askRequired(
    "Create commit with this message? [Y/n]: ",
    (value) => ["", "y", "Y", "n", "N"].includes(value),
  );
  rl.close();

  if (/^n$/i.test(confirm)) {
    console.log("Commit aborted.");
    process.exit(1);
  }

  const result = spawnSync("git", ["commit", "-m", message], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      FORCE_INTERACTIVE_COMMIT: "1",
    },
  });

  process.exit(result.status ?? 1);
};

main().catch((error) => {
  rl.close();
  console.error(error);
  process.exit(1);
});
