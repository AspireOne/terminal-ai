import { initialChatContext } from "../../chat-pipeline/ChatContext";
import { executeCommitPipeline } from "../../chat-pipeline/commit-pipeline-completion-api";
import { ensureApiKey } from "../../chat-pipeline/stages/ensure-api-key";
import { ExecutionContext } from "../../execution-context/execution-context";
import { execCommand } from "../../lib/cli-helpers";
import { writeClipboard } from "../../lib/clipboard";
import { ErrorCode, TerminalAIError } from "../../lib/errors";
import { ExecuteAction } from "../../ui/select-execute-action";
import { select } from "@inquirer/prompts";
import { assertCommitOptionCompatibility } from "./assert-commit-option-compatibility";
import {
  buildCommitSystemPrompt,
  buildCommitUserPrompt,
} from "./build-commit-prompt";
import { collectCommitContext } from "./collect-commit-context";
import { extractCommitMessageFromResponse } from "./extract-commit-message-from-response";
import {
  assertGitRepo,
  buildGitCommitCommand,
  CommitMessage,
  getBranchName,
  getRecentCommitSubjects,
  getStagedDiff,
} from "./git";

type CommitDependencies = {
  ensureApiKey: typeof ensureApiKey;
  assertGitRepo: typeof assertGitRepo;
  getStagedDiff: typeof getStagedDiff;
  getBranchName: typeof getBranchName;
  getRecentCommitSubjects: typeof getRecentCommitSubjects;
  collectCommitContext: typeof collectCommitContext;
  executeCommitPipeline: typeof executeCommitPipeline;
  extractCommitMessageFromResponse: (response: string) => CommitMessage;
  buildGitCommitCommand: typeof buildGitCommitCommand;
  writeClipboard: typeof writeClipboard;
  runCommand: typeof execCommand;
  selectAction: () => Promise<ExecuteAction>;
  writeOutput: (output: string) => void;
};

async function selectCommitAction(): Promise<ExecuteAction> {
  return await select({
    message: "execute:",
    choices: [
      {
        name: "Execute",
        value: ExecuteAction.Execute,
      },
      {
        name: "Exit",
        value: ExecuteAction.Exit,
      },
    ],
    default: ExecuteAction.Execute,
  });
}

export async function commit(
  executionContext: ExecutionContext,
  inputMessage: string | undefined,
  enableContextPrompts: boolean,
  copy: boolean,
  assistant: boolean,
  executeFlag: boolean,
  think: boolean,
  files: string[],
  imageFiles: string[],
  deps: CommitDependencies = {
    ensureApiKey,
    assertGitRepo,
    getStagedDiff,
    getBranchName,
    getRecentCommitSubjects,
    collectCommitContext,
    executeCommitPipeline,
    extractCommitMessageFromResponse,
    buildGitCommitCommand,
    writeClipboard,
    runCommand: execCommand,
    selectAction: selectCommitAction,
    writeOutput: (output) => process.stdout.write(output),
  },
) {
  assertCommitOptionCompatibility({
    assistant,
    execute: executeFlag,
  });

  await deps.ensureApiKey(executionContext);
  deps.assertGitRepo();

  const stagedDiff = deps.getStagedDiff();
  if (!stagedDiff) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "no staged changes found; stage files before using '--commit'",
    );
  }

  const repositoryContext = deps.collectCommitContext(process.cwd());

  const response = await deps.executeCommitPipeline(
    {
      executionContext,
      chatContext: {
        ...initialChatContext(),
        filePathsOutbox: files,
        imageFilePathsOutbox: imageFiles,
      },
      inputMessage: buildCommitUserPrompt({
        stagedDiff,
        branchName: deps.getBranchName(),
        recentCommitSubjects: deps.getRecentCommitSubjects(),
        guidance: inputMessage,
        repositoryContext,
      }),
      options: {
        enableContextPrompts,
        enableOutputPrompts: false,
        copy: false,
        raw: true,
        think,
      },
    },
    buildCommitSystemPrompt(),
  );

  const command = deps.buildGitCommitCommand(
    deps.extractCommitMessageFromResponse(response),
    executionContext.process.env,
  );

  if (copy) {
    await deps.writeClipboard(command, executionContext.isTTYstdout);
    return;
  }

  deps.writeOutput(`${command}\n`);

  if (!executionContext.isTTYstdin || !executionContext.isTTYstdout) {
    return;
  }

  const action = await deps.selectAction();
  if (action === ExecuteAction.Execute) {
    await deps.runCommand(command, true);
  }
}
