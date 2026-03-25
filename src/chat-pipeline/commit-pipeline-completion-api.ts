import OpenAI from "openai";
import { ChatPipelineParameters } from "./ChatPipelineParameters";
import { buildContext } from "./stages/build-context";
import { getCompletionsResponse } from "./stages/get-response";
import { loadAndAppendInputFiles } from "./stages/load-and-append-input-files";

export async function executeCommitPipeline(
  parameters: ChatPipelineParameters,
  systemPrompt: string,
): Promise<string> {
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

  chatContext.messages.push({
    role: "system",
    content: systemPrompt,
  });
  chatContext.messages.push({
    role: "user",
    content: parameters.inputMessage || "",
  });

  return getCompletionsResponse(params, openai, chatContext.messages);
}
