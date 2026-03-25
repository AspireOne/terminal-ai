import { jest } from "@jest/globals";
import { createTestExecutionContext } from "../../execution-context/create-test-execution-context";
import { ExecuteAction } from "../../ui/select-execute-action";
import { commit } from "./commit";

describe("commands/commit/commit", () => {
  const createDeps = () => ({
    ensureApiKey: jest.fn(async () => undefined),
    assertGitRepo: jest.fn(() => undefined),
    getStagedDiff: jest.fn(() => ({
      files: ["src/cli.ts"],
      diff: "diff --git a/src/cli.ts b/src/cli.ts",
    })),
    getBranchName: jest.fn(() => "feature/commit-mode"),
    getRecentCommitSubjects: jest.fn(() => ["feat: existing style"]),
    executeCommitPipeline: jest.fn(async () =>
      JSON.stringify({
        subject: "feat(cli): add commit mode",
        body: "- inspect staged changes",
      }),
    ),
    extractCommitMessageFromResponse: jest.fn(() => ({
      subject: "feat(cli): add commit mode",
      body: "- inspect staged changes",
    })),
    buildGitCommitCommand: jest.fn(
      () =>
        "git commit -m 'feat(cli): add commit mode' -m '- inspect staged changes'",
    ),
    writeClipboard: jest.fn(async () => undefined),
    runCommand: jest.fn(async () => undefined),
    selectAction: jest.fn(async () => ExecuteAction.Exit),
    writeOutput: jest.fn(() => undefined),
  });

  test("prints the generated commit command", async () => {
    const executionContext = createTestExecutionContext(process);
    const deps = createDeps();

    await commit(
      executionContext,
      "focus on the cli flag",
      true,
      false,
      false,
      false,
      [],
      [],
      deps,
    );

    expect(deps.writeOutput).toHaveBeenCalledWith(
      "git commit -m 'feat(cli): add commit mode' -m '- inspect staged changes'\n",
    );
    expect(deps.selectAction).toHaveBeenCalled();
    expect(deps.runCommand).not.toHaveBeenCalled();
  });

  test("copies the generated command when copy is enabled", async () => {
    const executionContext = createTestExecutionContext(process);
    const deps = createDeps();

    await commit(
      executionContext,
      undefined,
      true,
      true,
      false,
      false,
      [],
      [],
      deps,
    );

    expect(deps.writeClipboard).toHaveBeenCalledWith(
      "git commit -m 'feat(cli): add commit mode' -m '- inspect staged changes'",
      true,
    );
    expect(deps.writeOutput).not.toHaveBeenCalled();
  });

  test("executes the generated command when execute is selected", async () => {
    const executionContext = createTestExecutionContext(process);
    const deps = createDeps();
    deps.selectAction.mockResolvedValue(ExecuteAction.Execute);

    await commit(
      executionContext,
      undefined,
      true,
      false,
      false,
      false,
      [],
      [],
      deps,
    );

    expect(deps.runCommand).toHaveBeenCalledWith(
      "git commit -m 'feat(cli): add commit mode' -m '- inspect staged changes'",
      true,
    );
  });

  test("falls back to printing only in non-interactive mode", async () => {
    const executionContext = createTestExecutionContext(process, {
      isTTYstdin: false,
      isTTYstdout: false,
    });
    const deps = createDeps();

    await commit(
      executionContext,
      undefined,
      true,
      false,
      false,
      false,
      [],
      [],
      deps,
    );

    expect(deps.writeOutput).toHaveBeenCalled();
    expect(deps.selectAction).not.toHaveBeenCalled();
    expect(deps.runCommand).not.toHaveBeenCalled();
  });
});
