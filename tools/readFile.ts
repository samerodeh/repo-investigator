import fs from "node:fs/promises";
import path from "node:path";

export async function readFile(
  repoPath: string,
  filePath: string,
): Promise<string> {
  // Normalize both paths before checking the repository boundary.
  const absoluteRepoPath = path.resolve(repoPath);
  const absoluteFilePath = path.resolve(filePath);

  // Calculate the file's location relative to the repository root.
  const relativePath = path.relative(
    absoluteRepoPath,
    absoluteFilePath,
  );

  // Prevent reading files outside the selected repository.
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("File is outside the repository");
  }

  // Read and return the selected file as UTF-8 text.
  return await fs.readFile(absoluteFilePath, "utf8");
}