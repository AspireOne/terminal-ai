import { ErrorCode, TerminalAIError } from "../../lib/errors";
import { normalizeCommitMessage } from "./build-commit-prompt";
import { CommitMessage } from "./git";

function extractJsonPayload(response: string): string {
  const trimmed = response.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

export function extractCommitMessageFromResponse(
  response: string,
): CommitMessage {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(response));
  } catch (error) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "the commit generator did not return valid JSON",
      error,
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as CommitMessage).subject !== "string" ||
    typeof (parsed as CommitMessage).body !== "string"
  ) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "the commit generator returned an unexpected response shape",
    );
  }

  const message = normalizeCommitMessage(parsed as CommitMessage);
  if (!message.subject) {
    throw new TerminalAIError(
      ErrorCode.InvalidOperation,
      "the commit generator returned an empty commit subject",
    );
  }

  return message;
}
