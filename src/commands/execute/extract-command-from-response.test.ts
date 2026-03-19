import { parseResponse } from "../../chat-pipeline/stages/parse-response";
import { extractCommandFromResponse } from "./extract-command-from-response";

describe("commands/execute/extract-command-from-response", () => {
  it("prefers the first code block", () => {
    const response = parseResponse(
      "chatgpt",
      '```sh\npython -c "import sys; print(sys.executable)"\n```',
    );

    expect(extractCommandFromResponse(response)).toBe(
      'python -c "import sys; print(sys.executable)"',
    );
  });

  it("falls back to plain text when no code block is present", () => {
    const response = parseResponse("chatgpt", "python -V");
    expect(extractCommandFromResponse(response)).toBe("python -V");
  });

  it("throws when the response is empty", () => {
    const response = parseResponse("chatgpt", "   ");
    expect(() => extractCommandFromResponse(response)).toThrow(
      /no shell command was generated/,
    );
  });
});
