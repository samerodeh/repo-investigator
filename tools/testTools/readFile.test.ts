import { readFile } from "../readFile.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";
const filePath = "tools/readFile.ts";

const results = await readFile(repoPath, filePath);

console.log("readFile worked:", results.length > 0);
console.log("Characters read:", results.length);
console.log("First line:", results.split("\n")[0]);