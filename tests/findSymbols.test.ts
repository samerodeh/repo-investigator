import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { findSymbols } from "../tools/findSymbols.js";

describe("findSymbols", () => {
  it("finds exported functions, classes, interfaces, and types with line numbers", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      const source = [
        "export function run() {}",
        "export class Worker {}",
        "export interface Config {}",
        "export type Result = string;",
      ].join("\n");
      await fs.writeFile(path.join(repoPath, "symbols.ts"), source);

      await expect(findSymbols(repoPath)).resolves.toEqual([
        {
          filePath: path.join(repoPath, "symbols.ts"),
          line: 1,
          kind: "function",
          name: "run",
        },
        {
          filePath: path.join(repoPath, "symbols.ts"),
          line: 2,
          kind: "class",
          name: "Worker",
        },
        {
          filePath: path.join(repoPath, "symbols.ts"),
          line: 3,
          kind: "interface",
          name: "Config",
        },
        {
          filePath: path.join(repoPath, "symbols.ts"),
          line: 4,
          kind: "type",
          name: "Result",
        },
      ]);
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
