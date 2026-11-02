import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { analyzeDependencies } from "../../tools/analyzeDependencies.js";

describe("analyzeDependencies", () => {
  it("separates dependency groups and identifies known frameworks", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      await fs.writeFile(
        path.join(repoPath, "package.json"),
        JSON.stringify({
          dependencies: {
            "@langchain/core": "^1.0.0",
            zod: "^4.0.0",
          },
          devDependencies: {
            vitest: "^4.0.0",
          },
        }),
      );

      await expect(analyzeDependencies(repoPath)).resolves.toEqual({
        runtime: {
          "@langchain/core": "^1.0.0",
          zod: "^4.0.0",
        },
        development: {
          vitest: "^4.0.0",
        },
        frameworks: ["LangChain", "Zod"],
      });
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
