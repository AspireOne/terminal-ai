import { buildEditedExecuteInput } from "./build-edited-execute-input";

describe("commands/execute/build-edited-execute-input", () => {
  it("includes the original request, current command and edit instruction", () => {
    expect(
      buildEditedExecuteInput(
        "print the current python path",
        'python -c "import sys; print(sys.executable)"',
        "use py instead of python",
      ),
    ).toContain("Original request:");
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
    expect(
      buildEditedExecuteInput(
        "print the current python path",
        'python -c "import sys; print(sys.executable)"',
        "use py instead of python",
      ),
    ).toContain(
      "Terminal AI will run the next response as the replacement command",
    );
  });
});
