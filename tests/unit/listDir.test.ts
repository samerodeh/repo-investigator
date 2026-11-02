import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { listDir } from "../../tools/listDir.js";

const temporaryDirectories: string[] = [];

async function createFixture() {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "repo-investigator-"),
  );
  temporaryDirectories.push(directory);
  await fs.mkdir(path.join(directory, "src"));
  await fs.mkdir(path.join(directory, "node_modules"));
  await fs.writeFile(path.join(directory, "README.md"), "");
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("listDir", () => {
  it("lists immediate repository entries and skips ignored directories", async () => {
    const repoPath = await createFixture();

    await expect(listDir(repoPath)).resolves.toEqual(
      expect.arrayContaining([
        path.join(repoPath, "README.md"),
        path.join(repoPath, "src"),
      ]),
    );
    await expect(listDir(repoPath)).resolves.not.toContain(
      path.join(repoPath, "node_modules"),
    );
  });

  it("rejects directories outside the repository", async () => {
    const repoPath = await createFixture();
    const outsidePath = path.dirname(repoPath);

    await expect(listDir(repoPath, outsidePath)).rejects.toThrow(
      "Directory is outside the repository",
    );
  });
});
