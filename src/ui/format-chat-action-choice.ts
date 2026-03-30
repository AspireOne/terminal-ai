import { ChatAction } from "../chat-actions/ChatAction";
import { Choice } from "../lib/inquirerjs/choice";
import { promptChoice, promptDescription } from "./prompt-styles";

export function formatChatActionChoice(
  action: ChatAction,
  initialInputActions: boolean,
): Choice<string> {
  return {
    name: promptChoice(
      initialInputActions ? action.displayNameInitial : action.displayNameReply,
      {
        tag: action.menuTag,
      },
    ),
    value: action.id,
    description: (() => {
      const description = initialInputActions
        ? action.descriptionInitial
        : action.descriptionReply;
      return description ? promptDescription(description) : "";
    })(),
    short: initialInputActions
      ? action.displayNameInitial
      : action.displayNameReply,
  };
}
