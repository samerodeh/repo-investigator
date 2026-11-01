import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getGitHistory(
  repoPath: string,
  limit = 10,
): Promise<string[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("History limit must be a positive integer");
  }

  const { stdout } = await execFileAsync(
    "git",
    ["log", `-${limit}`, "--oneline", "--decorate"],
    { cwd: repoPath },
  );
  return stdout.trimEnd().split(/\r?\n/).filter(Boolean);
}
