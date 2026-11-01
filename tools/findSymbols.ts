import fs from "node:fs/promises";
import path from "node:path";

export interface SymbolMatch {
  filePath: string;
  line: number;
  kind: "function" | "class" | "interface" | "type";
  name: string;
}

const ignoredEntries = new Set([".git", "node_modules", "dist"]);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const symbolPattern =
  /^\s*export\s+(?:async\s+)?(function|class|interface|type)\s+([A-Za-z_$][\w$]*)/;

export async function findSymbols(repoPath: string): Promise<SymbolMatch[]> {
  const results: SymbolMatch[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoredEntries.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }

      if (!sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
        continue;
      }

      const contents = await fs.readFile(fullPath, "utf8");
      contents.split(/\r?\n/).forEach((line, index) => {
        const match = line.match(symbolPattern);
        if (match) {
          const kind = match[1];
          const name = match[2];
          if (!kind || !name) {
            return;
          }

          results.push({
            filePath: fullPath,
            line: index + 1,
            kind: kind as SymbolMatch["kind"],
            name,
          });
        }
      });
    }
  }

  await visit(path.resolve(repoPath));
  return results;
}
