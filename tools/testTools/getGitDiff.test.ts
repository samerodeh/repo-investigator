import { getGitDiff } from "../getGitDiff.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const diff = await getGitDiff(repoPath, "HEAD~1", "HEAD");

console.log("getGitDiff worked:", typeof diff === "string");
console.log("Diff:", diff || "No changes");
