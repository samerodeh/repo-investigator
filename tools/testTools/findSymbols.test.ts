import { findSymbols } from "../findSymbols.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const symbols = await findSymbols(repoPath);

console.log("findSymbols worked:", symbols.length > 0);
console.log("Exported symbols:", symbols);
