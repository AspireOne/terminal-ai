import { search, Separator } from "@inquirer/prompts";
import { providers } from "@dwmkerr/ai-providers-and-models";
import { Choice } from "../../../lib/inquirerjs/choice";
import { ProviderType } from "../../../providers/provider-type";
import { getPredefinedModels } from "../../../providers/get-predefined-models";
import {
  promptChoice,
  promptDescription,
  promptMessage,
  promptSeparator,
} from "../../../ui/prompt-styles";

type ModelChoice = Choice<string>;
type ModelChoices = (ModelChoice | Separator)[];

export async function selectModel(
  defaultModel?: string,
  providerType?: ProviderType,
): Promise<string> {
  //  We might have predefined models we can use.
  const predefinedModels = getPredefinedModels(
    providerType || "openai_compatible",
  );

  //  We might also have a subset of validated models from the 'ai providers
  //  and models' repo.
  const validatedProvider = providerType ? providers[providerType] : undefined;
  const validatedModels = validatedProvider?.models || {};

  //  Helper function to determine whether a given model id represents a
  //  validated model from our external repo.
  const isValidatedModel = (id: string) => !!validatedModels[id];
  const validatedModelChoices = predefinedModels
    .filter(isValidatedModel)
    .map((m) => {
      const model = validatedModels[m];
      return {
        value: model.id,
        name: promptChoice(model.name, { tag: "TESTED" }),
        description: promptDescription(
          `${model.id} · ${model.description_short}`,
        ),
        disabled: false,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const unvalidatedModelChoices = predefinedModels
    .filter((m) => !isValidatedModel(m))
    .map((modelId) => {
      return {
        value: modelId,
        name: promptChoice(modelId, { tag: "CUSTOM", suffix: "*" }),
        short: modelId,
        description: promptDescription(`${modelId} - not fully tested`),
        disabled: false,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  //  Now let's join these together to get a set of choices - each of the
  //  predefined models as well as an indicator of whether it is validated.
  //  If we have a default mode, we include a 'default' answer which is the
  //  empty string - this'll just keep what the user has already selected.
  const keepExisting: ModelChoice = {
    name: promptChoice("Keep existing", {
      tag: "KEEP",
      suffix: defaultModel,
    }),
    value: defaultModel || "",
    description: promptDescription(`Keep existing model ${defaultModel}`),
    disabled: false,
  };
  const choices: ModelChoices = [
    ...(defaultModel ? [keepExisting] : []),
    ...(validatedModelChoices.length > 0
      ? [
          new Separator(promptSeparator(" ────────────── tested ")),
          ...validatedModelChoices,
        ]
      : []),
    ...(unvalidatedModelChoices.length > 0
      ? [
          new Separator(promptSeparator(" ────────────── untested ")),
          ...unvalidatedModelChoices,
        ]
      : []),
  ];

  const answer = (await search({
    message: promptMessage("Select model:"),
    source: async (input): Promise<ModelChoices> => {
      //  Search models.
      const search = (models: ModelChoices, search: string) =>
        models.filter((m) => {
          const name = (m as ModelChoice)?.name;
          if (name) {
            return name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
          } else {
            return false;
          }
        });

      if (!input) {
        //  We have no input, so return all of the choices.
        return choices;
      }

      //  If we have the 'keep existing' option (only set if we have a default)
      //  and the 'free entry' option, we don't need to show anything else.
      if (
        (defaultModel && choices.length === 2) ||
        (!defaultModel && choices.length) === 1
      ) {
        return choices;
      }

      //  However, if we have zero or multiple choices, then we show an
      //  _exact_ choice as the first option - essentially allowing free
      //  text entry.
      const freeTextEntry = {
        name: promptChoice(input, { tag: "FREE" }),
        value: input,
        description: promptDescription(`Custom model: ${input}`),
        disabled: false,
      };
      return search([freeTextEntry, ...choices], input);
    },
    validate: () => true,
  })) as string;

  //  If we selected the 'keep existing' model we return the default.
  return answer === keepExisting.value ? `${defaultModel || ""}` : answer;
}
