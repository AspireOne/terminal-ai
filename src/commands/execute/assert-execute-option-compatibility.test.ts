import { assertExecuteOptionCompatibility } from "./assert-execute-option-compatibility";

describe("commands/execute/assert-execute-option-compatibility", () => {
  it("allows supported execute options", () => {
    expect(() =>
      assertExecuteOptionCompatibility({
        assistant: false,
        copy: false,
        enableOutputPrompts: true,
      }),
    ).not.toThrow();
  });

  it("rejects assistant mode", () => {
    expect(() =>
      assertExecuteOptionCompatibility({
        assistant: true,
        copy: false,
        enableOutputPrompts: true,
      }),
    ).toThrow(/cannot be used with '--assistant'/);
  });

  it("rejects copy mode", () => {
    expect(() =>
      assertExecuteOptionCompatibility({
        assistant: false,
        copy: true,
        enableOutputPrompts: true,
      }),
    ).toThrow(/cannot be used with '--copy'/);
  });

  it("rejects disabled output prompts", () => {
    expect(() =>
      assertExecuteOptionCompatibility({
        assistant: false,
        copy: false,
        enableOutputPrompts: false,
      }),
    ).toThrow(/cannot be used with '--no-output-prompts'/);
  });
});
