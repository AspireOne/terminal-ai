import { jest } from "@jest/globals";
import { createTestExecutionContext } from "../../execution-context/create-test-execution-context";
import { handleExecuteCommand } from "./execute";
import { ExecuteAction } from "../../ui/select-execute-action";

describe("commands/execute/execute", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("runs the generated command when execute is selected", async () => {
    const executionContext = createTestExecutionContext(process);
    const runCommand = jest.fn(async () => undefined);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await handleExecuteCommand(
      "python -V",
      executionContext,
      async () => ExecuteAction.Execute,
      runCommand,
    );

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("python -V"));
    expect(runCommand).toHaveBeenCalledWith("python -V", true);
  });

  it("exits without running the generated command when exit is selected", async () => {
    const executionContext = createTestExecutionContext(process);
    const runCommand = jest.fn(async () => undefined);
    jest.spyOn(console, "log").mockImplementation(() => {});

    await handleExecuteCommand(
      "python -V",
      executionContext,
      async () => ExecuteAction.Exit,
      runCommand,
    );

    expect(runCommand).not.toHaveBeenCalled();
  });
});
