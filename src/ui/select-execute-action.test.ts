import {
  promptChoice,
  promptDescription,
  promptMessage,
} from "./prompt-styles";
import {
  createExecuteActionPrompt,
  ExecuteAction,
} from "./select-execute-action";

describe("ui/selectExecuteAction", () => {
  it("shows execute actions without tag prefixes", () => {
    expect(createExecuteActionPrompt()).toEqual({
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
    });
  });
});
