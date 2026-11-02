import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { findConfigFiles } from "../tools/findConfigFiles.js";

describe("findConfigFiles", () => {
  it("finds recognized config files recursively and skips ignored directories", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      await fs.mkdir(path.join(repoPath, "config"));
      await fs.mkdir(path.join(repoPath, "node_modules"));
      await fs.writeFile(path.join(repoPath, "tsconfig.json"), "{}");
      await fs.writeFile(path.join(repoPath, "config", "Dockerfile"), "");
      await fs.writeFile(path.join(repoPath, "node_modules", "package.json"), "{}");

      const results = await findConfigFiles(repoPath);

      expect(results).toEqual(
        expect.arrayContaining([
          path.join(repoPath, "tsconfig.json"),
          path.join(repoPath, "config", "Dockerfile"),
        ]),
      );
      expect(results).not.toContain(
        path.join(repoPath, "node_modules", "package.json"),
      );
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
