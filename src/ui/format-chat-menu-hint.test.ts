import { formatChatMenuHint } from "./format-chat-menu-hint";
import { ProviderConfiguration } from "../configuration/configuration";
import { richBeige, softBeige, warmBeige } from "../theme";
describe("ui", () => {
  describe("chatMenuHint", () => {
    it("should show 'actions' by default", () => {
      const hint = formatChatMenuHint(80);
      expect(hint).toBe(richBeige("<Enter> Menu"));
    });

    it("should show the model only for a root provider in warm text", () => {
      const provider: ProviderConfiguration = {
        name: "", // i.e. root
        apiKey: "",
        model: "gpt-4.5-preview",
        baseURL: "",
      };
      const hint = formatChatMenuHint(80, provider);
      expect(hint).toBe(
        `${richBeige("<Enter> Menu")}${softBeige("                                                     ")}${warmBeige("gpt-4.5-preview")}`,
      );
    });

    it("should show the model and provider name with no space after colon and warm accents", () => {
      const provider: ProviderConfiguration = {
        name: "openai",
        apiKey: "",
        model: "gpt-4.5-preview",
        baseURL: "",
      };
      const hint = formatChatMenuHint(80, provider);
      expect(hint).toBe(
        `${richBeige("<Enter> Menu")}${softBeige("                                              ")}${softBeige("openai:")}${warmBeige("gpt-4.5-preview")}`,
      );
    });

    it("should trim the provider details if needed", () => {
      const provider: ProviderConfiguration = {
        name: "openai",
        apiKey: "",
        model: "gpt-4.5-preview",
        baseURL: "",
      };
      const hint = formatChatMenuHint(20, provider);
      expect(hint).toBe(
        `${richBeige("<Enter> Menu")}${softBeige("     ")}${softBeige("...")}`,
      );
    });
  });
});
