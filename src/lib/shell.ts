export type ShellType = "powershell" | "cmd" | "sh";

export function detectShell(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform = process.platform,
): ShellType {
  const shell = (env["SHELL"] || "").toLowerCase();
  const comSpec = (env["ComSpec"] || env["COMSPEC"] || "").toLowerCase();

  if (shell.includes("pwsh") || shell.includes("powershell")) {
    return "powershell";
  }
  if (shell) {
    return "sh";
  }
  if (comSpec.includes("powershell")) {
    return "powershell";
  }
  if (comSpec.includes("cmd.exe")) {
    return "cmd";
  }
  if ("PSModulePath" in env) {
    return "powershell";
  }
  return platform === "win32" ? "powershell" : "sh";
}

export function getShellExecutable(
  shell: ShellType,
  env: NodeJS.ProcessEnv,
): string {
  if (shell === "powershell") {
    const configuredShell = env["SHELL"];
    if (configuredShell && /pwsh|powershell/i.test(configuredShell)) {
      return configuredShell;
    }
    const comSpec = env["ComSpec"] || env["COMSPEC"];
    if (comSpec?.toLowerCase().includes("powershell")) {
      return comSpec;
    }
    return "powershell.exe";
  }
  if (shell === "cmd") {
    return env["ComSpec"] || env["COMSPEC"] || "cmd.exe";
  }
  return env["SHELL"] || "/bin/sh";
}

export function getShellArgs(shell: ShellType, command: string): string[] {
  if (shell === "powershell") {
    return ["-NoProfile", "-Command", command];
  }
  if (shell === "cmd") {
    return ["/d", "/s", "/c", command];
  }
  return ["-c", command];
}

export function getScriptPostfix(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform = process.platform,
): string {
  const shell = detectShell(env, platform);
  if (shell === "powershell") {
    return "ps1";
  }
  if (shell === "cmd") {
    return "cmd";
  }
  return "sh";
}
