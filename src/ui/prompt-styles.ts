import { richBeige, softBeige, warmBeige } from "../theme";

export function promptMessage(text: string): string {
  return richBeige(text);
}

export function promptTag(tag: string): string {
  return richBeige(`[${tag}]`);
}

export function promptChoice(
  label: string,
  options?: {
    tag?: string;
    suffix?: string;
  },
): string {
  const prefix = options?.tag ? `${promptTag(options.tag)} ` : "";
  const suffix = options?.suffix ? softBeige(` ${options.suffix}`) : "";
  return `${prefix}${warmBeige(label)}${suffix}`;
}

export function promptDescription(text: string): string {
  return softBeige(text);
}

export function promptSeparator(text: string): string {
  return softBeige(text);
}
