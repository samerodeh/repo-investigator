import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getGitHistory } from "../../tools/getGitHistory.js";

const execFileAsync = promisify(execFile);

describe("getGitHistory", () => {
  it("returns the requested number of recent commits", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      await execFileAsync("git", ["init", "-b", "main"], { cwd: repoPath });
      for (const message of ["first", "second", "third"]) {
        await fs.writeFile(path.join(repoPath, `${message}.txt`), message);
        await execFileAsync("git", ["add", "."], { cwd: repoPath });
        await execFileAsync(
          "git",
          [
            "-c",
            "user.name=Test User",
            "-c",
            "user.email=test@example.com",
            "commit",
            "-m",
            message,
          ],
          { cwd: repoPath },
        );
      }

      await expect(getGitHistory(repoPath, 2)).resolves.toHaveLength(2);
      await expect(getGitHistory(repoPath, 0)).rejects.toThrow(
        "History limit must be a positive integer",
      );
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
