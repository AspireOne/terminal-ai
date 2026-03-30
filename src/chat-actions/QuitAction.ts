import { ChatAction } from "./ChatAction";

export const QuitAction: ChatAction = {
  id: "quit",
  displayNameInitial: "Quit",
  displayNameReply: "Quit",
  menuTag: "EXIT",
  descriptionInitial: "Leave Terminal AI without starting a chat.",
  descriptionReply: "Close the current Terminal AI session.",
  isInitialInteractionAction: true,
  isDebugAction: false,
  weight: 1,
  execute: async () => {
    process.exit(0);
  },
};
