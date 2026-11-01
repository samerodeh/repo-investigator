import { searchRepo } from "../searchRepo.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";
const query = "agent";

const results = await searchRepo(repoPath, query);

console.log("searchRepo worked:", results.length > 0);
console.log("Query:", query);
console.log("Matching files:", results);
