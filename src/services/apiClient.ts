import { auth } from "../lib/firebase/auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

console.info("[ScrapSmart] API base URL", {
  configured: Boolean(API_BASE_URL),
  value: API_BASE_URL || null,
});

if (API_BASE_URL) {
  fetch(`${API_BASE_URL}/api/health`)
    .then((response) => {
      console.info("[ScrapSmart] Backend health check", {
        ok: response.ok,
        status: response.status,
      });
    })
    .catch((error) => {
      console.warn("[ScrapSmart] Backend health check failed", error);
    });
}

async function getAuthHeaders() {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken(true) : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API is not configured. Set VITE_API_BASE_URL.");
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? `API request failed (${response.status}).`);
  }

  return payload as T;
}
