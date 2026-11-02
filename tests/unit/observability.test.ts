import { afterEach, describe, expect, it } from "vitest";
import { createLangfuseHandler } from "../../observability.js";

const originalPublicKey = process.env.LANGFUSE_PUBLIC_KEY;
const originalSecretKey = process.env.LANGFUSE_SECRET_KEY;

afterEach(() => {
  if (originalPublicKey === undefined) {
    delete process.env.LANGFUSE_PUBLIC_KEY;
  } else {
    process.env.LANGFUSE_PUBLIC_KEY = originalPublicKey;
  }

  if (originalSecretKey === undefined) {
    delete process.env.LANGFUSE_SECRET_KEY;
  } else {
    process.env.LANGFUSE_SECRET_KEY = originalSecretKey;
  }
});

describe("createLangfuseHandler", () => {
  it("does not enable tracing without both Langfuse keys", () => {
    delete process.env.LANGFUSE_PUBLIC_KEY;
    delete process.env.LANGFUSE_SECRET_KEY;

    expect(createLangfuseHandler("test-session")).toBeUndefined();
  });

  it("creates a callback handler when both Langfuse keys exist", () => {
    process.env.LANGFUSE_PUBLIC_KEY = "pk-lf-test";
    process.env.LANGFUSE_SECRET_KEY = "sk-lf-test";

    expect(createLangfuseHandler("test-session")).toBeDefined();
  });
});
