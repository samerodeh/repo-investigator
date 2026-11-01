import { searchFileName } from "../searchFileName.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";
const query = "test";

const results = await searchFileName(repoPath, query);

console.log("searchFileName worked:", results.length > 0);
console.log("Query:", query);
console.log("Matching files:", results);
