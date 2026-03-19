import OpenAI from "openai";
import { parseResponse, ChatResponse } from "./stages/parse-response";
import { ChatPipelineParameters } from "./ChatPipelineParameters";
import { buildContext } from "./stages/build-context";
import { buildExecuteOutputContext } from "./stages/build-execute-output-context";
import { getCompletionsResponse } from "./stages/get-response";
import { getProviderPrompt } from "../providers/get-provider-prompt";
import { loadAndAppendInputFiles } from "./stages/load-and-append-input-files";

export async function executeExecutePipeline(
  parameters: ChatPipelineParameters,
): Promise<ChatResponse> {
  const { executionContext, chatContext } = parameters;
  const config = executionContext.config;
  const params = { ...parameters, config };
  const openai = new OpenAI({
    apiKey: executionContext.provider.apiKey,
    baseURL: executionContext.provider.baseURL,
  });

  const contextPrompts = await buildContext(params, process.env);
  chatContext.messages.push(
    ...contextPrompts.map((context) => ({
      role: context.role,
      content: context.context,
    })),
  );

  await loadAndAppendInputFiles(
    params.chatContext,
    executionContext.process.stdin,
    params.executionContext.isTTYstdout,
  );

  const outputPrompts = await buildExecuteOutputContext(params, process.env);
  chatContext.messages.push(
    ...outputPrompts.map((prompt) => ({
      role: prompt.role,
      content: prompt.context,
    })),
  );

  chatContext.messages.push({
    role: "user",
    content: parameters.inputMessage || "",
  });

  const rawMarkdownResponse = await getCompletionsResponse(
    params,
    openai,
    chatContext.messages,
  );

  return parseResponse(
    getProviderPrompt(parameters.executionContext.provider),
    rawMarkdownResponse,
  );
}
