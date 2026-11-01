import { getPackageInfo } from "./getPackageInfo.js";

export interface DependencyAnalysis {
  runtime: Record<string, string>;
  development: Record<string, string>;
  frameworks: string[];
}

const frameworkNames: Record<string, string> = {
  "@langchain/core": "LangChain",
  "@langchain/langgraph": "LangGraph",
  "@langchain/openai": "OpenAI",
  express: "Express",
  react: "React",
  next: "Next.js",
  zod: "Zod",
};

export async function analyzeDependencies(
  repoPath: string,
): Promise<DependencyAnalysis> {
  const packageInfo = await getPackageInfo(repoPath);
  const runtime = packageInfo.dependencies ?? {};
  const development = packageInfo.devDependencies ?? {};
  const allDependencies = { ...runtime, ...development };

  return {
    runtime,
    development,
    frameworks: Object.keys(allDependencies)
      .filter((name) => frameworkNames[name])
      .map((name) => frameworkNames[name]),
  };
}
