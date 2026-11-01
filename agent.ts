import { searchRepo } from "./tools/searchRepo.js";
import { readFile } from "./tools/readFile.js";
import { systemPrompt } from "./prompts.js";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";


const searchRepository = tool(
  async ({ repoPath, query }) => {
    const files = await searchRepo(repoPath, query);
    return JSON.stringify({ query, files });
  },
  {
    name: "search_repository",
    description: "Search a local repository for files containing a text query.",
    schema: z.object({
      repoPath: z.string(),
      query: z.string(),
    }),
  },
);

const readFileTool = tool(
  async ({ repoPath, filePath }) => {
    return await readFile(repoPath, filePath);
  },
  {
    name: "readFile",
    description: "Read and return the contents of a file inside a repository.",
    schema: z.object({
      repoPath: z.string(),
      filePath: z.string(),
    }),
  },
);

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
  timeout: 30000,
});

export const investigatorAgent = createReactAgent({
  llm: model,
  tools: [searchRepository, readFileTool],
  prompt: systemPrompt,
});