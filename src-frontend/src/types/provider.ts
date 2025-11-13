export const ProviderType = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
} as const;

export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType];

export type LlmModelCapability = {
  vision: boolean;
  reasoning: boolean;
  tool_use: boolean;
};

export type LlmModel = {
  name: string;
  context_size: number;
  capability: LlmModelCapability;
};

export type Provider = {
  id: number;
  name: string;
  type: ProviderType;
  base_url: string;
  api_key: string;
  models: LlmModel[];
};
