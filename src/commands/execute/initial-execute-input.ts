import advancedInput from "@dwmkerr/inquirer-advanced-input-prompt";
import { ExecutionContext } from "../../execution-context/execution-context";
import theme from "../../theme";
import { ErrorCode, TerminalAIError } from "../../lib/errors";

export async function initialExecuteInput(
  executionContext: ExecutionContext,
  inputMessage: string | undefined,
): Promise<string> {
  if (inputMessage) {
    return inputMessage;
  }

  if (!executionContext.isTTYstdin || !executionContext.isTTYstdout) {
    throw new TerminalAIError(
      ErrorCode.InvalidConfiguration,
      "the '-e' workflow must be run interactively",
    );
  }

  let executeInput = "";
  while (executeInput.trim() === "") {
    executeInput = await advancedInput({
      message: theme.inputPrompt("execute"),
    });
  }

  return executeInput;
}
