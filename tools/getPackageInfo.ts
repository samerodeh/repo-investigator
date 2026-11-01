import fs from "node:fs/promises";
import path from "node:path";

export interface PackageInfo {
  name?: string;
  version?: string;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function getPackageInfo(repoPath: string): Promise<PackageInfo> {
  const packagePath = path.join(path.resolve(repoPath), "package.json");
  const contents = await fs.readFile(packagePath, "utf8");
  return JSON.parse(contents) as PackageInfo;
}
