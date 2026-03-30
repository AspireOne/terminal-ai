import { select } from "@inquirer/prompts";
import { ProviderType } from "../../../providers/provider-type";
import {
  promptChoice,
  promptDescription,
  promptMessage,
} from "../../../ui/prompt-styles";

export async function selectProviderType(
  defaultType: ProviderType,
  message?: string,
): Promise<ProviderType> {
  return await select({
    message: promptMessage(message || "Provider Type:"),
    default: defaultType,
    choices: [
      {
        name: promptChoice("OpenAI", { tag: "API" }),
        value: "openai",
        description: promptDescription("OpenAI"),
      },
      {
        name: promptChoice("Gemini (OpenAI)", { tag: "API" }),
        value: "gemini_openai",
        description: promptDescription("Gemini (using OpenAI compatiblity)"),
      },
      {
        name: promptChoice("OpenAI Compatible", { tag: "API" }),
        value: "openai_compatible",
        description: promptDescription("Any OpenAI Compatible Provider"),
      },
    ],
  });
}
