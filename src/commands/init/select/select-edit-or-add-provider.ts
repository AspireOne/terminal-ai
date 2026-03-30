import { select, Separator } from "@inquirer/prompts";
import { Choice } from "../../../lib/inquirerjs/choice";
import { ProviderConfiguration } from "../../../configuration/configuration";
import { ErrorCode, TerminalAIError } from "../../../lib/errors";
import {
  promptChoice,
  promptDescription,
  promptMessage,
  promptSeparator,
} from "../../../ui/prompt-styles";

type ProviderChoice = Choice<string>;

interface SelectEditOrAddProviderResult {
  editProvider?: ProviderConfiguration;
  addProvider?: boolean;
}

export async function selectEditOrAddProvider(
  currentProvider: ProviderConfiguration,
  allProviders: ProviderConfiguration[],
): Promise<SelectEditOrAddProviderResult> {
  //  If true, our current provider is the config root provider (i.e. the very
  //  basic unnamed provider).
  const isRoot = currentProvider.name === "";

  //  Add the current provider, which might be the root.
  const currentChoice: ProviderChoice = {
    name: promptChoice(isRoot ? "Configure Provider" : currentProvider.name, {
      tag: "EDIT",
      suffix: isRoot ? "(current)" : "(current)",
    }),
    value: isRoot ? "update_root" : `update_${currentProvider.name}`,
    description: promptDescription(
      `Configure settings for ${isRoot ? "current provider" : currentProvider.name}`,
    ),
  };
  //  Then the other providers.
  const nextChoices = [
    ...allProviders
      .filter((p) => p !== currentProvider)
      .map((p) => ({
        name: promptChoice(p.name, { tag: "EDIT" }),
        value: `update_${p.name}`,
        description: promptDescription(`Configure settings for ${p.name}`),
      })),
  ];
  const addChoice: ProviderChoice = {
    name: promptChoice("Add Provider", { tag: "ADD" }),
    value: "add",
    description: promptDescription("Configure and add a new provider"),
  };

  const choices = [
    currentChoice,
    ...nextChoices,
    new Separator(promptSeparator(" ────────────── ")),
    addChoice,
  ];

  const answer = await select({
    message: promptMessage("Configure / Add Provider:"),
    choices,
  });

  if (answer === "update_root") {
    return { editProvider: currentProvider };
  } else if (answer.startsWith("update")) {
    return {
      editProvider: allProviders.find((p) => `update_${p.name}` === answer),
    };
  } else if (answer === "add") {
    return { addProvider: true };
  }

  throw new TerminalAIError(
    ErrorCode.InvalidOperation,
    `${answer} is not a valid option for edit/add provider`,
  );
}
