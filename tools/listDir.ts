import fs from "node:fs/promises";
import path from "node:path";

const ignoredEntries = new Set([".git", "node_modules", "dist"]);

export async function listDir(
  repoPath: string,
  directoryPath: string = repoPath,
): Promise<string[]> {
  const absoluteRepoPath = path.resolve(repoPath);
  const absoluteDirectoryPath = path.resolve(directoryPath);
  const relativePath = path.relative(
    absoluteRepoPath,
    absoluteDirectoryPath,
  );

  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("Directory is outside the repository");
  }

  const entries = await fs.readdir(absoluteDirectoryPath, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => !ignoredEntries.has(entry.name))
    .map((entry) => path.join(absoluteDirectoryPath, entry.name));
}
