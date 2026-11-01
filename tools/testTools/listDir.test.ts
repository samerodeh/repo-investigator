import { listDir } from "../listDir.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const results = await listDir(repoPath);

console.log("listDir worked:", results.length >= 0);
console.log("Entries found:", results.length);
console.log("Entries:", results);
