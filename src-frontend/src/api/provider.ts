import type { Provider } from "@/types/provider";
import { API_BASE, fetchApi } from "./index";

export async function fetchProviders(): Promise<Provider[]> {
  return await fetchApi<Provider[]>(`${API_BASE}/providers`);
}

export async function createProvider(
  providerData: Omit<Provider, "id">
): Promise<Provider> {
  return await fetchApi<Provider>(`${API_BASE}/providers/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(providerData),
  });
}

export async function updateProvider(
  providerId: number,
  providerData: Partial<Omit<Provider, "id">>
): Promise<Provider> {
  return await fetchApi<Provider>(`${API_BASE}/providers/${providerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(providerData),
  });
}

export async function deleteProvider(providerId: number): Promise<void> {
  await fetch(`${API_BASE}/providers/${providerId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
