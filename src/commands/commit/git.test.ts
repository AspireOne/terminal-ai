import {
  assertGitRepo,
  buildGitCommitCommand,
  getBranchName,
  getRecentCommitSubjects,
  getStagedDiff,
} from "./git";

describe("commands/commit/git", () => {
  test("returns null when there are no staged changes", () => {
    expect(getStagedDiff(() => "")).toBeNull();
  });

  test("returns staged files and diff content", () => {
    const outputs = [
      "src/cli.ts\nREADME.md\n",
      "diff --git a/src/cli.ts b/src/cli.ts",
      "1\t1\tsrc/cli.ts\n",
    ];

    expect(getStagedDiff(() => outputs.shift() || "")).toEqual({
      files: ["src/cli.ts", "README.md"],
      diff: "diff --git a/src/cli.ts b/src/cli.ts",
    });
  });

  test("includes binary file summaries when git diff is empty", () => {
    const outputs = ["image.png\n", "", "-\t-\timage.png\n"];

    expect(getStagedDiff(() => outputs.shift() || "")).toEqual({
      files: ["image.png"],
      diff: "--- Binary Files Changed ---\nBinary file image.png changed",
    });
  });

  test("returns branch name when available", () => {
    expect(getBranchName(() => "feature/commit-mode\n")).toBe(
      "feature/commit-mode",
    );
  });

  test("returns recent commit subjects", () => {
    expect(getRecentCommitSubjects(5, () => "feat: one\nfix: two\n")).toEqual([
      "feat: one",
      "fix: two",
    ]);
  });

  test("throws when the current directory is not a git repo", () => {
    expect(() =>
      assertGitRepo(() => {
        throw new Error("fatal");
      }),
    ).toThrow(/must be a git repository/);
  });

  test("builds a powershell-safe git commit command", () => {
    expect(
      buildGitCommitCommand(
        {
          subject: "feat(cli): add --commit",
          body: "Handle user's staged changes",
        },
        {
          PSModulePath:
            "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\Modules",
        },
      ),
    ).toBe(
      "git commit -m 'feat(cli): add --commit' -m 'Handle user''s staged changes'",
    );
  });

  test("builds a posix-safe git commit command", () => {
    expect(
      buildGitCommitCommand(
        {
          subject: "fix(parser): handle quotes",
          body: "don't break single quotes",
        },
        { SHELL: "/bin/bash" },
      ),
    ).toBe(
      "git commit -m 'fix(parser): handle quotes' -m 'don'\"'\"'t break single quotes'",
    );
  });
});
