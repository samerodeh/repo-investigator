import { searchRepo } from "./tools/searchRepo.js";
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

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
  timeout: 30000,
});

export const investigatorAgent = createReactAgent({
  llm: model,
  tools: [searchRepository],
  prompt:
    "You investigate local repositories. Use search_repository when needed. " +
    "Only make claims supported by tool results.",
});