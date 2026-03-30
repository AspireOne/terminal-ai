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

export async function selectExecuteAction(): Promise<ExecuteAction> {
  return await select({
    message: promptMessage("execute:"),
    choices: [
      {
        name: promptChoice("Execute", { tag: "RUN" }),
        value: ExecuteAction.Execute,
        description: promptDescription("Run the current command."),
      },
      {
        name: promptChoice("Edit", { tag: "EDIT" }),
        value: ExecuteAction.Edit,
        description: promptDescription(
          "Open the command in your editor first.",
        ),
      },
      {
        name: promptChoice("Exit", { tag: "EXIT" }),
        value: ExecuteAction.Exit,
        description: promptDescription("Leave without running anything."),
      },
    ],
    default: ExecuteAction.Execute,
  });
}
