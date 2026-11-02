import "dotenv/config";

import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { randomUUID } from "node:crypto";
import { investigatorAgent } from "./agent.js";
import {
  createLangfuseHandler,
  setupLangfuseTracing,
  shutdownLangfuseTracing,
} from "./observability.js";

const repoPath =
  "C:\\Users\\Samer\\OneDrive\\Desktop\\code\\projects\\repo_investigator";

const readline = createInterface({ input, output });
const question = await readline.question("What would you like to investigate? ");
readline.close();

console.log("Starting investigator...");

try {
  const langfuseSdk = setupLangfuseTracing();
  const langfuseHandler = createLangfuseHandler(randomUUID());
  const invokeConfig = langfuseHandler
    ? {
        recursionLimit: 8,
        runName: "repo-investigation",
        metadata: { application: "repo-investigator" },
        callbacks: [langfuseHandler],
      }
    : { recursionLimit: 8 };

  const result = await investigatorAgent.invoke({
    messages: [
      {
        role: "user",
        content:
          `Repository: ${repoPath}\n` +
          `Question: ${question}`,
      },
    ],
  }, invokeConfig);

  console.log(result.messages.at(-1)?.content);
  if (langfuseSdk) {
    await shutdownLangfuseTracing();
  }
} catch (error) {
  console.error("Investigator failed:", error);
  await shutdownLangfuseTracing();
  process.exitCode = 1;
}
