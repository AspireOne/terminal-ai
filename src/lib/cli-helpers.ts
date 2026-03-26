import child_process from "child_process";
import colors from "colors/safe";
import { detectShell, getShellArgs, getShellExecutable } from "./shell";

export async function execCommand(
  command: string,
  interactive: boolean,
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
) {
  const shell = detectShell(env, platform);
  const executable = getShellExecutable(shell, env);
  const args = getShellArgs(shell, command);

  await new Promise<void>((resolve, reject) => {
    const subprocess = child_process.spawn(executable, args, {
      env,
      stdio: interactive ? "inherit" : "pipe",
    });

    let stdout = "";
    let stderr = "";

    if (!interactive) {
      subprocess.stdout?.on("data", (data) => {
        stdout += `${data}`;
      });
      subprocess.stderr?.on("data", (data) => {
        stderr += `${data}`;
      });
    }

    subprocess.on("error", reject);
    subprocess.on("close", (code) => {
      if (!interactive) {
        if (stderr) {
          console.log(interactive ? colors.red(stderr) : stderr);
        }
        if (stdout) {
          console.log(interactive ? colors.white(stdout) : stdout);
        }
      }

      if (code && code !== 0) {
        reject(new Error(`command failed with exit code ${code}`));
        return;
      }
      resolve();
    });
  });
}
