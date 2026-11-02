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

export async function shutdownLangfuseTracing(): Promise<void> {
  if (!langfuseSdk) {
    return;
  }

  const sdk = langfuseSdk;
  langfuseSdk = undefined;
  await sdk.shutdown();
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
    version: process.env.npm_package_version ?? "1.0.0",
    tags: ["repo-investigator"],
    traceMetadata: {
      application: "repo-investigator",
      environment:
        process.env.LANGFUSE_TRACING_ENVIRONMENT ?? "development",
    },
  });
}
