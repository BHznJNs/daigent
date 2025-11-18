import type { LlmModelRead } from "@/types/provider";
import { API_BASE, fetchApi } from "./index";

export function getModel(modelId: number) {
  return fetchApi<LlmModelRead>(`${API_BASE}/llm_models/${modelId}`);
}
