import { execFileSync } from "child_process";
import { ErrorCode, TerminalAIError } from "../../lib/errors";

export type GitStagedDiff = {
  files: string[];
  diff: string;
};

export type CommitMessage = {
  subject: string;
  body: string;
};

type ShellType = "powershell" | "cmd" | "sh";

type GitRunner = (args: string[]) => string;

function runGit(args: string[]): string {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      `git command failed: git ${args.join(" ")}`,
      error,
    );
  }
}

export function assertGitRepo(runGitCommand: GitRunner = runGit) {
  try {
    runGitCommand(["rev-parse", "--show-toplevel"]);
  } catch (error) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "the current directory must be a git repository",
      error,
    );
  }
}

export function getStagedDiff(
  runGitCommand: GitRunner = runGit,
): GitStagedDiff | null {
  const filesOutput = runGitCommand([
    "diff",
    "--cached",
    "--diff-algorithm=minimal",
    "--name-only",
  ]);
  const files = filesOutput
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);

  if (files.length === 0) {
    return null;
  }

  const diff = runGitCommand(["diff", "--cached", "--diff-algorithm=minimal"]);
  const numstat = runGitCommand(["diff", "--cached", "--numstat"]);
  const binaryFiles = numstat
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter((parts) => parts[0] === "-" && parts[1] === "-" && parts[2])
    .map((parts) => parts[2].trim());

  const binarySummary =
    binaryFiles.length > 0
      ? [
          "",
          "--- Binary Files Changed ---",
          ...binaryFiles.map((file) => `Binary file ${file} changed`),
        ].join("\n")
      : "";
  const finalDiff = `${diff}${binarySummary}`.trim();

  return {
    files,
    diff: finalDiff || `Files changed: ${files.join(", ")}`,
  };
}

export function getBranchName(
  runGitCommand: GitRunner = runGit,
): string | null {
  try {
    const branchName = runGitCommand(["branch", "--show-current"]).trim();
    return branchName || null;
  } catch {
    return null;
  }
}

export function getRecentCommitSubjects(
  limit = 5,
  runGitCommand: GitRunner = runGit,
): string[] {
  try {
    const log = runGitCommand([
      "log",
      `--max-count=${limit}`,
      "--pretty=format:%s",
    ]);
    return log
      .split(/\r?\n/)
      .map((subject) => subject.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function detectShell(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform = process.platform,
): ShellType {
  const shell = (env["SHELL"] || "").toLowerCase();
  const comSpec = (env["ComSpec"] || env["COMSPEC"] || "").toLowerCase();

  if (
    shell.includes("pwsh") ||
    shell.includes("powershell") ||
    "PSModulePath" in env
  ) {
    return "powershell";
  }
  if (shell) {
    return "sh";
  }
  if (comSpec.includes("cmd.exe")) {
    return "cmd";
  }
  return platform === "win32" ? "powershell" : "sh";
}

function quoteForShell(value: string, shell: ShellType): string {
  if (shell === "powershell") {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (shell === "cmd") {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

export function buildGitCommitCommand(
  message: CommitMessage,
  env: NodeJS.ProcessEnv,
): string {
  const shell = detectShell(env);
  const parts = ["git", "commit", "-m", quoteForShell(message.subject, shell)];

  if (message.body) {
    parts.push("-m", quoteForShell(message.body, shell));
  }

  return parts.join(" ");
}
