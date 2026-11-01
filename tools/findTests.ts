import fs from "node:fs/promises";
import path from "node:path";

const ignoredEntries = new Set([".git", "node_modules", "dist"]);

function isTestFile(name: string): boolean {
  return /\.(test|spec)\.[cm]?[jt]sx?$/.test(name);
}

export async function findTests(repoPath: string): Promise<string[]> {
  const results: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoredEntries.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (isTestFile(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  await visit(path.resolve(repoPath));
  return results;
}
