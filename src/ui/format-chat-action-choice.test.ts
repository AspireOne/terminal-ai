import { formatChatActionChoice } from "./format-chat-action-choice";
import { ChatAction } from "../chat-actions/ChatAction";
import { promptChoice, promptDescription } from "./prompt-styles";

describe("ui", () => {
  describe("formatChatActionChoice", () => {
    const action: ChatAction = {
      id: "reply",
      displayNameInitial: "Chat",
      displayNameReply: "Reply",
      menuTag: "CHAT",
      descriptionInitial: "Start a new prompt in the current terminal view.",
      descriptionReply: "Send another message and continue the conversation.",
      isInitialInteractionAction: true,
      isDebugAction: false,
      weight: 1,
      execute: async () => undefined,
    };

    it("should format an initial action with a beige tag and description", () => {
      expect(formatChatActionChoice(action, true)).toEqual({
        name: promptChoice("Chat", { tag: "CHAT" }),
        value: "reply",
        description: promptDescription(
          "Start a new prompt in the current terminal view.",
        ),
        short: "Chat",
      });
    });

    it("should format a reply action with reply metadata", () => {
      expect(formatChatActionChoice(action, false)).toEqual({
        name: promptChoice("Reply", { tag: "CHAT" }),
        value: "reply",
        description: promptDescription(
          "Send another message and continue the conversation.",
        ),
        short: "Reply",
      });
    });
  });
});
