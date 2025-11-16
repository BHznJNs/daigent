import type { ProviderType } from "@/types/provider";
import { API_BASE, fetchApi } from "./index";

export async function fetchProviderModels(
  providerType: ProviderType,
  baseUrl: string,
  apiKey: string
): Promise<{ id: string }[]> {
  return await fetchApi(`${API_BASE}/llm/models`, {
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
