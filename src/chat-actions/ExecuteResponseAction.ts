import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { confirm, editor } from "@inquirer/prompts";
import { ChatPipelineParameters } from "../chat-pipeline/ChatPipelineParameters";
import { ChatResponse } from "../chat-pipeline/stages/parse-response";
import { ChatAction } from "./ChatAction";
import { execCommand } from "../lib/cli-helpers";
import { ErrorCode, TerminalAIError } from "../lib/errors";
import { getScriptPostfix } from "../lib/shell";
import { promptMessage } from "../ui/prompt-styles";

export const ExecuteResponseAction: ChatAction = {
  id: "execute_response",
  displayNameInitial: "Execute Response",
  displayNameReply: "Execute Response",
  menuTag: "RUN",
  descriptionReply: "Review and run the latest generated script.",
  isInitialInteractionAction: false,
  isDebugAction: false,
  weight: 1,
  execute: async (
    params: ChatPipelineParameters,
    __: ChatCompletionMessageParam[],
    response?: ChatResponse,
  ): Promise<string | undefined> => {
    if (response === undefined) {
      throw new TerminalAIError(
        ErrorCode.InvalidOperation,
        `a response must be provided to the 'execute' action`,
      );
    }
    const code = await editor({
      message: promptMessage("Verify your script - AI can make mistakes!"),
      default: response.codeBlocks[0]?.plainTextCode,
      postfix: getScriptPostfix(params.executionContext.process.env),
    });
    const validate = await confirm({
      message: promptMessage("Are you sure you want to execute this code?"),
      default: false,
    });
    if (validate) {
      await execCommand(code, true, params.executionContext.process.env);
    }

    return undefined;
  },
};
