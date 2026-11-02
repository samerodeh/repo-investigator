import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getGitStatus } from "../../tools/getGitStatus.js";

const execFileAsync = promisify(execFile);

describe("getGitStatus", () => {
  it("reports the branch and working tree changes", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      await execFileAsync("git", ["init", "-b", "main"], { cwd: repoPath });
      await fs.writeFile(path.join(repoPath, "tracked.txt"), "tracked");
      await execFileAsync("git", ["add", "tracked.txt"], { cwd: repoPath });
      await execFileAsync(
        "git",
        [
          "-c",
          "user.name=Test User",
          "-c",
          "user.email=test@example.com",
          "commit",
          "-m",
          "initial",
        ],
        { cwd: repoPath },
      );
      await fs.writeFile(path.join(repoPath, "untracked.txt"), "untracked");

      const result = await getGitStatus(repoPath);

      expect(result.branch).toContain("## main");
      expect(result.changes).toContain("?? untracked.txt");
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
