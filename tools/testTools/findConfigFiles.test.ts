import { findConfigFiles } from "../findConfigFiles.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const configFiles = await findConfigFiles(repoPath);

console.log("findConfigFiles worked:", configFiles.length > 0);
console.log("Configuration files:", configFiles);
