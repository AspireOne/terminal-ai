import {
  detectShell,
  getScriptPostfix,
  getShellArgs,
  getShellExecutable,
} from "./shell";

describe("lib/shell", () => {
  test("detects powershell from PSModulePath", () => {
    expect(
      detectShell(
        {
          PSModulePath:
            "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules",
        },
        "win32",
      ),
    ).toBe("powershell");
  });

  test("detects cmd from ComSpec", () => {
    expect(
      detectShell(
        {
          ComSpec: "C:\\Windows\\System32\\cmd.exe",
        },
        "win32",
      ),
    ).toBe("cmd");
  });

  test("prefers cmd over PSModulePath on windows", () => {
    expect(
      detectShell(
        {
          ComSpec: "C:\\Windows\\System32\\cmd.exe",
          PSModulePath:
            "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules",
        },
        "win32",
      ),
    ).toBe("cmd");
    expect(
      getScriptPostfix(
        {
          ComSpec: "C:\\Windows\\System32\\cmd.exe",
          PSModulePath:
            "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules",
        },
        "win32",
      ),
    ).toBe("cmd");
  });

  test("prefers unix shell over ComSpec on windows", () => {
    expect(
      detectShell(
        {
          SHELL: "C:\\Program Files\\Git\\bin\\bash.exe",
          ComSpec: "C:\\Windows\\System32\\cmd.exe",
        },
        "win32",
      ),
    ).toBe("sh");
  });

  test("defaults to powershell on windows", () => {
    expect(detectShell({}, "win32")).toBe("powershell");
    expect(getScriptPostfix({}, "win32")).toBe("ps1");
  });

  test("defaults to sh on unix", () => {
    expect(detectShell({}, "linux")).toBe("sh");
    expect(getScriptPostfix({}, "linux")).toBe("sh");
  });

  test("builds powershell shell invocation", () => {
    expect(
      getShellExecutable("powershell", {
        COMSPEC: "C:\\Windows\\System32\\cmd.exe",
      }),
    ).toBe("powershell.exe");
    expect(getShellArgs("powershell", "Get-Date")).toEqual([
      "-NoProfile",
      "-Command",
      "Get-Date",
    ]);
  });

  test("reuses configured powershell executable from SHELL", () => {
    expect(
      getShellExecutable("powershell", {
        SHELL: "/usr/local/bin/pwsh",
      }),
    ).toBe("/usr/local/bin/pwsh");
  });
});
