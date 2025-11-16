import type { ProviderType } from "@/types/provider";
import { API_BASE, fetchApi } from "./index";

export async function fetchProviderModels(
  providerType: ProviderType,
  baseUrl: string,
  apiKey: string
): Promise<{ model_id: string }[]> {
  const models = await fetchApi<{ id: string }[]>(`${API_BASE}/llm/models`, {
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
  // rename the field `id` to `model_id` to prevent
  // the conflict with `id` in `LlmModel` model
  return models.map((model) => ({ model_id: model.id }));
}
