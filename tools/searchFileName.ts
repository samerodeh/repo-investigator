import fs from "node:fs/promises";
import path from "node:path";

export async function searchFileName(
  repoPath: string,
  query: string,
): Promise<string[]> {
  const results: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (
        entry.name === ".git" ||
        entry.name === "node_modules" ||
        entry.name === "dist"
      ) {
        continue;
      }

      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push(fullPath);
      }
    }
  }

  await visit(path.resolve(repoPath));
  return results;
}