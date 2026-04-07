import { jest } from "@jest/globals";
import OpenAI from "openai";
import { createTestExecutionContext } from "../../execution-context/create-test-execution-context";
import { initialChatContext } from "../ChatContext";
import { ChatPipelineParameters } from "../ChatPipelineParameters";
import { getCompletionsResponse } from "./get-response";

describe("getCompletionsResponse", () => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: "hello",
    },
  ];

  function createParams(
    think: boolean,
    providerType?: "openai" | "gemini_openai" | "openai_compatible",
  ): ChatPipelineParameters {
    return {
      chatContext: initialChatContext(),
      inputMessage: "hello",
      options: {
        copy: false,
        raw: false,
        think,
        enableContextPrompts: true,
        enableOutputPrompts: true,
      },
      executionContext: createTestExecutionContext(process, {
        isTTYstdout: false,
        provider: {
          name: "test",
          apiKey: "test",
          baseURL: "https://api.openai.com/v1/",
          model: "gpt-4.1",
          type: providerType,
        },
      }),
    };
  }

  it("sends high reasoning effort when thinking is enabled", async () => {
    const create = jest
      .fn<
        (
          _: OpenAI.Chat.Completions.ChatCompletionCreateParams,
        ) => Promise<{ choices: [{ message: { content: string } }] }>
      >()
      .mockResolvedValue({
        choices: [{ message: { content: "ok" } }],
      });
    const openai = {
      chat: {
        completions: {
          create,
        },
      },
    } as unknown as OpenAI;

    await getCompletionsResponse(
      createParams(true, "openai"),
      openai,
      messages,
    );

    expect(create).toHaveBeenCalledWith({
      messages,
      model: "gpt-4.1",
      reasoning_effort: "high",
    });
  });

  it("does not send reasoning effort for unsupported provider types", async () => {
    const create = jest
      .fn<
        (
          _: OpenAI.Chat.Completions.ChatCompletionCreateParams,
        ) => Promise<{ choices: [{ message: { content: string } }] }>
      >()
      .mockResolvedValue({
        choices: [{ message: { content: "ok" } }],
      });
    const openai = {
      chat: {
        completions: {
          create,
        },
      },
    } as unknown as OpenAI;

    await getCompletionsResponse(
      createParams(true, "gemini_openai"),
      openai,
      messages,
    );

    expect(create).toHaveBeenCalledWith({
      messages,
      model: "gpt-4.1",
    });
  });
});
