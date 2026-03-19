import { buildEditedExecuteInput } from "./build-edited-execute-input";

describe("commands/execute/build-edited-execute-input", () => {
  it("includes the original request, current command and edit instruction", () => {
    expect(
      buildEditedExecuteInput(
        "print the current python path",
        'python -c "import sys; print(sys.executable)"',
        "use py instead of python",
      ),
    ).toContain("The original request was:");
    expect(
      buildEditedExecuteInput(
        "print the current python path",
        'python -c "import sys; print(sys.executable)"',
        "use py instead of python",
      ),
    ).toContain("print the current python path");
    expect(
      buildEditedExecuteInput(
        "print the current python path",
        'python -c "import sys; print(sys.executable)"',
        "use py instead of python",
      ),
    ).toContain('python -c "import sys; print(sys.executable)"');
    expect(
      buildEditedExecuteInput(
        "print the current python path",
        'python -c "import sys; print(sys.executable)"',
        "use py instead of python",
      ),
    ).toContain("use py instead of python");
  });
});
