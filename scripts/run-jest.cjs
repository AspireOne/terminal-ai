#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");

const jestBin = path.join(
  path.dirname(require.resolve("jest")),
  "..",
  "bin",
  "jest.js",
);
const nodeArgs = ["--experimental-vm-modules", "--no-warnings", jestBin];
const extraArgs = process.argv.slice(2);

const child = spawn(process.execPath, [...nodeArgs, ...extraArgs], {
  stdio: "inherit",
  env: process.env,
});

child.on("close", (code) => {
  process.exit(code || 0);
});
child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
