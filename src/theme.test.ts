import { createSpinnerOptions, softBeige, warmBeige } from "./theme";

describe("theme", () => {
  describe("createSpinnerOptions", () => {
    it("renders a spinner without label text by default", () => {
      expect(createSpinnerOptions()).toEqual({
        text: "",
        color: "white",
        prefixText: "",
        spinner: {
          interval: 90,
          frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙●∙"],
        },
      });
    });

    it("renders the prefix and label when spinner text is provided", () => {
      expect(createSpinnerOptions("Checking API key...")).toEqual({
        text: warmBeige("Checking API key..."),
        color: "white",
        prefixText: softBeige("··"),
        spinner: {
          interval: 90,
          frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙●∙"],
        },
      });
    });
  });
});
