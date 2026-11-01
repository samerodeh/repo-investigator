import { searchRepo } from "./tools/searchRepo.js";
import { readFile } from "./tools/readFile.js";
import { searchFileName } from "./tools/searchFileName.js";
import { listDir } from "./tools/listDir.js";

import { systemPrompt } from "./prompts.js";

import { z } from "zod";

import {tool} from "@langchain/core/tools";
import {ChatOpenAI} from "@langchain/openai";
import {createReactAgent} from "@langchain/langgraph/prebuilt";


const searchRepoTool = tool(
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
    const result = await readFile(repoPath, filePath);
    return result;
  },
  {
    name: "readFile",
    description: "read and return the file contents of that file in the filePath",
    schema: z.object({
      repoPath: z.string(),
      filePath: z.string(),
    }),
  },
);

const searchFileNameTool = tool(
  async ({ repoPath, query }) => {
    const result = await searchFileName(repoPath, query);
    return result;
  },
  {
    name: "search_file_name",
    description: "Search repository file names and return matching paths.",
    schema: z.object({
      repoPath: z.string(),
      query: z.string(),
    }),
  },
);

const listDirTool = tool(
  async ({ repoPath, directoryPath }) => {
    const result = await listDir(repoPath, directoryPath);
    return result;
  },
  {
    name: "list_directory",
    description: "List entries in a repository directory.",
    schema: z.object({
      repoPath: z.string(),
      directoryPath: z.string().optional(),
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
  tools: [searchRepoTool, readFileTool, searchFileNameTool, listDirTool],
  prompt: systemPrompt,
});