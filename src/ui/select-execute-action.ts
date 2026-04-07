import { select } from "@inquirer/prompts";
import {
  promptChoice,
  promptDescription,
  promptMessage,
} from "./prompt-styles";

export enum ExecuteAction {
  Execute = "execute",
  Edit = "edit",
  Exit = "exit",
}

export function createExecuteActionPrompt() {
  return {
    message: promptMessage("execute:"),
    choices: [
      {
        name: promptChoice("Execute"),
        value: ExecuteAction.Execute,
        description: promptDescription("Run the current command."),
      },
      {
        name: promptChoice("Edit"),
        value: ExecuteAction.Edit,
        description: promptDescription(
          "Open the command in your editor first.",
        ),
      },
      {
        name: promptChoice("Exit"),
        value: ExecuteAction.Exit,
        description: promptDescription("Leave without running anything."),
      },
    ],
    default: ExecuteAction.Execute,
  };
}

export async function selectExecuteAction(): Promise<ExecuteAction> {
  return await select(createExecuteActionPrompt());
}
