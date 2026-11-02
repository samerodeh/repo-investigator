import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getPackageInfo } from "../../tools/getPackageInfo.js";

describe("getPackageInfo", () => {
  it("reads package metadata and dependency sections", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      await fs.writeFile(
        path.join(repoPath, "package.json"),
        JSON.stringify({
          name: "fixture",
          type: "module",
          scripts: { test: "vitest" },
          dependencies: { zod: "^4.0.0" },
          devDependencies: { typescript: "^5.0.0" },
        }),
      );

      await expect(getPackageInfo(repoPath)).resolves.toEqual({
        name: "fixture",
        type: "module",
        scripts: { test: "vitest" },
        dependencies: { zod: "^4.0.0" },
        devDependencies: { typescript: "^5.0.0" },
      });
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
