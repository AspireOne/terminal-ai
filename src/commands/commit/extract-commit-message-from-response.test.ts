import { extractCommitMessageFromResponse } from "./extract-commit-message-from-response";

describe("commands/commit/extract-commit-message-from-response", () => {
  test("extracts a valid commit message from raw json", () => {
    expect(
      extractCommitMessageFromResponse(
        '{"subject":"feat(cli): add commit mode","body":"- inspect staged diff"}',
      ),
    ).toEqual({
      subject: "feat(cli): add commit mode",
      body: "- inspect staged diff",
    });
  });

  test("extracts a valid commit message from fenced json", () => {
    expect(
      extractCommitMessageFromResponse(
        '```json\n{"subject":"fix(git): handle binary diffs","body":""}\n```',
      ),
    ).toEqual({
      subject: "fix(git): handle binary diffs",
      body: "",
    });
  });

  test("throws on invalid json", () => {
    expect(() => extractCommitMessageFromResponse("not json")).toThrow(
      /did not return valid JSON/,
    );
  });

  test("throws on empty subjects", () => {
    expect(() =>
      extractCommitMessageFromResponse('{"subject":"  ","body":""}'),
    ).toThrow(/empty commit subject/);
  });
});
