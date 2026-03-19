import { ChatResponse } from "../../chat-pipeline/stages/parse-response";
import { ErrorCode, TerminalAIError } from "../../lib/errors";

export function extractCommandFromResponse(response: ChatResponse): string {
  const codeBlockCommand = response.codeBlocks[0]?.plainTextCode?.trim();
  if (codeBlockCommand) {
    return codeBlockCommand;
  }

  const plainTextCommand = response.plainTextFormattedResponse.trim();
  if (plainTextCommand) {
    return plainTextCommand;
  }

  const rawCommand = response.rawMarkdownResponse.trim();
  if (rawCommand) {
    return rawCommand;
  }

  throw new TerminalAIError(
    ErrorCode.InvalidOperation,
    "no shell command was generated",
  );
}
