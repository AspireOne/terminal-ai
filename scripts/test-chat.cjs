#!/usr/bin/env node

const { getDefaultEnv, projectRoot, runAi } = require("./lib/e2e.cjs");

async function main() {
  projectRoot();
  const aiPath = process.argv[2] || "ai";
  const extraArgs = process.argv.slice(3);
  const env = getDefaultEnv();

  console.log("verifying ai chat...");
  await runAi(aiPath, [...extraArgs, "chat", "what is the time"], {
    env,
  });
  console.log("done");

  console.log("verifying ai chat piping to stdin...");
  await runAi(aiPath, [...extraArgs, "what message did i send you?"], {
    env,
    stdin: "hello ai",
  });
  console.log("done");
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});
