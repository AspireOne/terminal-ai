const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const yaml = require("js-yaml");

function projectRoot() {
  const root = process.cwd();
  if (!fs.existsSync(path.join(root, "package.json"))) {
    throw new Error("command must be run from project root");
  }
  return root;
}

function getDefaultEnv() {
  return {
    ...process.env,
    AI_API_KEY: process.env.TESTING_AI_API_KEY || "",
    AI_BASE_URL:
      process.env.TESTING_AI_BASE_URL ||
      "https://generativelanguage.googleapis.com/v1beta/openai/",
    AI_MODEL: process.env.TESTING_AI_MODEL || "models/gemini-2.0-flash",
  };
}

function binPath(installRoot) {
  const binName = process.platform === "win32" ? "ai.cmd" : "ai";
  return path.join(installRoot, "node_modules", ".bin", binName);
}

function homeAiPath(...parts) {
  return path.join(os.homedir(), ".ai", ...parts);
}

function resolveCommand(command) {
  if (
    process.platform === "win32" &&
    !path.extname(command) &&
    (command === "npm" || command === "npx")
  ) {
    return `${command}.cmd`;
  }
  return command;
}

function runProcess(command, args, options = {}) {
  const { cwd, env, stdin, allowFailure = false } = options;
  const resolvedCommand = resolveCommand(command);
  const useShell =
    process.platform === "win32" &&
    (resolvedCommand.endsWith(".cmd") || resolvedCommand.endsWith(".bat"));

  return new Promise((resolve, reject) => {
    const child = spawn(resolvedCommand, args, {
      cwd,
      env,
      stdio: "pipe",
      shell: useShell,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += `${data}`;
    });
    child.stderr.on("data", (data) => {
      stderr += `${data}`;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const result = { code: code || 0, stdout, stderr };
      if (!allowFailure && result.code !== 0) {
        reject(
          new Error(
            `${resolvedCommand} ${args.join(" ")} failed with exit code ${result.code}\n${stderr || stdout}`,
          ),
        );
        return;
      }
      resolve(result);
    });

    if (stdin !== undefined) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

async function runAi(aiPath, args, options = {}) {
  return runProcess(aiPath, args, options);
}

function parseYamlResponse(output) {
  const trimmed = output.trim();
  const fenced = trimmed.match(/```(?:yaml)?\s*([\s\S]*?)```/i);
  const rawYaml = fenced ? fenced[1] : trimmed;
  return yaml.load(rawYaml);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

module.exports = {
  assert,
  binPath,
  getDefaultEnv,
  homeAiPath,
  parseYamlResponse,
  projectRoot,
  runAi,
  runProcess,
  resolveCommand,
};
