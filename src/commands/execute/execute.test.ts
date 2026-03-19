import { jest } from "@jest/globals";
import { createTestExecutionContext } from "../../execution-context/create-test-execution-context";
import { buildEditedExecuteInput } from "./build-edited-execute-input";
import { handleExecuteCommand, runExecuteLoop } from "./execute";
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

  it("does not run the generated command when edit is selected", async () => {
    const executionContext = createTestExecutionContext(process);
    const runCommand = jest.fn(async () => undefined);
    jest.spyOn(console, "log").mockImplementation(() => {});

    await handleExecuteCommand(
      "python -V",
      executionContext,
      async () => ExecuteAction.Edit,
      runCommand,
    );

    expect(runCommand).not.toHaveBeenCalled();
  });

  it("regenerates the command after edit feedback and executes the updated command", async () => {
    const executionContext = createTestExecutionContext(process);
    const runCommand = jest.fn(async () => undefined);
    const generateCommand = jest
      .fn<(_: string) => Promise<string>>()
      .mockResolvedValueOnce("python -V")
      .mockResolvedValueOnce('python -c "import sys; print(sys.executable)"');
    const selectAction = jest
      .fn<() => Promise<ExecuteAction>>()
      .mockResolvedValueOnce(ExecuteAction.Edit)
      .mockResolvedValueOnce(ExecuteAction.Execute);
    const getEditInput = jest
      .fn<(_: typeof executionContext) => Promise<string>>()
      .mockResolvedValue("print the executable path instead");

    jest.spyOn(console, "log").mockImplementation(() => {});

    await runExecuteLoop(
      "print python info",
      executionContext,
      generateCommand,
      selectAction,
      getEditInput,
      runCommand,
    );

    expect(generateCommand).toHaveBeenNthCalledWith(1, "print python info");
    expect(generateCommand).toHaveBeenNthCalledWith(
      2,
      buildEditedExecuteInput(
        "print python info",
        "python -V",
        "print the executable path instead",
      ),
    );
    expect(runCommand).toHaveBeenCalledWith(
      'python -c "import sys; print(sys.executable)"',
      true,
    );
  });
});
