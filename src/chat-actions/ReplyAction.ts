import { ChatAction } from "./ChatAction";

export const ReplyAction: ChatAction = {
  id: "reply",
  displayNameInitial: "Chat",
  displayNameReply: "Reply",
  menuTag: "CHAT",
  descriptionInitial: "Start a new prompt in the current terminal view.",
  descriptionReply: "Send another message and continue the conversation.",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 1,
  execute: async (): Promise<string | undefined> => undefined,
};
