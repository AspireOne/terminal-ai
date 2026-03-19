import { createTestExecutionContext } from "../../execution-context/create-test-execution-context";
import { initialExecuteInput } from "./initial-execute-input";

describe("commands/execute/initial-execute-input", () => {
  it("returns the provided input without prompting", async () => {
    const executionContext = createTestExecutionContext(process);
    await expect(
      initialExecuteInput(executionContext, "find python"),
    ).resolves.toBe("find python");
  });

  it("fails when the workflow is not interactive", async () => {
    const executionContext = createTestExecutionContext(process, {
      isTTYstdin: false,
    });

    await expect(initialExecuteInput(executionContext, undefined)).rejects.toThrow(
      /must be run interactively/,
    );
  });
});
