import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { findTests } from "../tools/findTests.js";

describe("findTests", () => {
  it("finds test and spec files recursively while skipping ignored directories", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      await fs.mkdir(path.join(repoPath, "src"));
      await fs.mkdir(path.join(repoPath, "dist"));
      await fs.writeFile(path.join(repoPath, "src", "app.test.ts"), "");
      await fs.writeFile(path.join(repoPath, "src", "app.spec.ts"), "");
      await fs.writeFile(path.join(repoPath, "dist", "built.test.js"), "");
      await fs.writeFile(path.join(repoPath, "src", "README.md"), "");

      const results = await findTests(repoPath);

      expect(results).toEqual(
        expect.arrayContaining([
          path.join(repoPath, "src", "app.test.ts"),
          path.join(repoPath, "src", "app.spec.ts"),
        ]),
      );
      expect(results).not.toContain(
        path.join(repoPath, "dist", "built.test.js"),
      );
      expect(results).not.toContain(path.join(repoPath, "src", "README.md"));
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
