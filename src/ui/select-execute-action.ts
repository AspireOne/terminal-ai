import { select } from "@inquirer/prompts";

export enum ExecuteAction {
  Execute = "execute",
  Edit = "edit",
  Exit = "exit",
}

export async function selectExecuteAction(): Promise<ExecuteAction> {
  return await select({
    message: "execute:",
    choices: [
      {
        name: "Execute",
        value: ExecuteAction.Execute,
      },
      {
        name: "Edit",
        value: ExecuteAction.Edit,
      },
      {
        name: "Exit",
        value: ExecuteAction.Exit,
      },
    ],
    default: ExecuteAction.Execute,
  });
}
