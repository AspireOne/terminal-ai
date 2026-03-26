import fs from "fs";
import os from "os";
import path from "path";
import { collectCommitContext } from "./collect-commit-context";

describe("commands/commit/collect-commit-context", () => {
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-commit-context-"));
  });

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  test("collects top-level and one-level-deep docs in deterministic order", () => {
    fs.writeFileSync(path.join(tempRoot, "README.md"), "root readme");
    fs.writeFileSync(path.join(tempRoot, "AGENTS.md"), "root agents");
    fs.mkdirSync(path.join(tempRoot, "zeta"));
    fs.mkdirSync(path.join(tempRoot, "alpha"));
    fs.mkdirSync(path.join(tempRoot, "alpha", "nested"));
    fs.writeFileSync(path.join(tempRoot, "alpha", "README.md"), "alpha readme");
    fs.writeFileSync(path.join(tempRoot, "zeta", "AGENTS.md"), "zeta agents");
    fs.writeFileSync(
      path.join(tempRoot, "alpha", "nested", "README.md"),
      "too deep",
    );

    expect(collectCommitContext(tempRoot)).toEqual([
      {
        path: "./AGENTS.md",
        content: "root agents",
      },
      {
        path: "./README.md",
        content: "root readme",
      },
      {
        path: "alpha/README.md",
        content: "alpha readme",
      },
      {
        path: "zeta/AGENTS.md",
        content: "zeta agents",
      },
    ]);
  });

  test("returns an empty list when no matching docs are found", () => {
    fs.mkdirSync(path.join(tempRoot, "src"));
    fs.writeFileSync(path.join(tempRoot, "src", "notes.md"), "ignore");

    expect(collectCommitContext(tempRoot)).toEqual([]);
  });
});
