import { getGitStatus } from "../getGitStatus.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const status = await getGitStatus(repoPath);

console.log("getGitStatus worked:", status.branch.startsWith("##"));
console.log("Branch:", status.branch);
console.log("Changes:", status.changes);
