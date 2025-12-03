import type { LlmProviders, ProviderCreate } from "@/types/provider";

export const PROVIDER_TYPE_LABELS: Record<LlmProviders, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
};

export const PROVIDER_DEFAULT_URLS: Record<LlmProviders, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
};

export const DEFAULT_PROVIDER = {
  name: "",
  type: "openai",
  base_url: "",
  api_key: "",
  models: [],
} satisfies Partial<ProviderCreate>;
