import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { searchRepo } from "../../tools/searchRepo.js";

const temporaryDirectories: string[] = [];

async function createFixture() {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "repo-investigator-"),
  );
  temporaryDirectories.push(directory);
  await fs.mkdir(path.join(directory, "src"));
  await fs.mkdir(path.join(directory, "node_modules"));
  await fs.mkdir(path.join(directory, "dist"));
  await fs.writeFile(
    path.join(directory, "src", "auth.ts"),
    "export const JWT = true;",
  );
  await fs.writeFile(path.join(directory, "node_modules", "ignored.ts"), "JWT");
  await fs.writeFile(path.join(directory, "dist", "ignored.ts"), "JWT");
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("searchRepo", () => {
  it("finds content recursively and ignores generated directories", async () => {
    const repoPath = await createFixture();

    await expect(searchRepo(repoPath, "jwt")).resolves.toEqual([
      path.join(repoPath, "src", "auth.ts"),
    ]);
  });

  it("searches case-insensitively", async () => {
    const repoPath = await createFixture();

    await expect(searchRepo(repoPath, "jWt")).resolves.toHaveLength(1);
  });
});
