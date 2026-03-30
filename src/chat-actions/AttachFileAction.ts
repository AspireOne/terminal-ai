import { select } from "@inquirer/prompts";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatAction } from "./ChatAction";
import { ErrorCode, TerminalAIError } from "../lib/errors";
import {
  promptChoice,
  promptDescription,
  promptMessage,
} from "../ui/prompt-styles";

export const AttachFileAction: ChatAction = {
  id: "attach_file",
  displayNameInitial: "Attach File",
  displayNameReply: "Attach File",
  menuTag: "FILE",
  descriptionInitial: "Add a document or image to the next message.",
  descriptionReply: "Attach more context before you continue.",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 0,
  execute: async (
    params: ChatPipelineParameters,
  ): Promise<string | undefined> => {
    const fileSelector = (await import("inquirer-file-selector")).default;
    const path = await fileSelector({
      message: promptMessage("File path:"),
      type: "file",
    });
    const fileType = await select({
      message: promptMessage("File processing mode:"),
      choices: [
        {
          name: promptChoice("Text", { tag: "TEXT" }),
          value: "text",
          description: promptDescription(
            "Process as text. Ideal for code, documents, etc.",
          ),
        },
        {
          name: promptChoice("Image", { tag: "VISION" }),
          value: "image",
          description: promptDescription(
            "Vision processing (model dependent). Enables image recognition, etc.",
          ),
        },
      ],
    });
    if (fileType === "text") {
      params.chatContext.filePathsOutbox.push(path);
    } else if (fileType === "image") {
      params.chatContext.imageFilePathsOutbox.push(path);
    } else {
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        "unknown file processing '${fileType}'",
      );
    }

    return undefined;
  },
};
