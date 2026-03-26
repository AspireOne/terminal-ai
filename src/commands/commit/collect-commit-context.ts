import fs from "fs";
import path from "path";

export type CommitContextFile = {
  path: string;
  content: string;
};

const SUPPORTED_FILE_NAMES = ["AGENTS.md", "README.md"] as const;

function collectFromDirectory(
  rootDirectory: string,
  relativeDirectory: string,
): CommitContextFile[] {
  const directoryPath = path.join(rootDirectory, relativeDirectory);

  return SUPPORTED_FILE_NAMES.flatMap((fileName) => {
    const filePath = path.join(directoryPath, fileName);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return [];
    }

    const relativePath =
      relativeDirectory === ""
        ? `./${fileName}`
        : path.posix.join(relativeDirectory, fileName);

    return [
      {
        path: relativePath,
        content: fs.readFileSync(filePath, "utf8"),
      },
    ];
  });
}

export function collectCommitContext(
  rootDirectory: string,
): CommitContextFile[] {
  const childDirectories = fs
    .readdirSync(rootDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return [
    ...collectFromDirectory(rootDirectory, ""),
    ...childDirectories.flatMap((directoryName) =>
      collectFromDirectory(rootDirectory, directoryName),
    ),
  ];
}
