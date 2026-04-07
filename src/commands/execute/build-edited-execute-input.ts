export function buildEditedExecuteInput(
  originalRequest: string,
  currentCommand: string,
  editInstruction: string,
): string {
  return [
    `Original request:`,
    originalRequest,
    ``,
    `Current command:`,
    currentCommand,
    ``,
    `Requested change:`,
    editInstruction,
    ``,
    `Terminal AI will run the next response as the replacement command in the current OS and shell.`,
    `Keep the same format: one revised command line, no explanation.`,
  ].join("\n");
}
