import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { searchFileName } from "../../tools/searchFileName.js";

const temporaryDirectories: string[] = [];

async function createFixture() {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "repo-investigator-"),
  );
  temporaryDirectories.push(directory);
  await fs.mkdir(path.join(directory, "nested"));
  await fs.writeFile(path.join(directory, "readFile.test.ts"), "");
  await fs.writeFile(
    path.join(directory, "nested", "searchRepo.test.ts"),
    "",
  );
  await fs.writeFile(path.join(directory, "nested", "README.md"), "");
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("searchFileName", () => {
  it("finds matching file names recursively", async () => {
    const repoPath = await createFixture();

    const results = await searchFileName(repoPath, "TEST");

    expect(results).toHaveLength(2);
    expect(results).toEqual(
      expect.arrayContaining([
        path.join(repoPath, "readFile.test.ts"),
        path.join(repoPath, "nested", "searchRepo.test.ts"),
      ]),
    );
  });

  it("does not return non-matching file names", async () => {
    const repoPath = await createFixture();

    await expect(searchFileName(repoPath, "spec")).resolves.toEqual([]);
  });
});
