import { searchRepo } from "./tools/searchRepo.js";
import { readFile } from "./tools/readFile.js";
import { searchFileName } from "./tools/searchFileName.js";
import { listDir } from "./tools/listDir.js";
import { getPackageInfo } from "./tools/getPackageInfo.js";
import { getGitStatus } from "./tools/getGitStatus.js";
import { getGitHistory } from "./tools/getGitHistory.js";
import { getGitDiff } from "./tools/getGitDiff.js";
import { findConfigFiles } from "./tools/findConfigFiles.js";
import { findSymbols } from "./tools/findSymbols.js";
import { findTests } from "./tools/findTests.js";
import { analyzeDependencies } from "./tools/analyzeDependencies.js";
import { runCommand } from "./tools/runCommand.js";

import { systemPrompt } from "./prompts.js";

import { z } from "zod";

import {tool} from "@langchain/core/tools";
import {ChatOpenAI} from "@langchain/openai";
import type { LanguageModelLike } from "@langchain/core/language_models/base";
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

const getPackageInfoTool = tool(
  async ({ repoPath }) => JSON.stringify(await getPackageInfo(repoPath)),
  {
    name: "get_package_info",
    description: "Read package.json project metadata and dependencies.",
    schema: z.object({ repoPath: z.string() }),
  },
);

const getGitStatusTool = tool(
  async ({ repoPath }) => JSON.stringify(await getGitStatus(repoPath)),
  {
    name: "get_git_status",
    description: "Show the repository branch and working tree changes.",
    schema: z.object({ repoPath: z.string() }),
  },
);

const getGitHistoryTool = tool(
  async ({ repoPath, limit }) =>
    JSON.stringify(await getGitHistory(repoPath, limit)),
  {
    name: "get_git_history",
    description: "Show recent commits from the repository Git history.",
    schema: z.object({
      repoPath: z.string(),
      limit: z.number().int().positive().optional(),
    }),
  },
);

const getGitDiffTool = tool(
  async ({ repoPath, from, to }) => getGitDiff(repoPath, from, to),
  {
    name: "get_git_diff",
    description: "Show Git changes between commits, branches, or the working tree.",
    schema: z.object({
      repoPath: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  },
);

const findConfigFilesTool = tool(
  async ({ repoPath }) => JSON.stringify(await findConfigFiles(repoPath)),
  {
    name: "find_config_files",
    description: "Find common project, build, container, and CI configuration files.",
    schema: z.object({ repoPath: z.string() }),
  },
);

const findSymbolsTool = tool(
  async ({ repoPath }) => JSON.stringify(await findSymbols(repoPath)),
  {
    name: "find_symbols",
    description: "Find exported functions, classes, interfaces, and types.",
    schema: z.object({ repoPath: z.string() }),
  },
);

const findTestsTool = tool(
  async ({ repoPath }) => JSON.stringify(await findTests(repoPath)),
  {
    name: "find_tests",
    description: "Find test and specification files in the repository.",
    schema: z.object({ repoPath: z.string() }),
  },
);

const analyzeDependenciesTool = tool(
  async ({ repoPath }) => JSON.stringify(await analyzeDependencies(repoPath)),
  {
    name: "analyze_dependencies",
    description: "Analyze package dependencies and identify recognized frameworks.",
    schema: z.object({ repoPath: z.string() }),
  },
);

const runCommandTool = tool(
  async ({ repoPath, command }) =>
    JSON.stringify(await runCommand(repoPath, command)),
  {
    name: "run_command",
    description: "Run an allowed repository check such as tests or a build.",
    schema: z.object({
      repoPath: z.string(),
      command: z.enum(["npm test", "npm run build", "npm run lint"]),
    }),
  },
);

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
  timeout: 30000,
});

export function createInvestigatorAgent(llm: LanguageModelLike = model) {
  return createReactAgent({
    llm,
    tools: [
      searchRepoTool,
      readFileTool,
      searchFileNameTool,
      listDirTool,
      getPackageInfoTool,
      getGitStatusTool,
      getGitHistoryTool,
      getGitDiffTool,
      findConfigFilesTool,
      findSymbolsTool,
      findTestsTool,
      analyzeDependenciesTool,
      runCommandTool,
    ],
    prompt: systemPrompt,
  });
}

export const investigatorAgent = createInvestigatorAgent();