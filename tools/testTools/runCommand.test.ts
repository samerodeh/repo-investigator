import { runCommand } from "../runCommand.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const result = await runCommand(repoPath, "npm run build");

console.log("runCommand worked:", result.exitCode === 0);
console.log("Command:", result.command);
console.log("Exit code:", result.exitCode);
console.log("Output:", result.stdout || result.stderr || "No output");
