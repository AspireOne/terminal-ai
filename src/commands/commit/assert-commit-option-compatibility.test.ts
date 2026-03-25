import { assertCommitOptionCompatibility } from "./assert-commit-option-compatibility";

describe("commands/commit/assert-commit-option-compatibility", () => {
  test("throws if assistant mode is enabled", () => {
    expect(() =>
      assertCommitOptionCompatibility({
        assistant: true,
        execute: false,
      }),
    ).toThrow(/cannot be used with '--assistant'/);
  });

  test("throws if execute mode is enabled", () => {
    expect(() =>
      assertCommitOptionCompatibility({
        assistant: false,
        execute: true,
      }),
    ).toThrow(/cannot be used with '--execute'/);
  });

  test("does not throw for compatible options", () => {
    expect(() =>
      assertCommitOptionCompatibility({
        assistant: false,
        execute: false,
      }),
    ).not.toThrow();
  });
});
