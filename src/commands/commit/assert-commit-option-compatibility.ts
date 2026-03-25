import { ErrorCode, TerminalAIError } from "../../lib/errors";

export function assertCommitOptionCompatibility(options: {
  assistant: boolean;
  execute: boolean;
}) {
  if (options.assistant) {
    throw new TerminalAIError(
      ErrorCode.CompatibilityError,
      "the '--commit' flag cannot be used with '--assistant'",
    );
  }

  if (options.execute) {
    throw new TerminalAIError(
      ErrorCode.CompatibilityError,
      "the '--commit' flag cannot be used with '--execute'",
    );
  }
}
