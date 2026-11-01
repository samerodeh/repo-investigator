import { analyzeDependencies } from "../analyzeDependencies.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const analysis = await analyzeDependencies(repoPath);

console.log("analyzeDependencies worked:", analysis.frameworks.length > 0);
console.log("Frameworks:", analysis.frameworks);
console.log("Runtime dependencies:", analysis.runtime);
console.log("Development dependencies:", analysis.development);
