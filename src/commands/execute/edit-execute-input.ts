import advancedInput from "@dwmkerr/inquirer-advanced-input-prompt";
import { ExecutionContext } from "../../execution-context/execution-context";
import theme from "../../theme";

export async function editExecuteInput(
  executionContext: ExecutionContext,
): Promise<string> {
  void executionContext;
  let executeEditInput = "";
  while (executeEditInput.trim() === "") {
    executeEditInput = await advancedInput({
      message: theme.inputPrompt("edit"),
    });
  }

  return executeEditInput;
}
