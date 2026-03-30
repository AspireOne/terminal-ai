import { confirm, select } from "@inquirer/prompts";
import { inputPrompt } from "../../theme";
import { ExecutionContext } from "../../execution-context/execution-context";
import { Commands } from "../commands";
import { check } from "../../commands/check/check";
import { initUpdateProviders } from "./init-update-providers";
import { selectProvider } from "../../ui/select-provider";
import { updateConfigurationFile } from "../../configuration/update-configuration-file";
import { selectModel } from "./select/select-model";
import {
  promptChoice,
  promptDescription,
  promptMessage,
} from "../../ui/prompt-styles";

export async function initRegularRun(
  executionContext: ExecutionContext,
): Promise<Commands> {
  let mainOption = "";

  // Create a loop to return to the main menu after actions
  while (mainOption !== "exit" && mainOption !== "chat") {
    // Start with a select menu for the main options
    mainOption = await select({
      message: inputPrompt("Terminal AI Configuration"),
      choices: [
        {
          name: promptChoice("Select current provider / model", { tag: "SET" }),
          value: "select_provider",
          description: promptDescription(
            "Choose the active provider and model.",
          ),
        },
        {
          name: promptChoice("Configure or add provider", { tag: "EDIT" }),
          value: "reconfigure_provider",
          description: promptDescription(
            "Update an existing provider or add a new one.",
          ),
        },
        {
          name: promptChoice("Check configuration", { tag: "CHECK" }),
          value: "check",
          description: promptDescription(
            "Validate connectivity, API key, and model setup.",
          ),
        },
        {
          name: promptChoice("Chat", { tag: "CHAT" }),
          value: "chat",
          description: promptDescription(
            "Start chatting with the current model.",
          ),
        },
        {
          name: promptChoice("Exit", { tag: "EXIT" }),
          value: "exit",
          description: promptDescription(
            "Leave configuration without chatting.",
          ),
        },
      ],
    });

    if (mainOption === "exit") {
      return Commands.Quit;
    }

    if (mainOption === "chat") {
      return Commands.Chat;
    }

    if (mainOption === "check") {
      await check(executionContext);
      continue; // skip the 'check configuration' question
    }

    if (mainOption === "select_provider") {
      // Select provider/model functionality
      const providers = Object.values(executionContext.config.providers);
      if (providers.length > 0) {
        const selectedProvider = await selectProvider({
          message: "Current Provider:",
          currentProvider: executionContext.provider,
          availableProviders: providers,
          default: executionContext.provider.name,
        });

        if (
          selectedProvider &&
          selectedProvider.name !== executionContext.provider.name
        ) {
          executionContext.provider = selectedProvider;
          updateConfigurationFile(executionContext.configFilePath, {
            provider: selectedProvider.name,
          });
        }

        // Now allow selecting a model for the chosen provider
        const provider = executionContext.provider;
        const model = await selectModel(provider.model, provider.type);

        if (model && model !== provider.model) {
          provider.model = model;

          // Save the model. It's either a named provider or the root provider.
          if (provider.name !== "") {
            updateConfigurationFile(executionContext.configFilePath, {
              [`providers.${provider.name}.model`]: model,
            });
          } else {
            updateConfigurationFile(executionContext.configFilePath, {
              [`model`]: model,
            });
          }
        }
      } else {
        console.log("No providers configured. Use option 2 to add a provider.");
      }
    } else if (mainOption === "reconfigure_provider") {
      // Configure provider functionality
      await initUpdateProviders(executionContext);
    }

    // Offer to validate configuration
    if (mainOption !== "exit" && mainOption !== "chat") {
      const validate = await confirm({
        message: promptMessage("Test API Key & Configuration?"),
        default: false,
      });
      if (validate) {
        await check(executionContext);
      }
    }
  }

  // This point is reached if chat was selected
  return Commands.Chat;
}
