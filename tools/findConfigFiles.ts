import fs from "node:fs/promises";
import path from "node:path";

const ignoredEntries = new Set([".git", "node_modules", "dist"]);

function isConfigFile(name: string): boolean {
  const lowerName = name.toLowerCase();
  return (
    lowerName === "tsconfig.json" ||
    lowerName === "package.json" ||
    lowerName === ".env.example" ||
    lowerName.startsWith(".eslintrc") ||
    lowerName.startsWith(".prettierrc") ||
    lowerName.startsWith("dockerfile") ||
    lowerName === "docker-compose.yml" ||
    lowerName === "docker-compose.yaml" ||
    lowerName.startsWith(".github")
  );
}

export async function findConfigFiles(repoPath: string): Promise<string[]> {
  const results: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoredEntries.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(directory, entry.name);
      if (isConfigFile(entry.name)) {
        results.push(fullPath);
      }

      if (entry.isDirectory()) {
        await visit(fullPath);
      }
    }
  }

  await visit(path.resolve(repoPath));
  return results;
}
