import { getPackageInfo } from "../getPackageInfo.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const packageInfo = await getPackageInfo(repoPath);

console.log("getPackageInfo worked:", typeof packageInfo.name === "string");
console.log("Project:", packageInfo.name);
console.log("Type:", packageInfo.type);
console.log("Scripts:", packageInfo.scripts);
console.log("Dependencies:", packageInfo.dependencies);
console.log("Dev dependencies:", packageInfo.devDependencies);
