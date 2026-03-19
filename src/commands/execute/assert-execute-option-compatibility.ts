import { ErrorCode, TerminalAIError } from "../../lib/errors";

export function assertExecuteOptionCompatibility(options: {
  assistant: boolean;
  copy: boolean;
  enableOutputPrompts: boolean;
}) {
  if (options.assistant) {
    throw new TerminalAIError(
      ErrorCode.CompatibilityError,
      "the '-e' flag cannot be used with '--assistant'",
    );
  }

  if (options.copy) {
    throw new TerminalAIError(
      ErrorCode.CompatibilityError,
      "the '-e' flag cannot be used with '--copy'",
    );
  }

  if (!options.enableOutputPrompts) {
    throw new TerminalAIError(
      ErrorCode.CompatibilityError,
      "the '-e' flag requires output prompts and cannot be used with '--no-output-prompts'",
    );
  }
}
