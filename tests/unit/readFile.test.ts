import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readFile } from "../tools/readFile.js";

const temporaryDirectories: string[] = [];

async function createFixture() {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "repo-investigator-"),
  );
  temporaryDirectories.push(directory);
  await fs.writeFile(path.join(directory, "example.ts"), "export const value = 42;");
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("readFile", () => {
  it("reads a file inside the repository", async () => {
    const repoPath = await createFixture();

    await expect(
      readFile(repoPath, path.join(repoPath, "example.ts")),
    ).resolves.toBe("export const value = 42;");
  });

  it("rejects a file outside the repository", async () => {
    const repoPath = await createFixture();
    const outsidePath = path.join(path.dirname(repoPath), "outside.txt");

    await expect(readFile(repoPath, outsidePath)).rejects.toThrow(
      "File is outside the repository",
    );
  });
});
