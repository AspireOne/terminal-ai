import colors from "colors/safe";
import { stripFormatting } from "./lib/markdown";

const ANSI_RESET = "\u001b[0m";
const ANSI_BOLD = "\u001b[1m";

function ansi256(
  text: string,
  colorCode: number,
  bold: boolean = false,
): string {
  const open = `\u001b[38;5;${colorCode}m`;
  const weight = bold ? ANSI_BOLD : "";
  return `${weight}${open}${text}${ANSI_RESET}`;
}

export function warmBeige(text: string): string {
  return ansi256(text, 223);
}

export function softBeige(text: string): string {
  return ansi256(text, 180);
}

export function richBeige(text: string): string {
  return ansi256(text, 224, true);
}

export function deleteLinesAboveCursor(count: number) {
  for (let i = 0; i < count; i++) {
    // Delete previous line and move cursor up
    process.stdout.write("\u001b[1A\u001b[K");
  }
}

export function print(message: string, interactive: boolean) {
  return interactive ? message : stripFormatting(message);
}

export function printMessage(message: string, interactive: boolean) {
  return interactive ? colors.white(message) : message;
}

export function printWarning(message: string, interactive: boolean) {
  return interactive ? colors.yellow(message) : message;
}

export function printError(message: string, interactive: boolean) {
  return interactive ? colors.red(message) : message;
}

export function inputPrompt(prompt: string): string {
  return richBeige(`${prompt}:`);
}

export function printHint(hint: string, interactive: boolean) {
  return interactive ? softBeige(hint) : hint;
}

export async function startSpinner(interactive: boolean, text: string = "") {
  if (!interactive) {
    return {
      stop: () => undefined,
      succeed: () => undefined,
      fail: () => undefined,
    };
  }

  const ora = (await import("ora")).default;
  return ora({
    text: warmBeige(text || "Waiting for response..."),
    color: "white",
    prefixText: softBeige("··"),
    spinner: {
      interval: 90,
      frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙●∙"],
    },
  }).start();
}

export default {
  printMessage,
  printWarning,
  printError,
  inputPrompt,
  printHint,
};
