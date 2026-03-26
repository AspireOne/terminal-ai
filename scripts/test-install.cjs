#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  assert,
  binPath,
  homeAiPath,
  projectRoot,
  runAi,
  runProcess,
} = require("./lib/e2e.cjs");

async function main() {
  const srcDir = projectRoot();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "terminal-ai-"));
  console.log(`moved to new temp dir: ${tmpDir}`);

  try {
    console.log(`installing ai from: ${srcDir}...`);
    await runProcess("npm", ["install", srcDir], { cwd: tmpDir });
    const aiPath = binPath(tmpDir);
    assert(fs.existsSync(aiPath), `expected ai at ${aiPath}`);
    console.log("...done");

    const promptsDir = homeAiPath("prompts");
    if (fs.existsSync(promptsDir)) {
      console.log(
        `warning: prompts dir ${promptsDir} already exists, cannot verify fresh prompt installation...`,
      );
    }

    console.log("verifying can check version...");
    await runAi(aiPath, ["--version"], { cwd: tmpDir });
    console.log("done");

    console.log("verifying can output config...");
    await runAi(aiPath, ["config"], { cwd: tmpDir });
    console.log("done");

    console.log("verifying prompts folder has been hydrated...");
    assert(fs.existsSync(promptsDir), `prompts dir ${promptsDir} not created`);
    console.log("done");

    console.log(
      "verifying ai errors as expected for non-interactive run before 'ai init'...",
    );
    const result = await runAi(aiPath, ["chat", "what is the time"], {
      cwd: tmpDir,
      allowFailure: true,
    });
    assert(
      result.code === 12,
      `expected error code 12 (invalid configuration), got ${result.code}`,
    );
    console.log("done");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});
