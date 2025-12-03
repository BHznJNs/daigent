import type { LlmProviders } from "@/types/provider";
import { API_BASE, fetchApi } from "./index";

export async function fetchProviderModels(
  providerType: LlmProviders,
  baseUrl: string,
  apiKey: string
): Promise<string[]> {
  return await fetchApi<string[]>(`${API_BASE}/llm/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: providerType,
      base_url: baseUrl,
      api_key: apiKey,
    }),
  });
}
