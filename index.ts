import "dotenv/config";

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { randomUUID } from "node:crypto";
import { investigatorAgent } from "./agent.js";
import { createLangfuseHandler } from "./observability.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const readline = createInterface({ input, output });
const question = await readline.question("What would you like to investigate? ");
readline.close();

console.log("Starting investigator...");

try {
  const langfuseHandler = createLangfuseHandler(randomUUID());
  const result = await investigatorAgent.invoke({
    messages: [
      {
        role: "user",
        content:
          `Repository: ${repoPath}\n` +
          `Question: ${question}`,
      },
    ],
  }, {
    recursionLimit: 8,
    callbacks: langfuseHandler ? [langfuseHandler] : undefined,
  });

  console.log(result.messages.at(-1)?.content);
} catch (error) {
  console.error("Investigator failed:", error);
  process.exitCode = 1;
}
