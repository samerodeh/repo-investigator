import { describe, expect, it } from "vitest";
import { runCommand } from "../tools/runCommand.js";

describe("runCommand", () => {
  it("runs an allowed build command and returns its result", async () => {
    const result = await runCommand(process.cwd(), "npm run build");

    expect(result.command).toBe("npm run build");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("tsc");
  });

  it("returns a nonzero result for an allowed command that fails", async () => {
    const result = await runCommand(process.cwd(), "npm run lint");

    expect(result.command).toBe("npm run lint");
    expect(result.exitCode).not.toBe(0);
  });
});
