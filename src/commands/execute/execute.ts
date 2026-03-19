import { selectExecuteAction, ExecuteAction } from "../../ui/select-execute-action";
import { initialChatContext } from "../../chat-pipeline/ChatContext";
import { executeExecutePipeline } from "../../chat-pipeline/execute-pipeline-completion-api";
import { ensureApiKey } from "../../chat-pipeline/stages/ensure-api-key";
import { ExecutionContext } from "../../execution-context/execution-context";
import { execCommand } from "../../lib/cli-helpers";
import { printMessage } from "../../theme";
import { assertExecuteOptionCompatibility } from "./assert-execute-option-compatibility";
import { extractCommandFromResponse } from "./extract-command-from-response";
import { initialExecuteInput } from "./initial-execute-input";

export async function handleExecuteCommand(
  command: string,
  executionContext: ExecutionContext,
  selectAction: () => Promise<ExecuteAction> = selectExecuteAction,
  runCommand: (command: string, interactive: boolean) => Promise<void> =
    execCommand,
) {
  console.log(printMessage(command, executionContext.isTTYstdout));

  const action = await selectAction();
  if (action === ExecuteAction.Execute) {
    await runCommand(command, true);
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

  const executeInput = await initialExecuteInput(executionContext, inputMessage);
  const chatContext = {
    ...initialChatContext(),
    filePathsOutbox: files,
    imageFilePathsOutbox: imageFiles,
  };

  const response = await executeExecutePipeline({
    executionContext,
    chatContext,
    inputMessage: executeInput,
    options: {
      enableContextPrompts,
      enableOutputPrompts,
      copy: false,
      raw: false,
    },
  });

  const command = extractCommandFromResponse(response);
  await handleExecuteCommand(command, executionContext);
}
