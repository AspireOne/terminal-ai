#!/usr/bin/env node

const { runProcess } = require("./lib/e2e.cjs");

async function main() {
  const checks = [
    {
      command: "node",
      args: ["--version"],
      message: "verified: node installed",
      help: "install Node.js and ensure it is on PATH",
    },
    {
      command: "npm",
      args: ["--version"],
      message: "verified: npm installed",
      help: "install npm and ensure it is on PATH",
    },
    {
      command: "git",
      args: ["--version"],
      message: "verified: git installed",
      help: "install Git and ensure it is on PATH",
    },
  ];

  for (const check of checks) {
    try {
      await runProcess(check.command, check.args);
      console.log(check.message);
    } catch {
      console.error(`error: ${check.command} is not installed`);
      console.error(`try: ${check.help}`);
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
