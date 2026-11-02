import { CallbackHandler } from "@langfuse/langchain";

export function createLangfuseHandler(sessionId: string): CallbackHandler | undefined {
  if (
    !process.env.LANGFUSE_PUBLIC_KEY ||
    !process.env.LANGFUSE_SECRET_KEY
  ) {
    return undefined;
  }

  return new CallbackHandler({
    sessionId,
    tags: ["repo-investigator"],
  });
}
