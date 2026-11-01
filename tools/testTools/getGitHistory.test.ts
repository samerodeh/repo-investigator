import { getGitHistory } from "../getGitHistory.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const history = await getGitHistory(repoPath, 5);

console.log("getGitHistory worked:", history.length > 0);
console.log("Commits returned:", history.length);
console.log("Recent commits:", history);
