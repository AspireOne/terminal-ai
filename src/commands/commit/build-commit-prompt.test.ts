import { buildCommitUserPrompt } from "./build-commit-prompt";

describe("commands/commit/build-commit-prompt", () => {
  const stagedDiff = {
    files: ["src/cli.ts"],
    diff: "diff --git a/src/cli.ts b/src/cli.ts",
  };

  test("omits repository context when no docs are found", () => {
    const prompt = buildCommitUserPrompt({
      stagedDiff,
      branchName: "feature/commit-context",
      recentCommitSubjects: ["feat: existing style"],
      repositoryContext: [],
    });

    expect(prompt).not.toContain("Repository context:");
    expect(prompt).toContain("Git diff:");
  });

  test("includes repository context and focuses the model on staged changes", () => {
    const prompt = buildCommitUserPrompt({
      stagedDiff,
      branchName: "feature/commit-context",
      recentCommitSubjects: ["feat: existing style"],
      guidance: "keep it concise",
      repositoryContext: [
        {
          path: "./AGENTS.md",
          content: "Repository conventions",
        },
        {
          path: "src/README.md",
          content: "Subdirectory details",
        },
      ],
    });

    expect(prompt).toContain("Repository context:");
    expect(prompt).toContain(
      "These files are supplemental context only. Focus primarily on the staged git changes when generating the commit message.",
    );
    expect(prompt).toContain("--- BEGIN CONTEXT FILE: ./AGENTS.md ---");
    expect(prompt).toContain("--- BEGIN CONTEXT FILE: src/README.md ---");
    expect(prompt).toContain("Additional user guidance: keep it concise");
    expect(prompt).toContain("Git diff:");
  });
});
