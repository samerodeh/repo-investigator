import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const safeCommands = {
  "npm test": ["test"],
  "npm run build": ["run", "build"],
  "npm run lint": ["run", "lint"],
} as const;

export type SafeCommand = keyof typeof safeCommands;

export interface CommandResult {
  command: SafeCommand;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runCommand(
  repoPath: string,
  command: SafeCommand,
): Promise<CommandResult> {
  const args = safeCommands[command];
  if (!args) {
    throw new Error(`Command is not allowed: ${command}`);
  }

  const executable = process.platform === "win32" ? "npm.cmd" : "npm";

  try {
    const { stdout, stderr } = await execFileAsync(executable, [...args], {
      cwd: repoPath,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { command, stdout, stderr, exitCode: 0 };
  } catch (error) {
    const commandError = error as {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
    return {
      command,
      stdout: commandError.stdout ?? "",
      stderr: commandError.stderr ?? "",
      exitCode: commandError.code ?? 1,
    };
  }
}
