import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitStatus {
  branch: string;
  changes: string[];
}

export async function getGitStatus(repoPath: string): Promise<GitStatus> {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--short", "--branch"],
    { cwd: repoPath },
  );
  const lines = stdout.trimEnd().split(/\r?\n/);
  const branch = lines[0] ?? "";

  return {
    branch,
    changes: lines.slice(1).filter(Boolean),
  };
}
