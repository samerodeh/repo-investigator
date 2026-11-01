import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getGitDiff(
  repoPath: string,
  from?: string,
  to?: string,
): Promise<string> {
  const revisions = [from, to].filter(
    (revision): revision is string => revision !== undefined,
  );
  const { stdout } = await execFileAsync(
    "git",
    ["diff", ...revisions],
    { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 },
  );
  return stdout;
}
