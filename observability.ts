import { CallbackHandler } from "@langfuse/langchain";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";

let langfuseSdk: NodeSDK | undefined;

export function setupLangfuseTracing(): NodeSDK | undefined {
  if (
    !process.env.LANGFUSE_PUBLIC_KEY ||
    !process.env.LANGFUSE_SECRET_KEY ||
    langfuseSdk
  ) {
    return langfuseSdk;
  }

  langfuseSdk = new NodeSDK({
    serviceName: "repo-investigator",
    spanProcessors: [new LangfuseSpanProcessor()],
  });
  langfuseSdk.start();
  return langfuseSdk;
}

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
