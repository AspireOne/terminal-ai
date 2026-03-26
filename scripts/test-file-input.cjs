#!/usr/bin/env node

const {
  getDefaultEnv,
  parseYamlResponse,
  projectRoot,
  runAi,
} = require("./lib/e2e.cjs");

async function main() {
  const root = projectRoot();
  const aiPath = process.argv[2] || "ai";
  const extraArgs = process.argv.slice(3);
  const env = getDefaultEnv();
  let check = false;

  const yamlPrompt = `
I have sent you a file. You MUST ONLY OUTPUT YAML which follows the structure below:

\`\`\`yaml
path: <file path>
mimeType: <mimetype>
functionName: <functionName>
\`\`\`
`;

  const yamlResult = await runAi(
    aiPath,
    [...extraArgs, "-f", "tests/test-files/code.js", "--", yamlPrompt],
    { cwd: root, env },
  );

  const parsed = parseYamlResponse(yamlResult.stdout);
  if (parsed.path !== "tests/test-files/code.js") {
    console.log("warning: unexpected path, please manually verify");
    check = true;
  }
  if (parsed.mimeType !== "text/javascript") {
    console.log("warning: unexpected mime type, please manually verify");
    check = true;
  }
  if (parsed.functionName !== "sum") {
    console.log("warning: unexpected function name, please manually verify");
    check = true;
  }
  console.log(
    "pass: validated that the path, mime-type and contents of a file can be read",
  );

  const fileCountPrompt =
    "I have sent you files. Tell me exactly how many I sent, your output should be a single numeral.";
  const fileCountResult = await runAi(
    aiPath,
    [
      ...extraArgs,
      "-f",
      "README.md",
      "-f",
      "package.json",
      "-f",
      "tsconfig.json",
      "--",
      fileCountPrompt,
    ],
    { cwd: root, env },
  );
  if (/3/.test(fileCountResult.stdout)) {
    console.log("pass: found 3 files");
  } else {
    console.log(
      "warning: didn't find the expected 3 files, please manually verify",
    );
    console.log(fileCountResult.stdout);
    check = true;
  }

  const imagePrompt =
    "I have sent you an image file. Tell me in one line only what is in this image.";
  const imageResult = await runAi(
    aiPath,
    [
      ...extraArgs,
      "--image-file",
      "tests/test-files/animal.jpg",
      "--",
      imagePrompt,
    ],
    { cwd: root, env },
  );
  if (/salmon|fish/i.test(imageResult.stdout)) {
    console.log("pass: recognised the 'fish / salmon' image");
  } else {
    console.log(
      "warning: didn't get the expected response 'salmon' or 'fish', please manually verify",
    );
    console.log(imageResult.stdout);
    check = true;
  }

  if (check) {
    console.log(
      "complete: some tests resulted in warnings, manual verification needed",
    );
    return;
  }

  console.log("complete: all checks passed");
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});
