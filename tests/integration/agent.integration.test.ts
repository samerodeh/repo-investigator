import { describe, expect, it } from "vitest";
import { AIMessage } from "@langchain/core/messages";
import {
  BaseChatModel,
  type BindToolsInput,
} from "@langchain/core/language_models/chat_models";
import type {
  BaseMessage,
  BaseMessageChunk,
} from "@langchain/core/messages";
import type { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import type { ChatResult } from "@langchain/core/outputs";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createInvestigatorAgent } from "../../agent.js";

const execFileAsync = promisify(execFile);

class StubChatModel extends BaseChatModel {
  constructor(
    private readonly toolName: string,
    private readonly toolArgs: Record<string, unknown>,
    private readonly responsePrefix: string,
  ) {
    super({});
  }

  bindTools(_tools: BindToolsInput[]) {
    return this;
  }

  _llmType(): string {
    return "stub";
  }

  async _generate(
    messages: BaseMessage[],
    _options: this["ParsedCallOptions"],
    _runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    const hasToolResult = messages.some((message) => message.type === "tool");

    if (!hasToolResult) {
      return {
        generations: [
          {
            text: "",
            message: new AIMessage({
              content: "",
              tool_calls: [
                {
                  name: this.toolName,
                  args: this.toolArgs,
                  id: "tool-call",
                  type: "tool_call",
                },
              ],
            }),
          },
        ],
      };
    }

    const toolResult = messages.at(-1)?.content;
    return {
      generations: [
        {
          text: String(toolResult),
          message: new AIMessage(
            `${this.responsePrefix}: ${String(toolResult)}`,
          ),
        },
      ],
    };
  }

  _streamResponseChunks(
    _messages: BaseMessage[],
    _options: this["ParsedCallOptions"],
    _runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<import("@langchain/core/outputs").ChatGenerationChunk> {
    throw new Error("Streaming is not used by this integration test");
  }
}

async function invokeTool(
  toolName: string,
  toolArgs: Record<string, unknown>,
  question: string,
  responsePrefix: string,
) {
  const agent = createInvestigatorAgent(
    new StubChatModel(toolName, toolArgs, responsePrefix),
  );

  return agent.invoke({
    messages: [{ role: "user", content: question }],
  });
}

describe("investigator agent integration", () => {
  it("executes a model-selected Git history tool and returns its result", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-agent-"),
    );

    try {
      await execFileAsync("git", ["init", "-b", "main"], { cwd: repoPath });
      await fs.writeFile(path.join(repoPath, "README.md"), "fixture");
      await execFileAsync("git", ["add", "."], { cwd: repoPath });
      await execFileAsync(
        "git",
        [
          "-c",
          "user.name=Test User",
          "-c",
          "user.email=test@example.com",
          "commit",
          "-m",
          "fixture commit",
        ],
        { cwd: repoPath },
      );

      const agent = createInvestigatorAgent(
        new StubChatModel(
          "get_git_history",
          { repoPath, limit: 1 },
          "Recent history",
        ),
      );
      const result = await agent.invoke({
        messages: [{ role: "user", content: "Show me the Git history." }],
      });

      expect(result.messages.some((message) => message.type === "tool")).toBe(
        true,
      );
      expect(String(result.messages.at(-1)?.content)).toContain(
        "fixture commit",
      );
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });

  it("executes a model-selected dependency analysis tool and returns its result", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-agent-"),
    );

    try {
      await fs.writeFile(
        path.join(repoPath, "package.json"),
        JSON.stringify({
          dependencies: {
            "@langchain/core": "^1.0.0",
            zod: "^4.0.0",
          },
        }),
      );

      const agent = createInvestigatorAgent(
        new StubChatModel(
          "analyze_dependencies",
          { repoPath },
          "Dependency analysis",
        ),
      );
      const result = await agent.invoke({
        messages: [
          { role: "user", content: "Analyze this project's dependencies." },
        ],
      });

      expect(result.messages.some((message) => message.type === "tool")).toBe(
        true,
      );
      expect(String(result.messages.at(-1)?.content)).toContain("LangChain");
      expect(String(result.messages.at(-1)?.content)).toContain("Zod");
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });

  it("routes filesystem discovery questions through the matching tools", async () => {
    const repoPath = await fs.mkdtemp(
      path.join(os.tmpdir(), "repo-investigator-agent-"),
    );

    try {
      await fs.mkdir(path.join(repoPath, "src"));
      await fs.writeFile(
        path.join(repoPath, "src", "feature.ts"),
        "export function feature() { return true; }\n",
      );
      await fs.writeFile(path.join(repoPath, "src", "feature.test.ts"), "");
      await fs.writeFile(path.join(repoPath, "tsconfig.json"), "{}");

      const listResult = await invokeTool(
        "list_directory",
        { repoPath },
        "List the repository directory.",
        "Directory listing",
      );
      const configResult = await invokeTool(
        "find_config_files",
        { repoPath },
        "Find project configuration files.",
        "Configuration files",
      );
      const symbolResult = await invokeTool(
        "find_symbols",
        { repoPath },
        "Find exported symbols.",
        "Symbols",
      );
      const testResult = await invokeTool(
        "find_tests",
        { repoPath },
        "Find test files.",
        "Tests",
      );

      expect(listResult.messages.some((message) => message.type === "tool")).toBe(
        true,
      );
      expect(String(listResult.messages.at(-1)?.content)).toContain("src");
      expect(String(configResult.messages.at(-1)?.content)).toContain(
        "tsconfig.json",
      );
      expect(String(symbolResult.messages.at(-1)?.content)).toContain(
        "feature",
      );
      expect(String(testResult.messages.at(-1)?.content)).toContain(
        "feature.test.ts",
      );
    } finally {
      await fs.rm(repoPath, { recursive: true, force: true });
    }
  });
});
