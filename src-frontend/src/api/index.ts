const port = globalThis.__INJECTED__.server_port;
export const API_BASE = `http://localhost:${port}/api`;

export async function fetchApi<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (res.ok) {
    return res.json();
  }

  let errorMessage: string;
  try {
    // backend error body: { error: xxx }
    const body = await res.json();
    errorMessage = body?.error ?? `HTTP_${res.status}`;
  } catch {
    errorMessage = res.statusText || `HTTP_${res.status}`;
  }
  throw new Error(errorMessage);
}
