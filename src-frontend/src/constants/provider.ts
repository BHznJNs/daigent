import type { ProviderCreate, ProviderType } from "@/types/provider";

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
};

export const PROVIDER_DEFAULT_URLS: Record<ProviderType, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
};

export const DEFAULT_PROVIDER = {
  name: "",
  type: "openai" as ProviderType,
  base_url: "",
  api_key: "",
  models: [],
} satisfies Partial<ProviderCreate>;
