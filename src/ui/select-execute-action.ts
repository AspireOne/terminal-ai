import { select } from "@inquirer/prompts";

export enum ExecuteAction {
  Execute = "execute",
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
        name: "Exit",
        value: ExecuteAction.Exit,
      },
    ],
    default: ExecuteAction.Execute,
  });
}
