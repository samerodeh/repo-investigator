import { findTests } from "../findTests.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const tests = await findTests(repoPath);

console.log("findTests worked:", tests.length > 0);
console.log("Test files:", tests);
