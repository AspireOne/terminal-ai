import {
  selectExecuteAction,
  ExecuteAction,
} from "../../ui/select-execute-action";
import { initialChatContext } from "../../chat-pipeline/ChatContext";
import { executeExecutePipeline } from "../../chat-pipeline/execute-pipeline-completion-api";
import { ensureApiKey } from "../../chat-pipeline/stages/ensure-api-key";
import { ExecutionContext } from "../../execution-context/execution-context";
import { execCommand } from "../../lib/cli-helpers";
import { printMessage } from "../../theme";
import { assertExecuteOptionCompatibility } from "./assert-execute-option-compatibility";
import { buildEditedExecuteInput } from "./build-edited-execute-input";
import { editExecuteInput } from "./edit-execute-input";
import { extractCommandFromResponse } from "./extract-command-from-response";
import { initialExecuteInput } from "./initial-execute-input";

export async function handleExecuteCommand(
  command: string,
  executionContext: ExecutionContext,
  selectAction: () => Promise<ExecuteAction> = selectExecuteAction,
  runCommand: (
    command: string,
    interactive: boolean,
  ) => Promise<void> = execCommand,
): Promise<ExecuteAction> {
  console.log(printMessage(command, executionContext.isTTYstdout));

  const action = await selectAction();
  if (action === ExecuteAction.Execute) {
    await runCommand(command, true);
  }

  return action;
}

export async function runExecuteLoop(
  originalInputMessage: string,
  executionContext: ExecutionContext,
  generateCommand: (inputMessage: string) => Promise<string>,
  selectAction: () => Promise<ExecuteAction> = selectExecuteAction,
  getEditInput: (
    executionContext: ExecutionContext,
  ) => Promise<string> = editExecuteInput,
  runCommand: (
    command: string,
    interactive: boolean,
  ) => Promise<void> = execCommand,
) {
  let nextInputMessage = originalInputMessage;

  while (true) {
    const command = await generateCommand(nextInputMessage);
    const action = await handleExecuteCommand(
      command,
      executionContext,
      selectAction,
      runCommand,
    );

    if (action !== ExecuteAction.Edit) {
      return;
    }

    const editInstruction = await getEditInput(executionContext);
    nextInputMessage = buildEditedExecuteInput(
      originalInputMessage,
      command,
      editInstruction,
    );
  }
}

export async function execute(
  executionContext: ExecutionContext,
  inputMessage: string | undefined,
  enableContextPrompts: boolean,
  enableOutputPrompts: boolean,
  copy: boolean,
  assistant: boolean,
  files: string[],
  imageFiles: string[],
) {
  assertExecuteOptionCompatibility({
    assistant,
    copy,
    enableOutputPrompts,
  });

  await ensureApiKey(executionContext);

  const executeInput = await initialExecuteInput(
    executionContext,
    inputMessage,
  );

  await runExecuteLoop(executeInput, executionContext, async (inputMessage) => {
    const chatContext = {
      ...initialChatContext(),
      filePathsOutbox: files,
      imageFilePathsOutbox: imageFiles,
    };

    const response = await executeExecutePipeline({
      executionContext,
      chatContext,
      inputMessage,
      options: {
        enableContextPrompts,
        enableOutputPrompts,
        copy: false,
        raw: false,
      },
    });

    return extractCommandFromResponse(response);
  });
}
