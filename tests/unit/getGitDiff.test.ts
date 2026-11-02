import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getGitDiff } from "../tools/getGitDiff.js";

const execFileAsync = promisify(execFile);

describe("getGitDiff", () => {
  it("returns changes between Git revisions", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-"),
    );

    try {
      await execFileAsync("git", ["init", "-b", "main"], { cwd: repoPath });
      await fs.writeFile(path.join(repoPath, "file.txt"), "before");
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
          "initial",
        ],
        { cwd: repoPath },
      );
      const firstCommit = (
        await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: repoPath })
      ).stdout.trim();

      await fs.writeFile(path.join(repoPath, "file.txt"), "after");
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
          "second",
        ],
        { cwd: repoPath },
      );
      const secondCommit = (
        await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: repoPath })
      ).stdout.trim();

      const diff = await getGitDiff(repoPath, firstCommit, secondCommit);

      expect(diff).toContain("-before");
      expect(diff).toContain("+after");
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
