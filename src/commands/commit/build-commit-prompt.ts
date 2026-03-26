import { CommitMessage, GitStagedDiff } from "./git";

export type CommitContextFile = {
  path: string;
  content: string;
};

export function buildCommitSystemPrompt(): string {
  return [
    "You generate git commit messages from repository context.",
    "Return only valid JSON with this shape:",
    '{"subject":"<commit subject>","body":"<optional commit body>"}',
    "Rules:",
    "- Use conventional commits for the subject",
    "- Keep the subject concise, imperative, and without a trailing period",
    "- Prefer a specific scope when the changed files suggest one",
    "- The body is optional; use an empty string when not needed",
    "- Do not wrap the JSON in markdown fences",
    "- Do not include any commentary outside the JSON object",
  ].join("\n");
}

export function buildCommitUserPrompt(args: {
  stagedDiff: GitStagedDiff;
  branchName: string | null;
  recentCommitSubjects: string[];
  guidance?: string;
  repositoryContext: CommitContextFile[];
}): string {
  const {
    stagedDiff,
    branchName,
    recentCommitSubjects,
    guidance,
    repositoryContext,
  } = args;
  const repositoryContextSection =
    repositoryContext.length > 0
      ? [
          "Repository context:",
          "These files are supplemental context only. Focus primarily on the staged git changes when generating the commit message.",
          ...repositoryContext.flatMap((file) => [
            `--- BEGIN CONTEXT FILE: ${file.path} ---`,
            file.content,
            "--- END CONTEXT FILE ---",
          ]),
          "",
        ]
      : [];

  const sections = [
    branchName ? `Current branch: ${branchName}` : "Current branch: unknown",
    "",
    "Staged files:",
    ...stagedDiff.files.map((file) => `- ${file}`),
    "",
    "Recent commit subjects:",
    ...(recentCommitSubjects.length > 0
      ? recentCommitSubjects.map((subject) => `- ${subject}`)
      : ["- None available"]),
    "",
    ...repositoryContextSection,
    guidance ? `Additional user guidance: ${guidance}` : undefined,
    guidance ? "" : undefined,
    "Git diff:",
    "```diff",
    stagedDiff.diff,
    "```",
  ].filter((line): line is string => line !== undefined);

  return sections.join("\n");
}

export function normalizeCommitMessage(message: CommitMessage): CommitMessage {
  return {
    subject: message.subject.trim(),
    body: message.body.trim(),
  };
}
