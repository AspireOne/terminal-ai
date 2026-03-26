#!/usr/bin/env node

const fs = require("fs");
const { spawnSync } = require("child_process");
const { resolveCommand } = require("./lib/e2e.cjs");

function run(command, args, options = {}) {
  const resolvedCommand = resolveCommand(command);
  const useShell =
    process.platform === "win32" &&
    (resolvedCommand.endsWith(".cmd") || resolvedCommand.endsWith(".bat"));

  const result = spawnSync(resolvedCommand, args, {
    stdio: "inherit",
    shell: useShell,
    ...options,
  });

  if (result.status && result.status !== 0) {
    process.exit(result.status);
  }
}

console.log("Running pre-commit checks...");

if (!fs.existsSync("node_modules")) {
  console.log("Installing dependencies...");
  run("npm", ["install"]);
}

run("npm", ["run", "lint:fix"]);
run("npm", ["run", "build"]);
run("npm", ["test"]);

const actionlint = spawnSync("actionlint", ["-ignore", "node-version"], {
  stdio: "inherit",
  shell: false,
});
if (actionlint.error) {
  console.log(
    "actionlint not found. GitHub Actions workflow files were not linted.",
  );
  console.log("Install from https://github.com/rhysd/actionlint");
} else if (actionlint.status && actionlint.status !== 0) {
  process.exit(actionlint.status);
}

console.log("Pre-commit checks complete.");
