#!/usr/bin/env node

const path = require("path");
const { spawn } = require("child_process");

const tsNodeBin = path.join(
  path.dirname(require.resolve("ts-node/register")),
  "..",
  "dist",
  "bin.js",
);
const extraArgs = process.argv.slice(2);

const child = spawn(process.execPath, [tsNodeBin, ...extraArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_NO_WARNINGS: "1",
  },
});

child.on("close", (code) => {
  process.exit(code || 0);
});
child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
