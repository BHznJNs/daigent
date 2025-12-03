export const LlmProviders = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
} as const;

export type LlmProviders = (typeof LlmProviders)[keyof typeof LlmProviders];

export type LlmModelCapability = {
  vision: boolean;
  reasoning: boolean;
  tool_use: boolean;
};

export type LlmModelBase = {
  name: string;
  context_size: number;
  capability: LlmModelCapability;
};

export type LlmModelCreate = LlmModelBase;
export type LlmModelRead = LlmModelBase & { id: number };
export type LlmModelUpdate = LlmModelRead;

export type ProviderBase = {
  name: string;
  type: LlmProviders;
  base_url: string;
  api_key: string;
};

export type ProviderCreate = ProviderBase & { models: LlmModelCreate[] };
export type ProviderRead = ProviderBase & {
  id: number;
  models: LlmModelRead[];
};
export type ProviderUpdate = ProviderBase & {
  models: (LlmModelUpdate | LlmModelCreate)[];
};
