export function buildEditedExecuteInput(
  originalRequest: string,
  currentCommand: string,
  editInstruction: string,
): string {
  return [
    `The original request was:`,
    originalRequest,
    ``,
    `The current generated command is:`,
    currentCommand,
    ``,
    `Update the command to satisfy this change request:`,
    editInstruction,
    ``,
    `Return only the revised shell command.`,
  ].join("\n");
}
